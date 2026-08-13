import { computeTimes, formatTime } from './calc';
import type { PrayerCalculationProfile } from './methods';

const STANDARD: PrayerCalculationProfile = {
  method: 'UmmAlQura',
  madhab: 'standard',
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
};

const NOW = new Date('2026-08-11T08:00:00.000Z');

describe('timezone-correct prayer calculations', () => {
  it('computes and formats Makkah Fajr on the Riyadh clock', () => {
    const times = computeTimes(21.4225, 39.8262, 'Asia/Riyadh', STANDARD, NOW);
    const fajr = times.slots.find((slot) => slot.name === 'fajr');

    expect(fajr).toBeDefined();
    expect(formatTime(fajr!.time, true, times.timezone, 'en')).toBe('4:36 AM');
    expect(times.dateKey).toBe('2026-08-11');
  });

  it('moves only Fajr when a Fajr adjustment is applied', () => {
    const baseline = computeTimes(21.4225, 39.8262, 'Asia/Riyadh', STANDARD, NOW);
    const adjusted = computeTimes(
      21.4225,
      39.8262,
      'Asia/Riyadh',
      { ...STANDARD, adjustments: { ...STANDARD.adjustments, fajr: 2 } },
      NOW,
    );

    const byName = (name: string, table: typeof baseline) =>
      table.slots.find((slot) => slot.name === name)!.time.getTime();
    expect(byName('fajr', adjusted) - byName('fajr', baseline)).toBe(2 * 60 * 1000);
    expect(byName('dhuhr', adjusted)).toBe(byName('dhuhr', baseline));
    expect(byName('isha', adjusted)).toBe(byName('isha', baseline));
  });

  it('computes Hanafi Asr later than standard Asr', () => {
    const standard = computeTimes(43.6532, -79.3832, 'America/Toronto', STANDARD, NOW);
    const hanafi = computeTimes(
      43.6532,
      -79.3832,
      'America/Toronto',
      { ...STANDARD, madhab: 'hanafi' },
      NOW,
    );

    const asr = (table: typeof standard) =>
      table.slots.find((slot) => slot.name === 'asr')!.time.getTime();
    expect(asr(hanafi)).toBeGreaterThan(asr(standard));
  });

  it('matches the Gatineau/Ottawa ISNA timetable within normal rounding', () => {
    const times = computeTimes(
      45.4765,
      -75.7013,
      'America/Toronto',
      { ...STANDARD, method: 'NorthAmerica' },
      new Date('2026-08-12T16:00:00.000Z'),
    );
    const formatted = Object.fromEntries(
      times.slots.map((slot) => [
        slot.name,
        formatTime(slot.time, false, times.timezone, 'en'),
      ]),
    );

    const published = {
      fajr: '04:25',
      sunrise: '05:59',
      dhuhr: '13:08',
      asr: '17:04',
      maghrib: '20:16',
      isha: '21:50',
    };
    const minuteOfDay = (value: string) => {
      const [hour, minute] = value.split(':').map(Number);
      return hour * 60 + minute;
    };

    for (const [prayer, expected] of Object.entries(published)) {
      expect(Math.abs(minuteOfDay(formatted[prayer]) - minuteOfDay(expected))).toBeLessThanOrEqual(1);
    }
  });
});
