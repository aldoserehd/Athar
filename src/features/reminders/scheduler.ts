import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  addZonedCalendarDays,
  computeTimes,
  formatZonedTime,
  type ComputedTimes,
  type PrayerCalculationProfile,
  zonedClockOnDay,
} from '@/features/prayer';
import { INSPIRATION } from '@/features/inspiration';
import { SALAH_ORDER, type SalahKey } from '@/features/salah';
import { randomAthkarSequence } from './athkar';
import { reciterName } from './reciters';

const IS_EXPO_GO = Constants.appOwnership === 'expo';
const ANDROID_CHANNEL = 'athar-reminders';
const OWNED_IDS_KEY = 'athar.reminders.scheduled-ids.v2';
const DEFAULT_HORIZON_DAYS = 7;
const IOS_NOTIFICATION_BUDGET = 60;

export type AthkarMode = 'afterPrayer' | 'night' | 'spread';
export type SchedulerPlatform = 'ios' | 'android' | 'web';

export type PrayerCalc = {
  latitude: number;
  longitude: number;
  timezone: string;
  profile: PrayerCalculationProfile;
};

export type LockSettings = {
  enabled: boolean;
  prayers: Record<SalahKey, boolean>;
  snoozeMinutes: number;
  graceMinutes: number;
};

export type ReminderSettings = {
  adhanEnabled: boolean;
  prayers: Record<SalahKey, boolean>;
  reciterId: string;
  prayerReciters: Record<SalahKey, string>;
  athkarEnabled: boolean;
  athkarHour: number;
  athkarMinute: number;
  athkarPerDay: number;
  athkarRandomize: boolean;
  athkarMode: AthkarMode;
  inspiringContent: boolean;
  lock: LockSettings;
};

export type ReminderMessages = {
  prayerName: (key: SalahKey) => string;
  adhanTitle: (name: string, time: string) => string;
  adhanBody: string;
  athkarTitle: string;
  language: string;
};

export type PlannedNotification = {
  ownerKey: string;
  request: Notifications.NotificationRequestInput;
};

export type ReminderCommitDependencies = {
  loadOwnedIds: () => Promise<string[]>;
  saveOwnedIds: (ids: string[]) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  schedule: (request: Notifications.NotificationRequestInput) => Promise<string>;
};

export type ScheduleResult = {
  scheduled: number;
  stale: boolean;
  errors: string[];
};

function inspirationLine(language: string, seed: number): string {
  const item = INSPIRATION[Math.abs(seed) % INSPIRATION.length];
  const text = language === 'ar' ? item.arabic : item.english;
  const reference = language === 'ar' ? item.referenceAr : item.reference;
  return `${text}\n— ${reference}`;
}

function clockLabel(date: Date, language: string, timezone: string): string {
  return formatZonedTime(date, timezone, true, language);
}

function daySeed(date: Date, timezone: string): number {
  const key = new Intl.DateTimeFormat('en-CA-u-ca-gregory', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return key.split('-').reduce((seed, value) => seed * 100 + Number(value), 0);
}

function enabledEventsPerDay(settings: ReminderSettings): number {
  const adhanCount = settings.adhanEnabled
    ? SALAH_ORDER.filter((key) => settings.prayers[key]).length
    : 0;
  const requestedAthkar = Math.max(1, Math.min(6, Math.round(settings.athkarPerDay || 1)));
  const athkarCount = settings.athkarEnabled
    ? settings.athkarMode === 'afterPrayer'
      ? Math.max(5, requestedAthkar)
      : requestedAthkar
    : 0;
  return adhanCount + athkarCount;
}

export function calculateScheduleHorizon(
  settings: ReminderSettings,
  platform: SchedulerPlatform,
): number {
  const perDay = enabledEventsPerDay(settings);
  if (perDay === 0) return 0;
  if (platform !== 'ios') return DEFAULT_HORIZON_DAYS;
  return Math.max(1, Math.min(DEFAULT_HORIZON_DAYS, Math.floor(IOS_NOTIFICATION_BUDGET / perDay)));
}

function athkarFireTimes(
  mode: AthkarMode,
  day: Date,
  timezone: string,
  perDay: number,
  baseMinutes: number,
  times: ComputedTimes | null,
): Date[] {
  if (mode === 'afterPrayer' && times) {
    return times.slots
      .filter((slot) => slot.isPrayer)
      .map((slot) => new Date(slot.time.getTime() + 20 * 60_000));
  }

  if (mode === 'night') {
    const start = 19 * 60;
    const end = 22 * 60 + 30;
    if (perDay <= 1) return [zonedClockOnDay(day, timezone, start)];
    const step = (end - start) / (perDay - 1);
    return Array.from({ length: perDay }, (_, index) =>
      zonedClockOnDay(day, timezone, Math.round(start + index * step)),
    );
  }

  return Array.from({ length: perDay }, (_, index) =>
    zonedClockOnDay(day, timezone, baseMinutes + index * 150),
  );
}

function dateTrigger(date: Date, channelId?: string): Notifications.NotificationTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId,
  };
}

