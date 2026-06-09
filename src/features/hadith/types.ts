export type CollectionKey =
  | 'bukhari'
  | 'muslim'
  | 'abudawud'
  | 'tirmidhi'
  | 'nasai'
  | 'ibnmajah';

export type Grade = 'sahih' | 'hasan' | 'daif' | 'unknown';

export type Hadith = {
  id: string;
  collection: CollectionKey;
  /** Human reference, e.g. "Sahih al-Bukhari 1". */
  reference: string;
  arabic: string;
  english: string;
  grade: Grade;
  topics: string[];
  /** The companion who narrated it (curated entries only). */
  narrator?: string;
  /** The narrator's name in Arabic (curated entries only). */
  narratorAr?: string;
  /** Representative chain of transmission (isnād), companion first. */
  chain?: string[];
  /** The isnād names in Arabic, companion first (curated entries only). */
  chainAr?: string[];
  /** Plain-language explanation (curated entries only). */
  explanation?: string;
  /** The plain-language explanation in Arabic (curated entries only). */
  explanationAr?: string;
};

export const COLLECTIONS: { key: CollectionKey; label: string; arabic: string }[] = [
  { key: 'bukhari', label: 'Bukhari', arabic: 'البخاري' },
  { key: 'muslim', label: 'Muslim', arabic: 'مسلم' },
  { key: 'abudawud', label: 'Abu Dawud', arabic: 'أبو داود' },
  { key: 'tirmidhi', label: 'Tirmidhi', arabic: 'الترمذي' },
  { key: 'nasai', label: "Nasa'i", arabic: 'النسائي' },
  { key: 'ibnmajah', label: 'Ibn Majah', arabic: 'ابن ماجه' },
];

export function collectionLabel(key: CollectionKey): string {
  return COLLECTIONS.find((c) => c.key === key)?.label ?? key;
}

export const GRADE_LABEL: Record<Grade, string> = {
  sahih: 'Sahih',
  hasan: 'Hasan',
  daif: "Da'if",
  unknown: 'Ungraded',
};

export const GRADE_LABEL_AR: Record<Grade, string> = {
  sahih: 'صحيح',
  hasan: 'حسن',
  daif: 'ضعيف',
  unknown: 'غير مصنّف',
};

/** Western digits 0-9 → Arabic-Indic digits ٠-٩. */
function toArabicDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

/**
 * Derive an Arabic reference from a hadith: the collection's Arabic label plus
 * the trailing number from {@link Hadith.reference}, rendered with Arabic-Indic
 * digits — e.g. "صحيح البخاري ١". Falls back to the Arabic label alone if the
 * reference carries no number.
 */
export function referenceArabic(h: Hadith): string {
  const arabicLabel = COLLECTIONS.find((c) => c.key === h.collection)?.arabic ?? h.collection;
  const num = h.reference.match(/(\d+)\s*$/)?.[1];
  if (!num) return arabicLabel;
  return `حديث ${arabicLabel} ${toArabicDigits(num)}`;
}
