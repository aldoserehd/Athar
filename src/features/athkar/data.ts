/**
 * Daily adhkār — authentic supplications from حِصن المسلم (Hisn al-Muslim,
 * "Fortress of the Muslim" by Saʿīd al-Qaḥṭānī), the standard reference used by
 * Muslim apps worldwide. Every item carries its Arabic text, an English meaning,
 * how many times it is recited (`repeat`), and its source so the user can trust
 * it. Content is bundled offline — there is no network dependency.
 */

export type Dhikr = {
  id: string;
  arabic: string;
  translation: string;
  /** Number of times the dhikr is recited. */
  repeat: number;
  /** Hadith collection / source attribution. */
  reference: string;
  /** Optional reward/benefit, shown as a subtle note. */
  virtue?: string;
  virtueAr?: string;
};

export type AthkarCategoryId = 'morning' | 'evening' | 'afterPrayer' | 'sleep' | 'waking';

export type AthkarCategory = {
  id: AthkarCategoryId;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  /** Ionicons name (kept as a string so the data file stays icon-agnostic). */
  icon: string;
  items: Dhikr[];
};

const IKHLAS_FALAQ_NAS = (repeat: number, when: 'morning' | 'evening'): Dhikr => ({
  id: `muawwidhat-${when}`,
  arabic:
    'قُلْ هُوَ اللَّهُ أَحَدٌ … (الإخلاص) ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … (الفلق) ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ … (الناس)',
  translation:
    'Recite Sūrat al-Ikhlāṣ, al-Falaq and an-Nās. Whoever says them three times morning and evening, they will suffice him against all things.',
  repeat,
  reference: 'Abu Dawud · Tirmidhi',
});

const morning: Dhikr[] = [
  {
    id: 'ayat-kursi',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    translation:
      'Āyat al-Kursī. Whoever recites it in the morning is protected from the jinn until evening.',
    repeat: 1,
    reference: 'Al-Baqarah 2:255 · al-Hakim',
  },
  IKHLAS_FALAQ_NAS(3, 'morning'),
  {
    id: 'asbahna',
    arabic:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ',
    translation:
      'We have entered the morning and the dominion belongs to Allah. My Lord, I ask You for the good of this day and the good after it, and seek refuge in You from the evil of this day and the evil after it.',
    repeat: 1,
    reference: 'Muslim',
  },
  {
    id: 'sayyid-istighfar',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translation:
      'The chief of seeking forgiveness (Sayyid al-Istighfār). Whoever says it with conviction in the day and dies that day enters Paradise.',
    repeat: 1,
    reference: 'Bukhari',
  },
  {
    id: 'allahumma-bika-asbahna',
    arabic:
      'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    translation:
      'O Allah, by You we enter the morning and the evening, by You we live and die, and to You is the resurrection.',
    repeat: 1,
    reference: 'Tirmidhi',
  },
  {
    id: 'afni-badani',
    arabic:
      'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    translation:
      'O Allah, grant my body health, grant my hearing health, grant my sight health. None has the right to be worshipped but You.',
    repeat: 3,
    reference: 'Abu Dawud',
  },
  {
    id: 'hasbiyallah',
    arabic:
      'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    translation:
      'Allah is sufficient for me; none has the right to be worshipped but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.',
    repeat: 7,
    reference: 'Abu Dawud',
  },
  {
    id: 'afw-afiyah',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',
    translation:
      'O Allah, I ask You for pardon and well-being in this world and the next; in my religion, my worldly life, my family and my wealth.',
    repeat: 1,
    reference: 'Abu Dawud · Ibn Majah',
  },
  {
    id: 'bismillah-la-yadurru',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation:
      'In the name of Allah, with whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
    repeat: 3,
    reference: 'Abu Dawud · Tirmidhi',
    virtue: 'Nothing will harm whoever says it three times.',
    virtueAr: 'لم يضره شيء من قاله ثلاثًا.',
  },
  {
    id: 'raditu-billah',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    translation:
      'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    repeat: 3,
    reference: 'Abu Dawud · Tirmidhi',
    virtue: 'A promise that Allah will please whoever says it.',
    virtueAr: 'حقّ على الله أن يُرضيه يوم القيامة.',
  },
  {
    id: 'ya-hayyu-ya-qayyum',
    arabic:
      'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    translation:
      'O Ever-Living, O Sustainer, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself even for the blink of an eye.',
    repeat: 1,
    reference: 'al-Hakim · an-Nasa’i',
  },
  {
    id: 'subhanallah-bihamdihi-100',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    translation:
      'Glory and praise be to Allah. Whoever says it 100 times has his sins forgiven though they be as the foam of the sea.',
    repeat: 100,
    reference: 'Bukhari · Muslim',
  },
  {
    id: 'tahlil-100-morning',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation:
      'None has the right to be worshipped but Allah alone, with no partner. His is the dominion and praise, and He is able to do all things.',
    repeat: 10,
    reference: 'Bukhari · Muslim',
  },
];

