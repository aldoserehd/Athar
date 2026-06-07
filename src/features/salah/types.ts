import { ReasonKey } from './reasons';

/** The five obligatory daily prayers (Sunrise is not obligatory). */
export type SalahKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const SALAH_ORDER: SalahKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const SALAH_META: Record<SalahKey, { label: string; arabic: string }> = {
  fajr: { label: 'Fajr', arabic: 'الفجر' },
  dhuhr: { label: 'Dhuhr', arabic: 'الظهر' },
  asr: { label: 'Asr', arabic: 'العصر' },
  maghrib: { label: 'Maghrib', arabic: 'المغرب' },
  isha: { label: 'Isha', arabic: 'العشاء' },
};

export type SalahStatus =
  | 'pending' // not yet logged
  | 'prayed' // performed
  | 'missed' // not performed, owes make-up
  | 'excused'; // waived (menstruation / nifas) — no make-up

export type SalahEntry = {
  status: SalahStatus;
  reason?: ReasonKey;
};

/** A single day's record, keyed by local YYYY-MM-DD. */
export type DayRecord = {
  date: string;
  entries: Record<SalahKey, SalahEntry>;
};

export function emptyDay(date: string): DayRecord {
  return {
    date,
    entries: {
      fajr: { status: 'pending' },
      dhuhr: { status: 'pending' },
      asr: { status: 'pending' },
      maghrib: { status: 'pending' },
      isha: { status: 'pending' },
    },
  };
}

/** Local calendar day as YYYY-MM-DD. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
