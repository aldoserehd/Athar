/*
 * OPTIONAL online layer over the free, no-key fawazahmed0 hadith CDN
 * (public domain / Unlicense). This is layered strictly ON TOP of the bundled
 * offline library — nothing here is required for the core experience.
 *
 * Offline-first contract: every export here may reject/return empty when there
 * is no network. Callers MUST keep the bundled offline results working and treat
 * these as a best-effort enhancement (see HadithScreen / HadithDetailScreen).
 *
 * No API key. No data is bundled from here — editions are fetched on demand and
 * cached in memory only for the session, so this never bloats the app download.
 *
 * The same dataset backs scripts/fetch-hadiths.js (build-time corpus.json), so
 * ids/grades stay consistent between the offline and online sets.
 */
import { searchHadiths, SearchOptions } from './search';
import { CollectionKey, Grade, Hadith } from './types';

const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

// CollectionKey values already match the fawazahmed0 edition slugs.
const LABEL: Record<CollectionKey, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  abudawud: 'Sunan Abi Dawud',
  tirmidhi: 'Jami‘ at-Tirmidhi',
  nasai: "Sunan an-Nasa'i",
  ibnmajah: 'Sunan Ibn Majah',
};

// Everything in Sahih al-Bukhari and Sahih Muslim is authentic by scholarly
// consensus, but the fawazahmed0 editions ship EMPTY grades for them — so we
// assert `sahih`. For the Sunan books we read the first named grading honestly
// and default to `unknown` rather than asserting authenticity. Mirrors the
// build script so offline and online grades agree.
const SAHIHAYN = new Set<CollectionKey>(['bukhari', 'muslim']);

type RawGrade = string | { grade?: string; name?: string };

function normalizeGrade(key: CollectionKey, grades?: RawGrade[]): Grade {
  if (SAHIHAYN.has(key)) return 'sahih';
  const first = grades && grades[0];
  const g = typeof first === 'string' ? first : first?.grade ?? '';
  const s = String(g).toLowerCase();
  if (!s) return 'unknown';
  if (s.includes('da') || s.includes('weak') || s.includes('munkar') || s.includes('mawdu'))
    return 'daif';
  if (s.includes('hasan')) return 'hasan';
  if (s.includes('sahih') || s.includes('saheeh')) return 'sahih';
  return 'unknown';
}

type RawHadith = { hadithnumber: number; text: string; grades?: RawGrade[] };
type RawEdition = { hadiths: RawHadith[] };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

// In-memory, session-only cache of fully-loaded editions (never persisted).
const editionCache = new Map<CollectionKey, Hadith[]>();
const inflight = new Map<CollectionKey, Promise<Hadith[]>>();

/**
 * Fetch a whole book (English + Arabic aligned by hadith number) from the CDN.
 * Cached in memory for the session. Throws when offline / on failure.
 */
export async function loadOnlineCollection(collection: CollectionKey): Promise<Hadith[]> {
  const cached = editionCache.get(collection);
  if (cached) return cached;
  const pending = inflight.get(collection);
  if (pending) return pending;

  const task = (async () => {
    const [eng, ara] = await Promise.all([
      getJson<RawEdition>(`${BASE}/eng-${collection}.min.json`),
      getJson<RawEdition>(`${BASE}/ara-${collection}.min.json`),
    ]);
    const araByNum = new Map(ara.hadiths.map((h) => [h.hadithnumber, h.text]));
    const out: Hadith[] = [];
    for (const h of eng.hadiths) {
      const arabic = araByNum.get(h.hadithnumber);
      if (!arabic) continue;
      out.push({
        id: `${collection}-${h.hadithnumber}`,
        collection,
        reference: `${LABEL[collection]} ${h.hadithnumber}`,
        arabic,
        english: h.text,
        grade: normalizeGrade(collection, h.grades),
        topics: [],
      });
    }
    editionCache.set(collection, out);
    inflight.delete(collection);
    return out;
  })().catch((e) => {
    inflight.delete(collection);
    throw e;
  });

  inflight.set(collection, task);
  return task;
}

/**
 * Search the FULL online collection for `collection`. Best-effort: resolves to
 * `[]` if the device is offline or the fetch fails — callers keep showing the
 * bundled offline results regardless.
 */
export async function searchFullCollectionOnline(
  query: string,
  collection: CollectionKey,
  opts: Pick<SearchOptions, 'topic' | 'limit'> = {}
): Promise<Hadith[]> {
  try {
    const library = await loadOnlineCollection(collection);
    return searchHadiths(query, { ...opts, collection, library, limit: opts.limit ?? 60 });
  } catch {
    return [];
  }
}

/**
 * Resolve a single hadith by its `${collection}-${number}` id from the CDN —
 * a tiny request used only as a last-resort fallback in the detail screen when
 * an id isn't in the bundled library. Returns undefined when offline/not found.
 */
export async function fetchHadithById(id: string): Promise<Hadith | undefined> {
  const m = /^([a-z]+)-(\d+)$/.exec(id);
  if (!m) return undefined;
  const collection = m[1] as CollectionKey;
  if (!(collection in LABEL)) return undefined;
  const number = Number(m[2]);
  try {
    const [eng, ara] = await Promise.all([
      getJson<RawEdition>(`${BASE}/eng-${collection}/${number}.min.json`),
      getJson<RawEdition>(`${BASE}/ara-${collection}/${number}.min.json`),
    ]);
    const e = eng.hadiths[0];
    const a = ara.hadiths[0];
    if (!e || !a) return undefined;
    return {
      id: `${collection}-${number}`,
      collection,
      reference: `${LABEL[collection]} ${number}`,
      arabic: a.text,
      english: e.text,
      grade: normalizeGrade(collection, e.grades),
      topics: [],
    };
  } catch {
    return undefined;
  }
}
