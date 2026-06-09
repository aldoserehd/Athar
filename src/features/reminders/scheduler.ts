import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { ComputedTimes } from '@/features/prayer';
import { SalahKey } from '@/features/salah';
import { randomInspiration } from '@/features/inspiration';
import { randomAthkarSequence } from './athkar';
import { reciterName } from './reciters';

/** Prayer-Lock options (the cross-platform commitment gate; see lock feature). */
export type LockSettings = {
  enabled: boolean;
  /** Which prayers should raise the gate. */
  prayers: Record<SalahKey, boolean>;
  /** Snooze length in minutes for "Remind me later". */
  snoozeMinutes: number;
  /** Minutes after the prayer time before the gate appears (grace period). */
  graceMinutes: number;
};

export type ReminderSettings = {
  adhanEnabled: boolean;
  prayers: Record<SalahKey, boolean>;
  reciterId: string;
  athkarEnabled: boolean;
  athkarHour: number;
  athkarMinute: number;
  /** How many athkār reminders to schedule per day (spread across the day). */
  athkarPerDay: number;
  /** Shuffle the daily athkār selection (vs. a fixed rotation). */
  athkarRandomize: boolean;
  /** Append a short inspiring hadith/ayah/dua to reminder bodies. */
  inspiringContent: boolean;
  /** Prayer-Lock commitment gate. */
  lock: LockSettings;
};

const ANDROID_CHANNEL = 'athar-reminders';

/** Localized text for the scheduled notifications (built by the caller via t). */
export type ReminderMessages = {
  prayerName: (key: SalahKey) => string;
  adhanTitle: (name: string) => string;
  adhanBody: (reciter: string) => string;
  athkarTitle: string;
  /** Current language code, so inspiration is surfaced in the right language. */
  language: string;
};

/** A short inspiring line for a notification body, in the user's language. */
function inspiringLine(language: string): string {
  const item = randomInspiration();
  const text = language === 'ar' ? item.arabic : item.english;
  const ref = language === 'ar' ? item.referenceAr : item.reference;
  return `${text}\n— ${ref}`;
}

/** Local day index (days since epoch) — stable per calendar day for seeding. */
function dayIndex(d: Date): number {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);
}

Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    // Adhān: don't play the short alert sound in-foreground — we play the full
    // adhān in-app instead (see ReminderScheduler). Locked/background still uses
    // the bundled 30s clip via the OS.
    const isAdhan = n.request.content.data?.type === 'adhan';
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
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}

/**
 * Rebuild all scheduled notifications from the current settings + prayer times.
 * Adhān prayers repeat daily at their clock time; athkār is scheduled as a week
 * of one-off notifications (each a different random dhikr) and refreshed on app
 * open so it varies day to day.
 */
export async function applyReminders(
  settings: ReminderSettings,
  times: ComputedTimes | null,
  messages: ReminderMessages
): Promise<void> {
  await cancelAll();
  if (!settings.adhanEnabled && !settings.athkarEnabled) return;

  const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL : undefined;

  // Adhān — daily repeating per enabled prayer, with a 30s adhān clip as the
  // alert sound (plays on the lock screen). On Android the sound lives on a
  // per-reciter channel; on iOS it's referenced per-notification.
  if (settings.adhanEnabled && times) {
    const soundFile = `${settings.reciterId}_30.wav`;
    let adhanChannel = channelId;
    if (Platform.OS === 'android') {
      adhanChannel = `adhan-${settings.reciterId}`;
      await Notifications.setNotificationChannelAsync(adhanChannel, {
        name: `Adhān — ${reciterName(settings.reciterId)}`,
        importance: Notifications.AndroidImportance.HIGH,
        sound: soundFile,
      });
    }
    for (const slot of times.slots) {
      if (!slot.isPrayer) continue;
      const key = slot.name as SalahKey;
      if (!settings.prayers[key]) continue;
      const adhanBody = settings.inspiringContent
        ? `${messages.adhanBody(reciterName(settings.reciterId))}\n${inspiringLine(messages.language)}`
        : messages.adhanBody(reciterName(settings.reciterId));
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${messages.adhanTitle(messages.prayerName(key))} 🕌`,
          body: adhanBody,
          sound: soundFile,
          data: { type: 'adhan' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.time.getHours(),
          minute: slot.time.getMinutes(),
          channelId: adhanChannel,
        },
      });
    }
  }

  // Athkār — scheduled as one-off notifications over the next 7 days. Each day
  // gets `athkarPerDay` reminders spread across the day, and the selection is
  // re-seeded per calendar day so the user genuinely sees fresh variety. We
  // schedule a horizon of days because reschedule also runs on every app open.
  if (settings.athkarEnabled) {
    const now = new Date();
    const perDay = Math.max(1, Math.min(6, Math.round(settings.athkarPerDay || 1)));
    const HORIZON_DAYS = 7;
    // Spread the chosen times across the active waking window, anchored at the
    // user's base time, then every ~2.5h after it.
    const baseMinutes = settings.athkarHour * 60 + settings.athkarMinute;
    const stepMinutes = 150; // 2.5 hours between athkār through the day

    for (let day = 0; day < HORIZON_DAYS; day++) {
      const seedDate = new Date(now);
      seedDate.setDate(now.getDate() + day);
      // Random when enabled; otherwise a stable daily rotation (still varies by day).
      const seq = settings.athkarRandomize
        ? randomAthkarSequence(perDay)
        : randomAthkarSequence(perDay, dayIndex(seedDate));

      for (let n = 0; n < perDay; n++) {
        const when = new Date(now);
        when.setDate(now.getDate() + day);
        const total = baseMinutes + n * stepMinutes;
        when.setHours(Math.floor(total / 60) % 24, total % 60, 0, 0);
        if (when.getTime() <= now.getTime()) continue; // skip past times
        const dhikr = seq[n];
        const body = settings.inspiringContent
          ? `${dhikr.arabic}\n${dhikr.translation}\n${inspiringLine(messages.language)}`
          : `${dhikr.arabic}\n${dhikr.translation}`;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${messages.athkarTitle} ✨`,
            body,
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: when,
            channelId,
          },
        });
      }
    }
  }
}