const evening: Dhikr[] = [
  morning[0], // Āyat al-Kursī
  IKHLAS_FALAQ_NAS(3, 'evening'),
  {
    id: 'amsayna',
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا',
    translation:
      'We have entered the evening and the dominion belongs to Allah. My Lord, I ask You for the good of this night and what follows it, and seek refuge from its evil and what follows it.',
    repeat: 1,
    reference: 'Muslim',
  },
  morning[3], // Sayyid al-Istighfār
  {
    id: 'allahumma-bika-amsayna',
    arabic:
      'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    translation:
      'O Allah, by You we enter the evening and the morning, by You we live and die, and to You is the return.',
    repeat: 1,
    reference: 'Tirmidhi',
  },
  {
    id: 'kalimat-tammat',
    arabic:
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation:
      'I seek refuge in the perfect words of Allah from the evil of what He created. Whoever says it three times in the evening, no poison or pest will harm him that night.',
    repeat: 3,
    reference: 'Muslim',
  },
  morning[5], // ʿāfinī fī badanī
  morning[6], // ḥasbiyallāh
  morning[7], // ʿafw wa ʿāfiyah
  morning[8], // bismillāh alladhī lā yaḍurr
  morning[11], // subḥānallāh wa biḥamdihi ×100
];

const afterPrayer: Dhikr[] = [
  {
    id: 'istighfar-3',
    arabic:
      'أَسْتَغْفِرُ اللَّهَ (ثلاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    translation:
      'I seek Allah’s forgiveness (×3). O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honour.',
    repeat: 1,
    reference: 'Muslim',
  },
  {
    id: 'la-mani',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    translation:
      'None has the right to be worshipped but Allah alone… O Allah, none can withhold what You give, and none can give what You withhold, and no wealth avails its owner against You.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
  },
  {
    id: 'subhanallah-33',
    arabic: 'سُبْحَانَ اللَّهِ',
    translation: 'Glory be to Allah.',
    repeat: 33,
    reference: 'Muslim',
  },
  {
    id: 'alhamdulillah-33',
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'All praise is for Allah.',
    repeat: 33,
    reference: 'Muslim',
  },
  {
    id: 'allahuakbar-33',
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest.',
    repeat: 33,
    reference: 'Muslim',
  },
  {
    id: 'tahlil-after',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation:
      'None has the right to be worshipped but Allah alone… (completing the count to one hundred). His sins are forgiven though they be as the foam of the sea.',
    repeat: 1,
    reference: 'Muslim',
  },
  {
    id: 'ayat-kursi-after',
    arabic: 'آيَةُ الْكُرْسِيِّ (تُقرأ بعد كل صلاة مفروضة)',
    translation:
      'Recite Āyat al-Kursī after every obligatory prayer — nothing keeps the reciter from Paradise except death.',
    repeat: 1,
    reference: 'an-Nasa’i',
  },
];

