/**
 * Inspiration content — short, authentic, uplifting items themed on prayer,
 * remembrance, hope, mercy and drawing near to Allah. These power gentle prayer
 * reminders that motivate someone to pray and reconnect with their Lord.
 *
 * Three kinds:
 *  - `hadith` — authentic narrations only (sahih/hasan), referenced to a print.
 *  - `ayah`   — Qur'anic verses with exact surah:ayah and a sound English
 *               meaning (Saheeh International style).
 *  - `dua`    — short masnun (sunnah) supplications.
 *
 * Arabic is kept here as real data (NOT in translations.ts) so the reminders
 * feature can import it directly without i18n merge conflicts. Every item is
 * bilingual: Arabic + English text, Arabic + English reference.
 */
export type InspirationKind = 'hadith' | 'ayah' | 'dua';

export type InspirationItem = {
  id: string;
  kind: InspirationKind;
  arabic: string;
  english: string;
  /** Reference, e.g. 'Sahih al-Bukhari 528' or "Qur'an 2:152". */
  reference: string;
  /** Arabic reference, e.g. 'صحيح البخاري ٥٢٨' or 'البقرة ١٥٢'. */
  referenceAr: string;
  /** Themed toward prayer/salah — preferred by {@link inspirationForPrayer}. */
  prayerThemed?: boolean;
};

