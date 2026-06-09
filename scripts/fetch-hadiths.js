/*
 * Build an expanded, offline hadith corpus from the free, no-key
 * fawazahmed0/hadith-api (CDN JSON). Fetches the English + Arabic editions of
 * each of the six collections, aligns them by hadith number, and writes
 * src/features/hadith/corpus.json.
 *
 *   node scripts/fetch-hadiths.js            # default 500 per collection
 *   node scripts/fetch-hadiths.js 1000       # 1000 per collection
 *
 * The shipped src/features/hadith/corpus.json was generated with a limit of 500
 * (≈3000 narrations, ~4.7 MB). Re-run this to rebuild/refresh it.
 *
 * Notes:
 *  - This dataset has Arabic + English + (for the Sunan books) named scholarly
 *    gradings, but NOT the narrator / isnād / topic / plain-explanation fields
 *    the curated seed has. So it is lazy-loaded (several MB) and merged after
 *    the rich curated entries (see corpus.ts).
 *  - GRADING HONESTY: the Bukhari/Muslim editions ship EMPTY grades, so we
 *    assert `sahih` for those two collections (scholarly consensus). For the
 *    four Sunan books we read the first named grading and otherwise default to
 *    `unknown` — we never assert `sahih` without a basis.
 *  - Verify licensing/attribution for any text + translation you ship.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
const COLLECTIONS = [
  ['bukhari', 'bukhari'],
  ['muslim', 'muslim'],
  ['abudawud', 'abudawud'],
  ['tirmidhi', 'tirmidhi'],
  ['nasai', 'nasai'],
  ['ibnmajah', 'ibnmajah'],
];
const LABEL = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  abudawud: 'Sunan Abi Dawud',
  tirmidhi: 'Jami‘ at-Tirmidhi',
  nasai: "Sunan an-Nasa'i",
  ibnmajah: 'Sunan Ibn Majah',
};

const LIMIT = Number(process.argv[2]) || 500;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Everything in Sahih al-Bukhari and Sahih Muslim is authentic by scholarly
// consensus — but the fawazahmed0 editions for these two ship EMPTY grades, so
// we assert `sahih` for them directly rather than letting them fall to unknown.
const SAHIHAYN = new Set(['bukhari', 'muslim']);

function normalizeGrade(key, grades) {
  if (SAHIHAYN.has(key)) return 'sahih';
  // For the four Sunan books, the editions carry named scholarly gradings
  // (al-Albani, al-Arnaut, Zubair Ali Zai…). Read the first one honestly, and
  // default to `unknown` when no grading is present rather than asserting sahih.
  const g = (grades && grades[0] && (grades[0].grade || grades[0])) || '';
  const s = String(g).toLowerCase();
  if (!s) return 'unknown';
  // Order matters: check daif/weak BEFORE sahih, since "da'if" never contains
  // "sahih" but a phrase could mention both — weakness is the safer default.
  if (s.includes('da') || s.includes('weak') || s.includes('munkar') || s.includes('mawdu'))
    return 'daif';
  if (s.includes('hasan')) return 'hasan';
  if (s.includes('sahih') || s.includes('saheeh')) return 'sahih';
  return 'unknown';
}

(async () => {
  const out = [];
  for (const [key, slug] of COLLECTIONS) {
    process.stdout.write(`Fetching ${key}… `);
    const [eng, ara] = await Promise.all([
      getJson(`${BASE}/eng-${slug}.json`),
      getJson(`${BASE}/ara-${slug}.json`),
    ]);
    const araByNum = new Map(ara.hadiths.map((h) => [h.hadithnumber, h.text]));
    let added = 0;
    for (const h of eng.hadiths) {
      if (added >= LIMIT) break;
      const arabic = araByNum.get(h.hadithnumber);
      if (!arabic) continue;
      out.push({
        id: `${key}-${h.hadithnumber}`,
        collection: key,
        reference: `${LABEL[key]} ${h.hadithnumber}`,
        arabic,
        english: h.text,
        grade: normalizeGrade(key, h.grades),
        topics: [],
      });
      added += 1;
    }
    console.log(`${added} hadiths`);
  }

  const dest = path.join(__dirname, '..', 'src', 'features', 'hadith', 'corpus.json');
  fs.writeFileSync(dest, JSON.stringify(out));
  console.log(`\nWrote ${out.length} hadiths → ${path.relative(process.cwd(), dest)}`);
  console.log('Next: extend the Hadith type with optional narrator/chain/explanation,');
  console.log('lazy-load corpus.json, and index arabic+english in search.');
})().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
