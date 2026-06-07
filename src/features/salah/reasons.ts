/**
 * Reasons a prayer might not have been performed at its time.
 *
 * `exempt: true`  — the prayer is *not* obligatory and is NOT made up later
 *                   (menstruation / postnatal bleeding).
 * `exempt: false` — the prayer is excused for now but should be made up (qadāʾ)
 *                   when able, per the hadith: "Whoever sleeps through a prayer
 *                   or forgets it, let him pray it when he remembers."
 *
 * These are plain-language summaries, not a fatwa — for your situation consult a
 * trusted scholar.
 */
export type ReasonKey =
  | 'menstruation'
  | 'postnatal'
  | 'overslept'
  | 'forgot'
  | 'illness'
  | 'unconscious'
  | 'travel'
  | 'other';

export type Reason = {
  key: ReasonKey;
  label: string;
  arabic?: string;
  /** True if the prayer is waived entirely (no make-up owed). */
  exempt: boolean;
  note: string;
};

export const REASONS: Reason[] = [
  {
    key: 'menstruation',
    label: 'Menstruation',
    arabic: 'حَيْض',
    exempt: true,
    note: 'A menstruating woman does not pray, and these prayers are not made up.',
  },
  {
    key: 'postnatal',
    label: 'Postnatal bleeding',
    arabic: 'نِفَاس',
    exempt: true,
    note: 'After childbirth (nifās) the same ruling applies — not prayed and not made up.',
  },
  {
    key: 'overslept',
    label: 'Overslept / asleep',
    exempt: false,
    note: 'Pray it as soon as you wake. It is owed as a make-up (qadāʾ).',
  },
  {
    key: 'forgot',
    label: 'Forgot',
    exempt: false,
    note: 'Pray it as soon as you remember. It is owed as a make-up (qadāʾ).',
  },
  {
    key: 'illness',
    label: 'Too ill to pray',
    exempt: false,
    note: 'Illness allows praying sitting or lying down; if genuinely missed, make it up.',
  },
  {
    key: 'unconscious',
    label: 'Unconscious / medical',
    exempt: false,
    note: 'Anesthesia or unconsciousness — make up the prayers once able, per most scholars.',
  },
  {
    key: 'travel',
    label: 'Travel or unsafe',
    exempt: false,
    note: 'Travel allows shortening/combining; if a prayer was truly missed, make it up.',
  },
  {
    key: 'other',
    label: 'Another reason',
    exempt: false,
    note: 'Recorded as owed. Make it up when you are able, in shāʾ Allah.',
  },
];

export function reasonInfo(key: ReasonKey): Reason {
  return REASONS.find((r) => r.key === key) ?? REASONS[REASONS.length - 1];
}
