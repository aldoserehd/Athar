/**
 * Reasons a prayer might not have been performed at its time.
 *
 * `exempt: true`  — the prayer is *not* obligatory and is NOT made up later
 *                   (menstruation / postnatal bleeding).
 * `exempt: false` — the prayer is excused for now but should be made up (qadāʾ)
 *                   when able, per the hadith: "Whoever sleeps through a prayer
 *                   or forgets it, let him pray it when he remembers."
 *
 * Labels and notes are localized — the UI looks up `salahReasons.<key>` for the
 * label and `salahReasons.<key>Note` for the note (see src/i18n/translations.ts).
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
  /** True if the prayer is waived entirely (no make-up owed). */
  exempt: boolean;
};

export const REASONS: Reason[] = [
  { key: 'menstruation', exempt: true },
  { key: 'postnatal', exempt: true },
  { key: 'overslept', exempt: false },
  { key: 'forgot', exempt: false },
  { key: 'illness', exempt: false },
  { key: 'unconscious', exempt: false },
  { key: 'travel', exempt: false },
  { key: 'other', exempt: false },
];

export function reasonInfo(key: ReasonKey): Reason {
  return REASONS.find((r) => r.key === key) ?? REASONS[REASONS.length - 1];
}
