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
  /** Representative chain of transmission (isnād), companion first. */
  chain?: string[];
  /** Plain-language explanation (curated entries only). */
  explanation?: string;
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