export const INSPIRATION: InspirationItem[] = [
  // ── Qur'an: nearness, remembrance, hope, mercy, prayer ──
  {
    id: 'ayah-2-152',
    kind: 'ayah',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    english: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    reference: "Qur'an 2:152",
    referenceAr: 'البقرة ١٥٢',
  },
  {
    id: 'ayah-13-28',
    kind: 'ayah',
    arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    english:
      'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.',
    reference: "Qur'an 13:28",
    referenceAr: 'الرعد ٢٨',
  },
  {
    id: 'ayah-2-186',
    kind: 'ayah',
    arabic:
      'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    english:
      'And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    reference: "Qur'an 2:186",
    referenceAr: 'البقرة ١٨٦',
  },
  {
    id: 'ayah-39-53',
    kind: 'ayah',
    arabic:
      'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    english:
      'Say, “O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.”',
    reference: "Qur'an 39:53",
    referenceAr: 'الزمر ٥٣',
  },
  {
    id: 'ayah-20-14',
    kind: 'ayah',
    arabic: 'إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي',
    english:
      'Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance.',
    reference: "Qur'an 20:14",
    referenceAr: 'طه ١٤',
    prayerThemed: true,
  },
  {
    id: 'ayah-29-45',
    kind: 'ayah',
    arabic: 'وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
    english:
      'And establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.',
    reference: "Qur'an 29:45",
    referenceAr: 'العنكبوت ٤٥',
    prayerThemed: true,
  },
  {
    id: 'ayah-2-153',
    kind: 'ayah',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    english:
      'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
    reference: "Qur'an 2:153",
    referenceAr: 'البقرة ١٥٣',
    prayerThemed: true,
  },
  {
    id: 'ayah-94-5',
    kind: 'ayah',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'For indeed, with hardship will be ease.',
    reference: "Qur'an 94:5",
    referenceAr: 'الشرح ٥',
  },
  {
    id: 'ayah-65-3',
    kind: 'ayah',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ',
    english:
      'And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
    reference: "Qur'an 65:3",
    referenceAr: 'الطلاق ٣',
  },
  {
    id: 'ayah-50-16',
    kind: 'ayah',
    arabic: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ',
    english: 'And We are closer to him than his jugular vein.',
    reference: "Qur'an 50:16",
    referenceAr: 'ق ١٦',
  },
  {
    id: 'ayah-3-31',
    kind: 'ayah',
    arabic:
      'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ',
    english:
      'Say, “If you should love Allah, then follow me, so Allah will love you and forgive you your sins.”',
    reference: "Qur'an 3:31",
    referenceAr: 'آل عمران ٣١',
  },

  // ── Hadith: salah, nearness, hope, mercy, remembrance ──
  {
    id: 'insp-bukhari-528',
    kind: 'hadith',
    arabic:
      'مَثَلُ الصَّلَوَاتِ الْخَمْسِ كَمَثَلِ نَهَرٍ جَارٍ غَمْرٍ عَلَى بَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ',
    english:
      'The likeness of the five daily prayers is that of a deep, flowing river at the door of one of you in which he bathes five times a day.',
    reference: 'Sahih Muslim 668',
    referenceAr: 'صحيح مسلم ٦٦٨',
    prayerThemed: true,
  },
  {
    id: 'insp-tirmidhi-3540',
    kind: 'hadith',
    arabic:
      'يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلاَ أُبَالِي',
    english:
      'O son of Adam, as long as you call upon Me and place your hope in Me, I will forgive you whatever you have done, and I will not mind.',
    reference: 'Jami‘ at-Tirmidhi 3540',
    referenceAr: 'جامع الترمذي ٣٥٤٠',
  },
  {
    id: 'insp-muslim-482',
    kind: 'hadith',
    arabic: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ',
    english:
      'The closest a servant is to his Lord is when he is in prostration, so make much supplication.',
    reference: 'Sahih Muslim 482',
    referenceAr: 'صحيح مسلم ٤٨٢',
    prayerThemed: true,
  },
  {
    id: 'insp-bukhari-7405',
    kind: 'hadith',
    arabic: 'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي',
    english:
      'Allah says: I am as My servant thinks of Me, and I am with him when he remembers Me.',
    reference: 'Sahih al-Bukhari 7405',
    referenceAr: 'صحيح البخاري ٧٤٠٥',
  },
  {
    id: 'insp-bukhari-6407',
    kind: 'hadith',
    arabic:
      'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ مَثَلُ الْحَىِّ وَالْمَيِّتِ',
    english:
      'The likeness of the one who remembers his Lord and the one who does not is that of the living and the dead.',
    reference: 'Sahih al-Bukhari 6407',
    referenceAr: 'صحيح البخاري ٦٤٠٧',
  },
  {
    id: 'insp-tirmidhi-413',
    kind: 'hadith',
    arabic:
      'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلاَتُهُ',
    english:
      'The first of a person’s deeds to be judged on the Day of Resurrection will be the prayer.',
    reference: 'Jami‘ at-Tirmidhi 413',
    referenceAr: 'جامع الترمذي ٤١٣',
    prayerThemed: true,
  },
  {
    id: 'insp-bukhari-6405',
    kind: 'hadith',
    arabic: 'مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ',
    english:
      'Whoever says “Glory be to Allah and praise be to Him” a hundred times a day, his sins are wiped away.',
    reference: 'Sahih al-Bukhari 6405',
    referenceAr: 'صحيح البخاري ٦٤٠٥',
  },
  {
    id: 'insp-nasai-3940',
    kind: 'hadith',
    arabic: 'وَجُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلاَةِ',
    english: 'And the coolness of my eyes has been placed in prayer.',
    reference: "Sunan an-Nasa'i 3940",
    referenceAr: 'سنن النسائي ٣٩٤٠',
    prayerThemed: true,
  },
  {
    id: 'insp-muslim-2702',
    kind: 'hadith',
    arabic: 'وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً',
    english:
      'By Allah, I seek Allah’s forgiveness and turn to Him in repentance more than seventy times a day.',
    reference: 'Sahih al-Bukhari 6307',
    referenceAr: 'صحيح البخاري ٦٣٠٧',
  },

  // ── Du'as: short masnun supplications ──
  {
    id: 'dua-help-remembrance',
    kind: 'dua',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    english:
      'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    reference: "Sunan Abi Dawud 1522",
    referenceAr: 'سنن أبي داود ١٥٢٢',
    prayerThemed: true,
  },
  {
    id: 'dua-steadfast-heart',
    kind: 'dua',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    english: 'O Turner of the hearts, make my heart firm upon Your religion.',
    reference: 'Jami‘ at-Tirmidhi 3522',
    referenceAr: 'جامع الترمذي ٣٥٢٢',
  },
  {
    id: 'dua-good-both-worlds',
    kind: 'dua',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    english:
      'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    reference: "Qur'an 2:201",
    referenceAr: 'البقرة ٢٠١',
  },
  {
    id: 'dua-forgive-me',
    kind: 'dua',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    english:
      'My Lord, forgive me and accept my repentance. Indeed, You are the Accepter of repentance, the Merciful.',
    reference: 'Jami‘ at-Tirmidhi 3434',
    referenceAr: 'جامع الترمذي ٣٤٣٤',
  },
  {
    id: 'dua-light',
    kind: 'dua',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا وَفِي لِسَانِي نُورًا وَاجْعَلْ لِي نُورًا',
    english:
      'O Allah, place light in my heart, light on my tongue, and grant me light.',
    reference: 'Sahih Muslim 763',
    referenceAr: 'صحيح مسلم ٧٦٣',
  },
  {
    id: 'dua-ease-affair',
    kind: 'dua',
    arabic: 'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً',
    english:
      'O Allah, there is no ease except what You make easy, and You make the difficult easy if You will.',
    reference: 'Sahih Ibn Hibban 974',
    referenceAr: 'صحيح ابن حبّان ٩٧٤',
  },
  {
    id: 'dua-rely-on-you',
    kind: 'dua',
    arabic: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    english:
      'Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.',
    reference: "Qur'an 9:129",
    referenceAr: 'التوبة ١٢٩',
  },
  {
    id: 'dua-accept-prayer',
    kind: 'dua',
    arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
    english:
      'My Lord, make me an establisher of prayer, and many from my descendants. Our Lord, and accept my supplication.',
    reference: "Qur'an 14:40",
    referenceAr: 'إبراهيم ٤٠',
    prayerThemed: true,
  },
];

/** Deterministic-ish index from current time, for the non-seeded random pickers. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * A random inspiration item. Pass a {@link InspirationKind} to restrict to one
 * kind (e.g. only du'as); otherwise picks from the whole pool.
 */
export function randomInspiration(kind?: InspirationKind): InspirationItem {
  const pool = kind ? INSPIRATION.filter((i) => i.kind === kind) : INSPIRATION;
  return pick(pool.length ? pool : INSPIRATION);
}

/**
 * An inspiration item suited to a prayer reminder: prefers prayer-themed items
 * (salah, drawing near, the coolness of the eyes), and falls back to the full
 * pool if none are available.
 */
export function inspirationForPrayer(): InspirationItem {
  const prayer = INSPIRATION.filter((i) => i.prayerThemed);
  return pick(prayer.length ? prayer : INSPIRATION);
}
