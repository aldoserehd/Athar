import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { computeTimes, ComputedTimes, MadhabKey, MethodKey } from '@/features/prayer';
import { SalahKey, SALAH_ORDER } from '@/features/salah';
import { randomInspiration } from '@/features/inspiration';
import { randomAthkarSequence } from './athkar';
import { reciterName } from './reciters';

/**
 * Custom 30-second adhān clips only play from a real dev/production build (they
 * are bundled by the expo-notifications config plugin). Expo Go can't bundle
 * them, so notifications there are silent — fall back to the system sound so the
 * phone always makes a sound when a reminder arrives.
 */
const IS_EXPO_GO = Constants.appOwnership === 'expo';

/** How random athkār reminders are delivered through the day. */
export type AthkarMode = 'afterPrayer' | 'night' | 'spread';

/** Inputs needed to compute prayer times for any future day, on-device. */
export type PrayerCalc = {
  latitude: number;
  longitude: number;
  method: MethodKey;
  madhab: MadhabKey;
};

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
  /** Default adhān voice (applied to all prayers, and to any without an override). */
  reciterId: string;
  /** Per-prayer adhān voice — each prayer can use a different reciter's call. */
  prayerReciters: Record<SalahKey, string>;
  athkarEnabled: boolean;
  athkarHour: number;
  athkarMinute: number;
  /** How many athkār reminders to schedule per day (spread/night modes). */
  athkarPerDay: number;
  /** Shuffle the daily athkār selection (vs. a fixed rotation). */
  athkarRandomize: boolean;
  /** When athkār reminders are delivered through the day. */
  athkarMode: AthkarMode;
  /** Append a short inspiring hadith/ayah/dua to reminder bodies. */
  inspiringContent: boolean;
  /** Prayer-Lock commitment gate. */
  lock: LockSettings;
};

const ANDROID_CHANNEL = 'athar-reminders';

/** How many days ahead we schedule one-off notifications (refreshed on app open). */
const HORIZON_DAYS = 7;

/** Localized text for the scheduled notifications (built by the caller via t). */
export type ReminderMessages = {
  prayerName: (key: SalahKey) => string;
  adhanTitle: (name: string, time: string) => string;
  /** Simple fallback body when inspiring content is turned off. */
  adhanBody: string;
  athkarTitle: string;
  /** Current language code, so reminders are surfaced in the right language. */
  language: string;
};

/** A short inspiring line for a notification body, in the user's language. */
function inspiringLine(language: string): string {
  // Prefer a concise item so the notification stays short and readable.
  let best = randomInspiration();
  const len = (it: ReturnType<typeof randomInspiration>) =>
    (language === 'ar' ? it.arabic : it.english).length;
  for (let i = 0; i < 3; i++) {
    const cand = randomInspiration();
    if (len(cand) < len(best)) best = cand;
  }
  const text = language === 'ar' ? best.arabic : best.english;
  const ref = language === 'ar' ? best.referenceAr : best.reference;
  return `${text}\n— ${ref}`;
}

