import {
  addZonedCalendarDays,
  calendarDateAt,
  formatZonedTime,
  zonedClockOnDay,
} from './timezone';

describe('prayer timezone helpers', () => {
  it('formats a Makkah instant using the Makkah clock', () => {
    const instant = new Date('2026-08-11T01:36:00.000Z');

    expect(formatZonedTime(instant, 'Asia/Riyadh', true, 'en')).toBe('4:36 AM');
  });

  it('builds the calendar day at the prayer location, including tomorrow', () => {
    const instant = new Date('2026-08-11T23:30:00.000Z');
    const calendarDate = calendarDateAt(instant, 'Pacific/Kiritimati');

    expect([
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1,
      calendarDate.getDate(),
    ]).toEqual([2026, 8, 12]);
  });

  it('creates a fixed clock time in the target zone, not the device zone', () => {
    const day = new Date('2026-08-11T16:00:00.000Z');

    expect(zonedClockOnDay(day, 'America/Toronto', 9 * 60).toISOString()).toBe(
      '2026-08-11T13:00:00.000Z',
    );
  });

  it('advances target calendar days across a daylight-saving transition', () => {
    const beforeFallback = new Date('2026-10-31T16:00:00.000Z');

    expect(
      addZonedCalendarDays(beforeFallback, 'America/Toronto', 1).toISOString(),
    ).toBe('2026-11-01T17:00:00.000Z');
  });
});