export function buildReminderPlan(
  settings: ReminderSettings,
  calc: PrayerCalc | null,
  messages: ReminderMessages,
  now: Date,
  platform: SchedulerPlatform,
): PlannedNotification[] {
  if ((!settings.adhanEnabled && !settings.athkarEnabled) || !calc) return [];

  const horizon = calculateScheduleHorizon(settings, platform);
  const dayTables = Array.from({ length: horizon }, (_, day) => {
    const dayInstant = addZonedCalendarDays(now, calc.timezone, day);
    return {
      dayInstant,
      times: computeTimes(
        calc.latitude,
        calc.longitude,
        calc.timezone,
        calc.profile,
        dayInstant,
      ),
    };
  });
  const plan: PlannedNotification[] = [];

  if (settings.adhanEnabled) {
    for (const { times } of dayTables) {
      for (const slot of times.slots) {
        if (!slot.isPrayer) continue;
        const key = slot.name as SalahKey;
        if (!settings.prayers[key] || slot.time.getTime() <= now.getTime()) continue;
        const reciter = settings.prayerReciters?.[key] ?? settings.reciterId;
        const ownerKey = `adhan:${times.dateKey}:${key}`;
        const channelId = platform === 'android' ? `adhan-${reciter}` : undefined;
        plan.push({
          ownerKey,
          request: {
            content: {
              title: messages.adhanTitle(
                messages.prayerName(key),
                clockLabel(slot.time, messages.language, calc.timezone),
              ),
              body: settings.inspiringContent
                ? inspirationLine(messages.language, daySeed(slot.time, calc.timezone) + SALAH_ORDER.indexOf(key))
                : messages.adhanBody,
              sound: IS_EXPO_GO ? 'default' : `${reciter}_30.wav`,
              data: { type: 'adhan', reciter, atharOwner: 'reminders-v2', ownerKey },
            },
            trigger: dateTrigger(slot.time, channelId),
          },
        });
      }
    }
  }

  if (settings.athkarEnabled) {
    const perDay = Math.max(1, Math.min(6, Math.round(settings.athkarPerDay || 1)));
    const baseMinutes = settings.athkarHour * 60 + settings.athkarMinute;
    for (const { dayInstant, times } of dayTables) {
      const seed = daySeed(dayInstant, calc.timezone);
      const fireTimes = athkarFireTimes(
        settings.athkarMode ?? 'spread',
        dayInstant,
        calc.timezone,
        perDay,
        baseMinutes,
        times,
      );
      const sequence = randomAthkarSequence(fireTimes.length, seed);
      fireTimes.forEach((when, index) => {
        if (when.getTime() <= now.getTime()) return;
        const dhikr = sequence[index];
        const dhikrText = messages.language === 'ar' ? dhikr.arabic : dhikr.translation;
        const ownerKey = `athkar:${times.dateKey}:${index}`;
        plan.push({
          ownerKey,
          request: {
            content: {
              title: `${messages.athkarTitle} ✨`,
              body: settings.inspiringContent
                ? `${dhikrText}\n${inspirationLine(messages.language, seed + index)}`
                : dhikrText,
              sound: 'default',
              data: { type: 'athkar', atharOwner: 'reminders-v2', ownerKey },
            },
            trigger: dateTrigger(
              when,
              platform === 'android' ? ANDROID_CHANNEL : undefined,
            ),
          },
        });
      });
    }
  }

  return plan;
}