/** Compact clock label for a prayer time, localized to Arabic-Indic digits. */
function clockLabel(d: Date, language: string): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const hour12 = ((h + 11) % 12) + 1;
  let s = `${hour12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  if (language === 'ar') {
    s = s
      .replace(/[0-9]/g, (n) => '٠١٢٣٤٥٦٧٨٩'[Number(n)])
      .replace('AM', 'ص')
      .replace('PM', 'م');
  }
  return s;
}

/** Local day index (days since epoch) — stable per calendar day for seeding. */
function dayIndex(d: Date): number {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);
}

/**
 * Build the firing Date(s) for one day's athkār according to the delivery mode:
 *  - afterPrayer: a dhikr shortly after each prayer time (needs that day's times),
 *  - night:       spread across the evening/night window,
 *  - spread:      anchored at the user's base time, every ~2.5h (the default).
 */
function athkarFireTimes(
  mode: AthkarMode,
  dayDate: Date,
  perDay: number,
  baseMinutes: number,
  times: ComputedTimes | null
): Date[] {
  const at = (minutes: number): Date => {
    const d = new Date(dayDate);
    d.setHours(Math.floor(minutes / 60) % 24, minutes % 60, 0, 0);
    return d;
  };

  if (mode === 'afterPrayer' && times) {
    // ~20 minutes after each of the day's five prayers.
    const OFFSET_MS = 20 * 60_000;
    return times.slots
      .filter((s) => s.isPrayer)
      .map((s) => new Date(s.time.getTime() + OFFSET_MS));
  }

  if (mode === 'night') {
    // Spread evenly across the evening/night window (19:00 – 22:30).
    const START = 19 * 60;
    const END = 22 * 60 + 30;
    if (perDay <= 1) return [at(START)];
    const step = (END - START) / (perDay - 1);
    return Array.from({ length: perDay }, (_, n) => at(Math.round(START + n * step)));
  }

  // spread (default, and the fallback when afterPrayer has no times).
  const STEP = 150; // 2.5 hours between athkār through the day
  return Array.from({ length: perDay }, (_, n) => at(baseMinutes + n * STEP));
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
 * Rebuild all scheduled notifications from the current settings + location.
 *
 * Both adhān and athkār are scheduled as one-off DATE notifications over the next
 * `HORIZON_DAYS`, using each day's ACTUAL on-device prayer times. Prayer times
 * shift a little every day, so a single repeating DAILY trigger would drift and
 * fire at the wrong time on later days — computing each day's real time fixes it.
 * The scheduler re-runs on every app open / day rollover, so the horizon stays
 * topped up and the athkār selection stays fresh.
 */
export async function applyReminders(
  settings: ReminderSettings,
  calc: PrayerCalc | null,
  messages: ReminderMessages
): Promise<void> {
  await cancelAll();
  if (!settings.adhanEnabled && !settings.athkarEnabled) return;

  const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL : undefined;
  const now = new Date();

  // Compute each day's prayer times once up front; reused by adhān and by the
  // "afterPrayer" athkār mode. Each day uses the device's local timezone.
  const dayTimes: (ComputedTimes | null)[] = [];
  for (let day = 0; day < HORIZON_DAYS; day++) {
    if (!calc) {
      dayTimes.push(null);
      continue;
    }
    const d = new Date(now);
    d.setDate(now.getDate() + day);
    dayTimes.push(computeTimes(calc.latitude, calc.longitude, calc.method, calc.madhab, d));
  }

  // Adhān — one-off per enabled prayer for each day in the horizon, fired at that
  // day's real computed time. A 30s adhān clip is the alert sound (plays on the
  // lock screen): on Android it lives on a per-reciter channel; on iOS it's
  // referenced per-notification.
  if (settings.adhanEnabled && calc) {
    // Each prayer can use its own reciter's call (falls back to the default voice).
    // Real builds play that reciter's bundled 30s adhān clip as the alert sound, so
    // it's unmistakably the adhān even from another room; Expo Go can't bundle custom
    // sounds, so it uses the reliable system sound instead.
    const reciterFor = (key: SalahKey) => settings.prayerReciters?.[key] ?? settings.reciterId;
    const soundFor = (recId: string) => (IS_EXPO_GO ? 'default' : `${recId}_30.wav`);

    // On Android the sound is fixed per channel, so create one channel per distinct
    // reciter used by an enabled prayer, up front.
    const channelForReciter: Record<string, string> = {};
    if (Platform.OS === 'android') {
      const distinct = new Set(SALAH_ORDER.filter((k) => settings.prayers[k]).map(reciterFor));
      for (const recId of distinct) {
        const ch = `adhan-${recId}`;
        await Notifications.setNotificationChannelAsync(ch, {
          name: `Adhān — ${reciterName(recId)}`,
          importance: Notifications.AndroidImportance.HIGH,
          sound: soundFor(recId),
        });
        channelForReciter[recId] = ch;
      }
    }

    for (let day = 0; day < HORIZON_DAYS; day++) {
      const ct = dayTimes[day];
      if (!ct) continue;
      for (const slot of ct.slots) {
        if (!slot.isPrayer) continue;
        const key = slot.name as SalahKey;
        if (!settings.prayers[key]) continue;
        if (slot.time.getTime() <= now.getTime()) continue; // skip past times
        const recId = reciterFor(key);
        const adhanBody = settings.inspiringContent
          ? inspiringLine(messages.language)
          : messages.adhanBody;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: messages.adhanTitle(messages.prayerName(key), clockLabel(slot.time, messages.language)),
            body: adhanBody,
            sound: soundFor(recId),
            data: { type: 'adhan', reciter: recId },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: slot.time,
            channelId: Platform.OS === 'android' ? channelForReciter[recId] : channelId,
          },
        });
      }
    }
  }

  // Athkār — one-off notifications over the horizon. Each day's firing times come
  // from the chosen delivery mode, and the selection is re-seeded per calendar
  // day so the user genuinely sees fresh variety. Bodies are shown in the app's
  // single selected language only (Arabic for ar, the translation otherwise).
  if (settings.athkarEnabled) {
    const perDay = Math.max(1, Math.min(6, Math.round(settings.athkarPerDay || 1)));
    const baseMinutes = settings.athkarHour * 60 + settings.athkarMinute;
    const mode: AthkarMode = settings.athkarMode ?? 'spread';

    for (let day = 0; day < HORIZON_DAYS; day++) {
      const seedDate = new Date(now);
      seedDate.setDate(now.getDate() + day);
      const fireTimes = athkarFireTimes(mode, seedDate, perDay, baseMinutes, dayTimes[day]);
      if (fireTimes.length === 0) continue;
      // Random when enabled; otherwise a stable daily rotation (still varies by day).
      const seq = settings.athkarRandomize
        ? randomAthkarSequence(fireTimes.length)
        : randomAthkarSequence(fireTimes.length, dayIndex(seedDate));

      for (let n = 0; n < fireTimes.length; n++) {
        const when = fireTimes[n];
        if (when.getTime() <= now.getTime()) continue; // skip past times
        const dhikr = seq[n];
        const dhikrText = messages.language === 'ar' ? dhikr.arabic : dhikr.translation;
        const body = settings.inspiringContent
          ? `${dhikrText}\n${inspiringLine(messages.language)}`
          : dhikrText;
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
