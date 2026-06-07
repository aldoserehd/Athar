import {
  Coordinates,
  PrayerTimes,
  Prayer,
  SunnahTimes,
  Qibla,
  HighLatitudeRule,
} from 'adhan';

import { buildParams, MadhabKey, MethodKey } from './methods';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerSlot = {
  name: PrayerName;
  label: string;
  time: Date;
  /** Sunrise is shown but is not a prayer to be highlighted as "next". */
  isPrayer: boolean;
};

export type ComputedTimes = {
  date: Date;
  slots: PrayerSlot[];
  /** The upcoming prayer (today or tomorrow's Fajr). */
  next: { name: PrayerName; label: string; time: Date };
  /** The current prayer period. */
  current: PrayerName | null;
  qiblaDegrees: number;
};

const LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function slotsFor(times: PrayerTimes): PrayerSlot[] {
  return [
    { name: 'fajr', label: LABELS.fajr, time: times.fajr, isPrayer: true },
    { name: 'sunrise', label: LABELS.sunrise, time: times.sunrise, isPrayer: false },
    { name: 'dhuhr', label: LABELS.dhuhr, time: times.dhuhr, isPrayer: true },
    { name: 'asr', label: LABELS.asr, time: times.asr, isPrayer: true },
    { name: 'maghrib', label: LABELS.maghrib, time: times.maghrib, isPrayer: true },
    { name: 'isha', label: LABELS.isha, time: times.isha, isPrayer: true },
  ];
}

function mapAdhanPrayer(p: string): PrayerName | null {
  switch (p) {
    case Prayer.Fajr:
      return 'fajr';
    case Prayer.Sunrise:
      return 'sunrise';
    case Prayer.Dhuhr:
      return 'dhuhr';
    case Prayer.Asr:
      return 'asr';
    case Prayer.Maghrib:
      return 'maghrib';
    case Prayer.Isha:
      return 'isha';
    default:
      return null;
  }
}

/**
 * Compute today's prayer times for a location. Falls back to tomorrow's Fajr
 * for "next" once Isha has passed, so the countdown is always forward-looking.
 */
export function computeTimes(
  latitude: number,
  longitude: number,
  method: MethodKey,
  madhab: MadhabKey,
  now: Date = new Date()
): ComputedTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const params = buildParams(method, madhab);
  // At high latitudes the sun may never reach the twilight angle, leaving Fajr
  // and Isha undefined; the recommended rule derives sensible times instead.
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  const today = new PrayerTimes(coordinates, now, params);

  const nextAdhan = today.nextPrayer(now);
  let next: ComputedTimes['next'];
  if (nextAdhan === Prayer.None) {
    // After Isha — next is tomorrow's Fajr.
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const t = new PrayerTimes(coordinates, tomorrow, params);
    next = { name: 'fajr', label: LABELS.fajr, time: t.fajr };
  } else {
    const name = mapAdhanPrayer(nextAdhan) ?? 'fajr';
    next = { name, label: LABELS[name], time: today.timeForPrayer(nextAdhan) ?? today.fajr };
  }

  const current = mapAdhanPrayer(today.currentPrayer(now));
  const qiblaDegrees = Qibla(coordinates);

  return {
    date: now,
    slots: slotsFor(today),
    next,
    current,
    qiblaDegrees,
  };
}

/** Witr suggestion etc. could read SunnahTimes; exported for later use. */
export function sunnahTimes(
  latitude: number,
  longitude: number,
  method: MethodKey,
  madhab: MadhabKey,
  date: Date = new Date()
) {
  const coordinates = new Coordinates(latitude, longitude);
  const params = buildParams(method, madhab);
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  return new SunnahTimes(new PrayerTimes(coordinates, date, params));
}

/** Qibla bearing (degrees clockwise from true north) for a location. */
export function qiblaFor(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

export function formatTime(date: Date, hour12 = true): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  });
}