const defaultDependencies: ReminderCommitDependencies = {
  loadOwnedIds: async () => {
    try {
      const raw = await AsyncStorage.getItem(OWNED_IDS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  },
  saveOwnedIds: (ids) => AsyncStorage.setItem(OWNED_IDS_KEY, JSON.stringify(ids)),
  cancel: (id) => Notifications.cancelScheduledNotificationAsync(id),
  schedule: (request) => Notifications.scheduleNotificationAsync(request),
};

let requestedGeneration = 0;
let commitQueue: Promise<ScheduleResult> = Promise.resolve({
  scheduled: 0,
  stale: false,
  errors: [],
});

async function cancelIds(ids: string[], dependencies: ReminderCommitDependencies): Promise<void> {
  await Promise.all(ids.map((id) => dependencies.cancel(id).catch(() => undefined)));
}

async function commitReminderPlan(
  plan: PlannedNotification[],
  generation: number,
  dependencies: ReminderCommitDependencies,
): Promise<ScheduleResult> {
  const stale = () => generation !== requestedGeneration;
  if (stale()) return { scheduled: 0, stale: true, errors: [] };

  const previousIds = await dependencies.loadOwnedIds();
  if (stale()) return { scheduled: 0, stale: true, errors: [] };
  for (const id of previousIds) {
    await dependencies.cancel(id).catch(() => undefined);
    if (stale()) return { scheduled: 0, stale: true, errors: [] };
  }

  const scheduledIds: string[] = [];
  const errors: string[] = [];
  for (const item of plan) {
    if (stale()) {
      await cancelIds(scheduledIds, dependencies);
      return { scheduled: 0, stale: true, errors };
    }
    try {
      const id = await dependencies.schedule(item.request);
      scheduledIds.push(id);
      if (stale()) {
        await cancelIds(scheduledIds, dependencies);
        return { scheduled: 0, stale: true, errors };
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (stale()) {
    await cancelIds(scheduledIds, dependencies);
    return { scheduled: 0, stale: true, errors };
  }
  await dependencies.saveOwnedIds(scheduledIds);
  return { scheduled: scheduledIds.length, stale: false, errors };
}

export function queueReminderCommit(
  plan: PlannedNotification[],
  dependencies: ReminderCommitDependencies = defaultDependencies,
): Promise<ScheduleResult> {
  const generation = ++requestedGeneration;
  const next = commitQueue
    .catch(() => ({ scheduled: 0, stale: false, errors: [] }))
    .then(() => commitReminderPlan(plan, generation, dependencies));
  commitQueue = next;
  return next;
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAdhan = notification.request.content.data?.type === 'adhan';
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isAdhan,
      shouldSetBadge: false,
    };
  },
});

export async function ensurePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: 'Athar reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

async function prepareAndroidChannels(settings: ReminderSettings): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: 'Athar reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
  if (!settings.adhanEnabled) return;
  const reciters = new Set(
    SALAH_ORDER.filter((key) => settings.prayers[key]).map(
      (key) => settings.prayerReciters?.[key] ?? settings.reciterId,
    ),
  );
  for (const reciter of reciters) {
    await Notifications.setNotificationChannelAsync(`adhan-${reciter}`, {
      name: `Adhān — ${reciterName(reciter)}`,
      importance: Notifications.AndroidImportance.HIGH,
      sound: IS_EXPO_GO ? 'default' : `${reciter}_30.wav`,
    });
  }
}

export async function applyReminders(
  settings: ReminderSettings,
  calc: PrayerCalc | null,
  messages: ReminderMessages,
): Promise<ScheduleResult> {
  await prepareAndroidChannels(settings);
  const platform: SchedulerPlatform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
  const plan = buildReminderPlan(settings, calc, messages, new Date(), platform);
  return queueReminderCommit(plan);
}