const sleep: Dhikr[] = [
  {
    id: 'sleep-muawwidhat',
    arabic:
      'يَجْمَعُ كَفَّيْهِ ثُمَّ يَقْرَأُ: قُلْ هُوَ اللَّهُ أَحَدٌ، وَالْمُعَوِّذَتَيْنِ، ثُمَّ يَنْفُثُ فِيهِمَا وَيَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ',
    translation:
      'Cup your hands, recite al-Ikhlāṣ, al-Falaq and an-Nās, blow into them and wipe over your body — beginning with the head and face — three times.',
    repeat: 3,
    reference: 'Bukhari',
  },
  {
    id: 'sleep-ayat-kursi',
    arabic: 'آيَةُ الْكُرْسِيِّ',
    translation:
      'Recite Āyat al-Kursī before sleeping — a guardian from Allah remains over you and no devil approaches until morning.',
    repeat: 1,
    reference: 'Bukhari',
  },
  {
    id: 'sleep-baqarah',
    arabic: 'آخِرُ آيَتَيْنِ مِنْ سُورَةِ الْبَقَرَةِ',
    translation:
      'Recite the last two verses of Sūrat al-Baqarah — whoever recites them at night, they will suffice him.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
  },
  {
    id: 'sleep-bismika',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    translation:
      'In Your name, my Lord, I lay down my side and by You I raise it. If You take my soul, have mercy on it; if You release it, protect it as You protect Your righteous servants.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
  },
  {
    id: 'sleep-aslamtu',
    arabic:
      'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
    translation:
      'O Allah, I submit myself to You, entrust my affair to You, and turn my face to You out of hope and fear of You. There is no refuge from You except to You. I believe in Your Book and Your Prophet.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
    virtue: 'If you die that night, you die upon the natural disposition (fiṭrah).',
    virtueAr: 'من قالها ومات تلك الليلة مات على الفطرة.',
  },
  {
    id: 'sleep-bismika-amut',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translation: 'In Your name, O Allah, I die and I live.',
    repeat: 1,
    reference: 'Bukhari',
  },
  {
    id: 'sleep-tasbih-fatimah',
    arabic:
      'سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٤)',
    translation:
      'The tasbīḥ of Fāṭimah: Glory be to Allah (×33), praise be to Allah (×33), Allah is the Greatest (×34) before sleeping.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
  },
];

const waking: Dhikr[] = [
  {
    id: 'waking-alhamdulillah',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translation:
      'All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.',
    repeat: 1,
    reference: 'Bukhari · Muslim',
  },
  {
    id: 'waking-la-ilaha',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    translation:
      'None has the right to be worshipped but Allah alone… Whoever says this on waking and asks forgiveness, his supplication is answered.',
    repeat: 1,
    reference: 'Bukhari',
  },
  {
    id: 'waking-aalimran',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي رَدَّ عَلَيَّ رُوحِي، وَعَافَانِي فِي جَسَدِي، وَأَذِنَ لِي بِذِكْرِهِ',
    translation:
      'All praise is for Allah who restored my soul, gave my body health, and permitted me to remember Him.',
    repeat: 1,
    reference: 'Tirmidhi',
  },
];

export const ATHKAR_CATEGORIES: AthkarCategory[] = [
  {
    id: 'morning',
    titleEn: 'Morning Athkar',
    titleAr: 'أذكار الصباح',
    subtitleEn: 'After Fajr until sunrise',
    subtitleAr: 'بعد الفجر حتى الشروق',
    icon: 'sunny-outline',
    items: morning,
  },
  {
    id: 'evening',
    titleEn: 'Evening Athkar',
    titleAr: 'أذكار المساء',
    subtitleEn: 'After Asr until Maghrib',
    subtitleAr: 'بعد العصر حتى المغرب',
    icon: 'moon-outline',
    items: evening,
  },
  {
    id: 'afterPrayer',
    titleEn: 'After Salah',
    titleAr: 'أذكار بعد الصلاة',
    subtitleEn: 'Following each obligatory prayer',
    subtitleAr: 'بعد كل صلاة مفروضة',
    icon: 'checkmark-done-outline',
    items: afterPrayer,
  },
  {
    id: 'sleep',
    titleEn: 'Before Sleep',
    titleAr: 'أذكار النوم',
    subtitleEn: 'When going to bed',
    subtitleAr: 'عند النوم',
    icon: 'bed-outline',
    items: sleep,
  },
  {
    id: 'waking',
    titleEn: 'On Waking',
    titleAr: 'أذكار الاستيقاظ',
    subtitleEn: 'When you wake up',
    subtitleAr: 'عند الاستيقاظ من النوم',
    icon: 'alarm-outline',
    items: waking,
  },
];

export function athkarCategory(id: AthkarCategoryId): AthkarCategory | undefined {
  return ATHKAR_CATEGORIES.find((c) => c.id === id);
}
