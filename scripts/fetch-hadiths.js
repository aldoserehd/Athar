/*
 * Build an expanded, offline hadith corpus from the free, no-key
 * fawazahmed0/hadith-api (CDN JSON). Fetches the English + Arabic editions of
 * each of the six collections, aligns them by hadith number, and writes
 * src/features/hadith/corpus.json.
 *
 *   node scripts/fetch-hadiths.js            # default 150 per collection
 *   node scripts/fetch-hadiths.js 500        # 500 per collection
 *
 * Notes:
 *  - This dataset has Arabic + English + (sometimes) gradings, but NOT the
 *    narrator / isnād / topic / plain-explanation fields the curated seed has.
 *    So integrate it as an optional/extended record type and lazy-load it
 *    (it can be several MB) rather than importing it eagerly.
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

const LIMIT = Number(process.argv[2]) || 150;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function normalizeGrade(grades) {
  const g = (grades && grades[0] && (grades[0].grade || grades[0])) || '';
  const s = String(g).toLowerCase();
  if (s.includes('sahih') || s.includes('saheeh')) return 'sahih';
  if (s.includes('hasan')) return 'hasan';
  if (s.includes('da') || s.includes('weak')) return 'daif';
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
        grade: normalizeGrade(h.grades),
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
