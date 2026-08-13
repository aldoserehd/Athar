import {
  Coordinates,
  HighLatitudeRule,
  Prayer,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';

import { buildParams, type PrayerCalculationProfile } from './methods';
import { calendarDateAt, dateKeyAt, formatZonedTime } from './timezone';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerSlot = {
  name: PrayerName;
  label: string;
  time: Date;
  isPrayer: boolean;
};

export type ComputedTimes = {
  date: Date;
  dateKey: string;
  timezone: string;
  slots: PrayerSlot[];
  next: { name: PrayerName; label: string; time: Date };
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

function mapAdhanPrayer(prayer: string): PrayerName | null {
  switch (prayer) {
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

function prayerTimesFor(
  latitude: number,
  longitude: number,
  date: Date,
  profile: PrayerCalculationProfile,
): { coordinates: Coordinates; times: PrayerTimes } {
  const coordinates = new Coordinates(latitude, longitude);
  const params = buildParams(profile);
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  return { coordinates, times: new PrayerTimes(coordinates, date, params) };
}

export function computeTimes(
  latitude: number,
  longitude: number,
  timezone: string,
  profile: PrayerCalculationProfile,
  now: Date = new Date(),
): ComputedTimes {
  const calendarDate = calendarDateAt(now, timezone);
  const { coordinates, times: today } = prayerTimesFor(
    latitude,
    longitude,
    calendarDate,
    profile,
  );

  const nextAdhan = today.nextPrayer(now);
  let next: ComputedTimes['next'];
  if (nextAdhan === Prayer.None) {
    const tomorrow = new Date(calendarDate);
    tomorrow.setDate(calendarDate.getDate() + 1);
    const { times } = prayerTimesFor(latitude, longitude, tomorrow, profile);
    next = { name: 'fajr', label: LABELS.fajr, time: times.fajr };
  } else {
    const name = mapAdhanPrayer(nextAdhan) ?? 'fajr';
    next = {
      name,
      label: LABELS[name],
      time: today.timeForPrayer(nextAdhan) ?? today.fajr,
    };
  }

  return {
    date: calendarDate,
    dateKey: dateKeyAt(now, timezone),
    timezone,
    slots: slotsFor(today),
    next,
    current: mapAdhanPrayer(today.currentPrayer(now)),
    qiblaDegrees: Qibla(coordinates),
  };
}

export function sunnahTimes(
  latitude: number,
  longitude: number,
  timezone: string,
  profile: PrayerCalculationProfile,
  now: Date = new Date(),
): SunnahTimes {
  const calendarDate = calendarDateAt(now, timezone);
  const { times } = prayerTimesFor(latitude, longitude, calendarDate, profile);
  return new SunnahTimes(times);
}

export function qiblaFor(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

export function formatTime(
  date: Date,
  hour12 = true,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale = 'en',
): string {
  return formatZonedTime(date, timezone, hour12, locale);
}
