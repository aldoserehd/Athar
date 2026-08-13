function zonedDateParts(instant: Date, timezone: string): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(instant);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day') };
}

function zonedDateTimeParts(instant: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
}

function zonedDateTimeToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
): Date {
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let guess = desiredAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const observed = zonedDateTimeParts(new Date(guess), timezone);
    const observedAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    const correction = desiredAsUtc - observedAsUtc;
    if (correction === 0) break;
    guess += correction;
  }

  return new Date(guess);
}

/**
 * Returns a stable local Date carrier whose year/month/day match the selected
 * prayer location. Adhan reads only those calendar fields from this value.
 */
export function calendarDateAt(instant: Date, timezone: string): Date {
  const { year, month, day } = zonedDateParts(instant, timezone);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function dateKeyAt(instant: Date, timezone: string): string {
  const { year, month, day } = zonedDateParts(instant, timezone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function addZonedCalendarDays(
  instant: Date,
  timezone: string,
  days: number,
): Date {
  const base = zonedDateParts(instant, timezone);
  const target = new Date(Date.UTC(base.year, base.month - 1, base.day + days, 12));
  return zonedDateTimeToInstant(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    12,
    0,
    timezone,
  );
}

export function zonedClockOnDay(
  dayInstant: Date,
  timezone: string,
  minutesAfterMidnight: number,
): Date {
  const base = zonedDateParts(dayInstant, timezone);
  const target = new Date(
    Date.UTC(base.year, base.month - 1, base.day, 0, minutesAfterMidnight),
  );
  return zonedDateTimeToInstant(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    target.getUTCHours(),
    target.getUTCMinutes(),
    timezone,
  );
}

export function formatZonedTime(
  instant: Date,
  timezone: string,
  hour12: boolean,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  })
    .format(instant)
    .replace(/[\u00a0\u202f]/g, ' ');
}
