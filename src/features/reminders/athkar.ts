/** A small set of authentic everyday adhkār used for the daily reminder. */
export type Athkar = {
  id: string;
  arabic: string;
  translation: string;
  source: string;
};

export const ATHKAR: Athkar[] = [
  {
    id: 'tasbih',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translation: 'Glory and praise be to Allah; glory be to Allah the Magnificent.',
    source: 'Bukhari & Muslim',
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation:
      'None has the right to be worshipped but Allah alone, with no partner. His is the dominion and the praise, and He is able to do all things.',
    source: 'Bukhari & Muslim',
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    translation: 'I seek the forgiveness of Allah and turn to Him in repentance.',
    source: 'Bukhari',
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    translation: 'O Allah, send blessings and peace upon our Prophet Muhammad.',
    source: 'Sunnah',
  },
  {
    id: 'hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    translation: 'There is no might nor power except with Allah.',
    source: 'Bukhari & Muslim',
  },
  {
    id: 'hasbiya',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    translation:
      'Allah is sufficient for me; none has the right to be worshipped but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.',
    source: 'Abu Dawud',
  },
  {
    id: 'muadh',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    translation:
      'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    source: 'Abu Dawud',
  },
  {
    id: 'radhitu',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    translation:
      'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    source: 'Abu Dawud & Tirmidhi',
  },
  {
    id: 'four',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    translation: 'Glory be to Allah; praise be to Allah; none is worthy of worship but Allah; Allah is the Greatest.',
    source: 'Muslim',
  },
  {
    id: 'afiyah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
    translation: 'O Allah, I ask You for pardon and well-being in this world and the next.',
    source: 'Ibn Majah',
  },
];

export function randomAthkar(): Athkar {
  return ATHKAR[Math.floor(Math.random() * ATHKAR.length)];
}

/**
 * A tiny seeded PRNG (mulberry32). Used so a given day produces a *stable but
 * different* shuffle — i.e. genuinely varied day to day, yet the same across a
 * single reschedule pass so we don't double-up if scheduling runs twice.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns `n` adhkār with no two consecutive duplicates. By default it is fully
 * random (Math.random); pass a numeric `seed` to get a stable-yet-varied order
 * for that seed (e.g. a day index) so each day shows a fresh selection.
 *
 * When `n` exceeds the list length it cycles through reshuffled passes, ensuring
 * the first item of each new pass never matches the last item emitted.
 */
export function randomAthkarSequence(n: number, seed?: number): Athkar[] {
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  const shuffle = (): Athkar[] => {
    const arr = [...ATHKAR];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const out: Athkar[] = [];
  while (out.length < n) {
    let pass = shuffle();
    // Avoid a back-to-back duplicate across pass boundaries.
    if (out.length > 0 && pass.length > 1 && pass[0].id === out[out.length - 1].id) {
      [pass[0], pass[1]] = [pass[1], pass[0]];
    }
    for (const a of pass) {
      if (out.length >= n) break;
      out.push(a);
    }
  }
  return out;
}
