import { Hadith } from './types';

/**
 * A curated, offline seed of well-known authentic narrations across the six
 * major Sunni collections — every entry is `sahih` or `hasan`. Phase 2 ships
 * this bundled dataset to power the UI, daily hadith and inspiration; the bulk
 * `corpus.json` extends coverage. Arabic, references and gradings follow the
 * standard prints / sunnah.com numbering, and the rich fields (narrator, isnād,
 * explanation) are provided in BOTH English and Arabic so the detail screen can
 * be fully bilingual.
 */
export const HADITHS: Hadith[] = [
  {
    id: 'bukhari-1',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 1',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english:
      'Actions are but by intentions, and every person will have only what they intended.',
    narrator: 'Umar ibn al-Khattab',
    narratorAr: 'عُمَر بن الخطّاب',
    chain: ['Umar ibn al-Khattab', 'Alqama ibn Waqqas', 'Muhammad ibn Ibrahim', 'Yahya ibn Sa‘id'],
    chainAr: ['عُمَر بن الخطّاب', 'علقمة بن وقّاص', 'محمّد بن إبراهيم', 'يحيى بن سعيد'],
    grade: 'sahih',
    topics: ['Intentions', 'Sincerity'],
    explanation:
      'The foundation of Islamic ethics: the worth of any deed depends on the intention behind it. Ordinary acts become worship when done sincerely for Allah.',
    explanationAr:
      'أصلٌ من أصول الإسلام: قيمة كلِّ عملٍ بحسب النيّة التي وراءه، فتصير العادات عباداتٍ إذا قُصد بها وجه الله.',
  },
  {
    id: 'muslim-55',
    collection: 'muslim',
    reference: 'Sahih Muslim 55',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    english:
      '“The religion is sincerity (naseehah).” We said: To whom? He said: “To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.”',
    narrator: 'Tamim al-Dari',
    narratorAr: 'تميم الدّاري',
    chain: ['Tamim al-Dari', 'Suhayl ibn Abi Salih'],
    chainAr: ['تميم الدّاري', 'سهيل بن أبي صالح'],
    grade: 'sahih',
    topics: ['Sincerity', 'Brotherhood'],
    explanation:
      'True religion is wishing good and being honest — toward Allah, His revelation, His Messenger, and toward both leaders and ordinary people.',
    explanationAr:
      'الدِّين كلُّه نُصحٌ وإخلاص: لله، ولكتابه، ولرسوله، ولأئمّة المسلمين وعامّتهم.',
  },
  {
    id: 'bukhari-13',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 13',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english:
      'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Malik',
    narratorAr: 'أنس بن مالك',
    chain: ['Anas ibn Malik', 'Qatada'],
    chainAr: ['أنس بن مالك', 'قتادة'],
    grade: 'sahih',
    topics: ['Brotherhood', 'Kindness'],
    explanation:
      'Complete faith includes wanting the same good for others that you want for yourself — a cure for envy and selfishness.',
    explanationAr:
      'كمالُ الإيمان أن تحبَّ لإخوانك من الخير ما تحبُّه لنفسك، وفي ذلك دواءٌ للحسد والأنانيّة.',
  },
  {
    id: 'bukhari-6114',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6114',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    english:
      'The strong person is not the one who overcomes others by strength, but the one who controls himself when angry.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'al-A‘raj'],
    chainAr: ['أبو هريرة', 'الأعرج'],
    grade: 'sahih',
    topics: ['Anger', 'Patience'],
    explanation:
      'Real strength is self-mastery. Restraining anger in the heat of the moment is greater than physical power.',
    explanationAr:
      'القوّة الحقيقيّة هي ملكُ النفس، وكظمُ الغيظ عند ثورته أعظمُ من القوّة البدنيّة.',
  },
  {
    id: 'tirmidhi-1924',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 1924',
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    english:
      'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth and the One above the heavens will be merciful to you.',
    narrator: 'Abdullah ibn Amr',
    narratorAr: 'عبد الله بن عمرو',
    chain: ['Abdullah ibn Amr ibn al-As'],
    chainAr: ['عبد الله بن عمرو بن العاص'],
    grade: 'hasan',
    topics: ['Kindness', 'Mercy'],
    explanation:
      'Mercy is reciprocal: show compassion to all creation — people and animals — and you invite the mercy of Allah upon yourself.',
    explanationAr:
      'الرحمة متبادَلة: ارحَم الخلقَ جميعًا من الناس والحيوان يرحمْك الله سبحانه.',
  },
  {
    id: 'muslim-47',
    collection: 'muslim',
    reference: 'Sahih Muslim 47',
    arabic:
      'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ',
    english:
      'Whoever believes in Allah and the Last Day, let him speak good or remain silent; and whoever believes in Allah and the Last Day, let him honour his neighbour.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Abu Salih'],
    chainAr: ['أبو هريرة', 'أبو صالح'],
    grade: 'sahih',
    topics: ['Neighbours', 'Kindness'],
    explanation:
      'Faith shows in two everyday habits: guarding the tongue (speak good or stay quiet) and treating neighbours generously.',
    explanationAr:
      'يظهر الإيمان في خصلتين يوميّتين: حفظ اللسان بقول الخير أو الصمت، وإكرام الجار.',
  },
  {
    id: 'tirmidhi-1956',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 1956',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    english: 'Your smiling in the face of your brother is charity.',
    narrator: 'Abu Dharr al-Ghifari',
    narratorAr: 'أبو ذرّ الغفاري',
    chain: ['Abu Dharr al-Ghifari'],
    chainAr: ['أبو ذرّ الغفاري'],
    grade: 'hasan',
    topics: ['Charity', 'Kindness'],
    explanation:
      'Charity is not only money. A warm smile that brings ease to another is itself a rewarded act of giving.',
    explanationAr:
      'الصدقة ليست بالمال فحسب؛ فابتسامتك في وجه أخيك تُدخل السرور عليه وهي صدقةٌ مأجورة.',
  },
  {
    id: 'muslim-223',
    collection: 'muslim',
    reference: 'Sahih Muslim 223',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    english: 'Purity is half of faith.',
    narrator: 'Abu Malik al-Ash‘ari',
    narratorAr: 'أبو مالك الأشعري',
    chain: ['Abu Malik al-Ash‘ari'],
    chainAr: ['أبو مالك الأشعري'],
    grade: 'sahih',
    topics: ['Purity', 'Worship'],
    explanation:
      'Outward and inward purification hold a great share of the faith — cleanliness of body and heart prepares one to stand before Allah.',
    explanationAr:
      'الطهارة ظاهرًا وباطنًا شطرٌ عظيمٌ من الإيمان، وبها يتهيّأ العبد للوقوف بين يدي الله.',
  },
  {
    id: 'abudawud-4682',
    collection: 'abudawud',
    reference: 'Sunan Abi Dawud 4682',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    english:
      'The most complete of the believers in faith is the best of them in character.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Muhammad ibn Amr'],
    chainAr: ['أبو هريرة', 'محمّد بن عمرو'],
    grade: 'hasan',
    topics: ['Good character', 'Kindness'],
    explanation:
      'Good manners are a measure of faith. Refining one’s character is part of perfecting one’s belief.',
    explanationAr:
      'حُسن الخُلق ميزانٌ للإيمان، وتهذيبُ الأخلاق جزءٌ من كمال الدّين.',
  },
  {
    id: 'tirmidhi-1987',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 1987',
    arabic:
      'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    english:
      'Be mindful of Allah wherever you are, follow a bad deed with a good one to wipe it out, and treat people with good character.',
    narrator: 'Abu Dharr al-Ghifari',
    narratorAr: 'أبو ذرّ الغفاري',
    chain: ['Abu Dharr al-Ghifari', 'Mu‘adh ibn Jabal'],
    chainAr: ['أبو ذرّ الغفاري', 'معاذ بن جبل'],
    grade: 'hasan',
    topics: ['Good character', 'Patience'],
    explanation:
      'A complete code of conduct: God-consciousness in private and public, erasing mistakes with good deeds, and kindness toward people.',
    explanationAr:
      'منهجٌ متكامل: تقوى الله في السرّ والعلن، ومحوُ السيّئة بالحسنة، ومعاملةُ الناس بخُلقٍ حسن.',
  },
  {
    id: 'nasai-3940',
    collection: 'nasai',
    reference: "Sunan an-Nasa'i 3940",
    arabic: 'حُبِّبَ إِلَىَّ مِنَ الدُّنْيَا النِّسَاءُ وَالطِّيبُ، وَجُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلاَةِ',
    english:
      'Made beloved to me from your world are women and perfume, and the coolness of my eyes is in prayer.',
    narrator: 'Anas ibn Malik',
    narratorAr: 'أنس بن مالك',
    chain: ['Anas ibn Malik'],
    chainAr: ['أنس بن مالك'],
    grade: 'sahih',
    topics: ['Worship', 'Prayer'],
    explanation:
      'The Prophet ﷺ found his deepest comfort and delight in prayer — a reminder that salah is meant to be a source of peace, not a burden.',
    explanationAr:
      'كان النبيُّ ﷺ يجد راحتَه وقُرّة عينه في الصلاة، تذكيرًا بأنّ الصلاة سكينةٌ لا كُلفة.',
  },
  {
    id: 'ibnmajah-224',
    collection: 'ibnmajah',
    reference: 'Sunan Ibn Majah 224',
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    english: 'Seeking knowledge is an obligation upon every Muslim.',
    narrator: 'Anas ibn Malik',
    narratorAr: 'أنس بن مالك',
    chain: ['Anas ibn Malik'],
    chainAr: ['أنس بن مالك'],
    grade: 'hasan',
    topics: ['Knowledge', 'Worship'],
    explanation:
      'Learning what one needs to practise the religion correctly is a duty on every believer, man and woman alike.',
    explanationAr:
      'تعلُّم ما يحتاجه المرء لإقامة دينه فريضةٌ على كلّ مسلمٍ ومسلمة.',
  },

  // ── Salah, nearness to Allah, hope & mercy (foundational, most looked-up) ──
  {
    id: 'tirmidhi-413',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 413',
    arabic:
      'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلاَتُهُ، فَإِنْ صَلَحَتْ فَقَدْ أَفْلَحَ وَأَنْجَحَ، وَإِنْ فَسَدَتْ فَقَدْ خَابَ وَخَسِرَ',
    english:
      'The first of a person’s deeds to be judged on the Day of Resurrection will be the prayer. If it is sound he has succeeded and prospered, and if it is ruined he has failed and lost.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Abu al-‘Aliya'],
    chainAr: ['أبو هريرة', 'أبو العالية'],
    grade: 'sahih',
    topics: ['Prayer', 'Worship'],
    explanation:
      'Prayer is the first deed reckoned on Judgement Day. Guard it well, for the rest of the account follows its soundness.',
    explanationAr:
      'الصلاة أوّلُ ما يُحاسَب عليه العبد يوم القيامة، فإن صلَحت صلَح سائرُ عمله، فاحرص عليها.',
  },
  {
    id: 'bukhari-528',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 528',
    arabic:
      'أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسًا، مَا تَقُولُ ذَلِكَ يُبْقِي مِنْ دَرَنِهِ؟ قَالُوا لاَ يُبْقِي مِنْ دَرَنِهِ شَيْئًا، قَالَ فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا',
    english:
      'If there were a river at the door of one of you in which he bathed five times a day, would any dirt remain on him? They said: No dirt would remain. He said: That is the likeness of the five prayers, by which Allah wipes away sins.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Abu Salih', 'al-A‘mash'],
    chainAr: ['أبو هريرة', 'أبو صالح', 'الأعمش'],
    grade: 'sahih',
    topics: ['Prayer', 'Repentance'],
    explanation:
      'The five daily prayers cleanse the soul like a river washing the body — a constant, renewable purification from sin.',
    explanationAr:
      'الصلوات الخمس تُطهّر النفس كما يُطهّر النهرُ البدن؛ تكفيرٌ متجدّدٌ للذنوب كلّ يوم.',
  },
  {
    id: 'muslim-2702',
    collection: 'muslim',
    reference: 'Sahih Muslim 2702',
    arabic: 'وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً',
    english:
      'By Allah, I seek Allah’s forgiveness and turn to Him in repentance more than seventy times a day.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra'],
    chainAr: ['أبو هريرة'],
    grade: 'sahih',
    topics: ['Repentance', 'Remembrance'],
    explanation:
      'Even the Prophet ﷺ, whose sins were forgiven, constantly sought forgiveness — teaching us that turning to Allah is a daily way of life.',
    explanationAr:
      'كان النبيُّ ﷺ مع مغفرة ذنبه يُكثر الاستغفار، تعليمًا لنا أنّ التوبة إلى الله دأبٌ يوميّ.',
  },
  {
    id: 'bukhari-7405',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 7405',
    arabic:
      'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلإٍ ذَكَرْتُهُ فِي مَلإٍ خَيْرٍ مِنْهُمْ',
    english:
      'Allah says: I am as My servant thinks of Me, and I am with him when he remembers Me. If he remembers Me within himself, I remember him within Myself; and if he mentions Me in a gathering, I mention him in a better gathering.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'al-A‘raj', 'Abu al-Zinad'],
    chainAr: ['أبو هريرة', 'الأعرج', 'أبو الزّناد'],
    grade: 'sahih',
    topics: ['Remembrance', 'Trust in Allah'],
    explanation:
      'Hold a good opinion of Allah and remember Him often: He responds in kind, drawing near to the one who draws near to Him.',
    explanationAr:
      'أحسِن ظنّك بالله وأكثِر ذكره، فهو سبحانه عند ظنّ عبده به، ويقترب ممّن اقترب إليه.',
  },
  {
    id: 'bukhari-6502',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6502',
    arabic:
      'وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَىَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ كُنْتُ سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ',
    english:
      'My servant continues to draw near to Me with voluntary works until I love him. And when I love him, I become his hearing with which he hears and his sight with which he sees.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Sharik', 'Khalid ibn Makhlad'],
    chainAr: ['أبو هريرة', 'شريك', 'خالد بن مخلد'],
    grade: 'sahih',
    topics: ['Worship', 'Trust in Allah'],
    explanation:
      'Beyond the obligations, voluntary acts of worship earn Allah’s love and a nearness that guides every faculty of the believer.',
    explanationAr:
      'بعد الفرائض، تُكسب النوافلُ محبّةَ الله وقربًا يُسدّد به جوارح المؤمن كلَّها.',
  },
  {
    id: 'bukhari-6308',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6308',
    arabic:
      'لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ حِينَ يَتُوبُ إِلَيْهِ مِنْ أَحَدِكُمْ كَانَ عَلَى رَاحِلَتِهِ بِأَرْضِ فَلاَةٍ فَانْفَلَتَتْ مِنْهُ وَعَلَيْهَا طَعَامُهُ وَشَرَابُهُ فَأَيِسَ مِنْهَا',
    english:
      'Allah is more joyful at the repentance of His servant than one of you who, having lost his mount carrying his food and drink in a barren land and despaired of it, then suddenly finds it again.',
    narrator: 'Anas ibn Malik',
    narratorAr: 'أنس بن مالك',
    chain: ['Anas ibn Malik', 'Qatada'],
    chainAr: ['أنس بن مالك', 'قتادة'],
    grade: 'sahih',
    topics: ['Repentance', 'Mercy'],
    explanation:
      'No matter how far one has strayed, Allah’s joy at a returning servant is immense — never despair of turning back to Him.',
    explanationAr:
      'مهما بعُد العبد، فإنّ فرح الله بتوبته عظيم؛ فلا تيأس من الرجوع إليه سبحانه.',
  },
  {
    id: 'muslim-2675',
    collection: 'muslim',
    reference: 'Sahih Muslim 2675',
    arabic:
      'يَقُولُ اللَّهُ تَعَالَى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا دَعَانِي',
    english:
      'Allah the Exalted says: I am as My servant expects Me to be, and I am with him when he calls upon Me.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'al-A‘raj'],
    chainAr: ['أبو هريرة', 'الأعرج'],
    grade: 'sahih',
    topics: ['Trust in Allah', 'Remembrance'],
    explanation:
      'Call upon Allah with hope and good expectation; He is near to those who turn to Him in supplication.',
    explanationAr:
      'ادعُ الله راجيًا حُسن ظنّك به، فهو قريبٌ ممّن دعاه ولجأ إليه.',
  },
  {
    id: 'bukhari-6407',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6407',
    arabic:
      'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ مَثَلُ الْحَىِّ وَالْمَيِّتِ',
    english:
      'The likeness of the one who remembers his Lord and the one who does not is that of the living and the dead.',
    narrator: 'Abu Musa al-Ash‘ari',
    narratorAr: 'أبو موسى الأشعري',
    chain: ['Abu Musa al-Ash‘ari', 'Abu Burda'],
    chainAr: ['أبو موسى الأشعري', 'أبو بُردة'],
    grade: 'sahih',
    topics: ['Remembrance', 'Worship'],
    explanation:
      'Remembrance of Allah is the life of the heart. Without it the heart grows dead, however busy the body may be.',
    explanationAr:
      'ذكرُ الله حياةُ القلب؛ ومن غفل عنه مات قلبه وإن كان بدنه مشغولًا.',
  },
  {
    id: 'muslim-2699',
    collection: 'muslim',
    reference: 'Sahih Muslim 2699',
    arabic:
      'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ',
    english:
      'Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship on the Day of Resurrection; and Allah helps His servant so long as the servant helps his brother.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Abu Salih', 'al-A‘mash'],
    chainAr: ['أبو هريرة', 'أبو صالح', 'الأعمش'],
    grade: 'sahih',
    topics: ['Brotherhood', 'Kindness'],
    explanation:
      'Help others through their difficulties and Allah will help you through yours — a promise of divine aid for those who serve their fellow believers.',
    explanationAr:
      'فرِّج عن الناس كُرَبهم يُفرّج الله عنك، فالله في عون العبد ما دام في عون أخيه.',
  },
  {
    id: 'muslim-2564',
    collection: 'muslim',
    reference: 'Sahih Muslim 2564',
    arabic:
      'إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    english:
      'Indeed Allah does not look at your bodies or your wealth, but He looks at your hearts and your deeds.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'al-A‘raj'],
    chainAr: ['أبو هريرة', 'الأعرج'],
    grade: 'sahih',
    topics: ['Sincerity', 'Intentions'],
    explanation:
      'Allah judges by the state of the heart and the reality of deeds, not by appearance or status — so purify your intention.',
    explanationAr:
      'الله ينظر إلى القلوب والأعمال لا إلى الصور والأموال، فأخلِص نيّتك وأصلِح قلبك.',
  },
  {
    id: 'bukhari-660',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 660',
    arabic:
      'سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لاَ ظِلَّ إِلاَّ ظِلُّهُ ... وَرَجُلٌ ذَكَرَ اللَّهَ خَالِيًا فَفَاضَتْ عَيْنَاهُ',
    english:
      'Seven will be shaded by Allah on the Day when there is no shade but His … and a man who remembered Allah in private and his eyes overflowed with tears.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Khubayb ibn Abd al-Rahman'],
    chainAr: ['أبو هريرة', 'خُبيب بن عبد الرحمن'],
    grade: 'sahih',
    topics: ['Remembrance', 'Sincerity'],
    explanation:
      'Among those granted Allah’s shade on Judgement Day is the one who remembers Him privately until tears flow — sincere, hidden devotion is treasured.',
    explanationAr:
      'من السبعة الذين يُظلّهم الله من ذكره خاليًا ففاضت عيناه؛ فالعبادة الخفيّة الصادقة محفوظة عند الله.',
  },
  {
    id: 'muslim-2588',
    collection: 'muslim',
    reference: 'Sahih Muslim 2588',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا',
    english:
      'Charity does not decrease wealth, and Allah increases the one who forgives only in honour.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', "al-‘Ala' ibn Abd al-Rahman"],
    chainAr: ['أبو هريرة', 'العلاء بن عبد الرحمن'],
    grade: 'sahih',
    topics: ['Charity', 'Good character'],
    explanation:
      'Giving never truly diminishes wealth, and pardoning others raises a person in dignity — generosity and forgiveness bring blessing.',
    explanationAr:
      'لا تنقص الصدقةُ مالًا، والعفوُ يزيد صاحبه عزًّا؛ فالكرمُ والصفحُ بركةٌ ورفعة.',
  },
  {
    id: 'tirmidhi-2517',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 2517',
    arabic: 'احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ',
    english:
      'Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you.',
    narrator: 'Abdullah ibn Abbas',
    narratorAr: 'عبد الله بن عبّاس',
    chain: ['Abdullah ibn Abbas', 'Hanash al-San‘ani'],
    chainAr: ['عبد الله بن عبّاس', 'حَنَش الصنعاني'],
    grade: 'hasan',
    topics: ['Trust in Allah', 'Patience'],
    explanation:
      'Keep Allah’s commands and limits, and you will find His protection and help with you wherever you turn.',
    explanationAr:
      'احفَظ حدود الله وأوامره تجد حفظه ومعونته معك حيثما توجّهت.',
  },
  {
    id: 'tirmidhi-3540',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 3540',
    arabic:
      'يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلاَ أُبَالِي',
    english:
      'O son of Adam, as long as you call upon Me and place your hope in Me, I will forgive you whatever you have done, and I will not mind.',
    narrator: 'Anas ibn Malik',
    narratorAr: 'أنس بن مالك',
    chain: ['Anas ibn Malik', 'Kathir ibn Fa’id'],
    chainAr: ['أنس بن مالك', 'كثير بن فائد'],
    grade: 'hasan',
    topics: ['Repentance', 'Mercy'],
    explanation:
      'Allah’s mercy is vast beyond measure. So long as a servant calls on Him with hope, forgiveness is never out of reach.',
    explanationAr:
      'رحمة الله واسعة لا حدّ لها، فما دام العبد يدعوه راجيًا فبابُ المغفرة مفتوح.',
  },
  {
    id: 'muslim-2577',
    collection: 'muslim',
    reference: 'Sahih Muslim 2577',
    arabic:
      'يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلاَ تَظَالَمُوا',
    english:
      'O My servants, I have forbidden injustice for Myself and made it forbidden among you, so do not wrong one another.',
    narrator: 'Abu Dharr al-Ghifari',
    narratorAr: 'أبو ذرّ الغفاري',
    chain: ['Abu Dharr al-Ghifari'],
    chainAr: ['أبو ذرّ الغفاري'],
    grade: 'sahih',
    topics: ['Good character', 'Mercy'],
    explanation:
      'In this sacred hadith Allah forbids injustice to Himself and commands fairness among people — the heart of a just and merciful life.',
    explanationAr:
      'في هذا الحديث القدسي حرّم الله الظلم على نفسه وأمر بالعدل بين الناس، وذلك أساس الحياة العادلة الرحيمة.',
  },
  {
    id: 'bukhari-6010',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6011',
    arabic:
      'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى',
    english:
      'The believers in their mutual love, mercy and compassion are like a single body: when one limb suffers, the whole body responds with wakefulness and fever.',
    narrator: 'al-Nu‘man ibn Bashir',
    narratorAr: 'النعمان بن بشير',
    chain: ['al-Nu‘man ibn Bashir', 'al-Sha‘bi'],
    chainAr: ['النعمان بن بشير', 'الشعبي'],
    grade: 'sahih',
    topics: ['Brotherhood', 'Mercy'],
    explanation:
      'The community of believers is one body. The pain of any member should move the rest to care and concern.',
    explanationAr:
      'المؤمنون جسدٌ واحد، فألمُ أيّ فردٍ منهم يحرّك سائرهم للرحمة والتعاطف.',
  },
  {
    id: 'bukhari-39',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 39',
    arabic:
      'إِنَّ الدِّينَ يُسْرٌ، وَلَنْ يُشَادَّ الدِّينَ أَحَدٌ إِلاَّ غَلَبَهُ، فَسَدِّدُوا وَقَارِبُوا وَأَبْشِرُوا',
    english:
      'Religion is ease, and no one overburdens himself in religion but it overcomes him. So aim for what is right, draw near, and be of good cheer.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Abu Salih'],
    chainAr: ['أبو هريرة', 'أبو صالح'],
    grade: 'sahih',
    topics: ['Patience', 'Worship'],
    explanation:
      'Worship is meant to be sustainable. Be moderate and consistent rather than extreme, and take glad tidings in steady effort.',
    explanationAr:
      'الدّين يُسرٌ، فالزَم الاعتدال والاستقامة دون تشدّد، وأبشِر بثبات العمل ودوامه.',
  },
  {
    id: 'bukhari-6464',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6464',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    english:
      'The deeds most beloved to Allah are the most constant, even if they are few.',
    narrator: 'Aisha bint Abi Bakr',
    narratorAr: 'عائشة بنت أبي بكر',
    chain: ['Aisha bint Abi Bakr', 'Abu Salama'],
    chainAr: ['عائشة بنت أبي بكر', 'أبو سلمة'],
    grade: 'sahih',
    topics: ['Worship', 'Patience'],
    explanation:
      'A small act of worship done regularly is dearer to Allah than a large one done once. Consistency outweighs intensity.',
    explanationAr:
      'العملُ القليلُ الدائمُ أحبُّ إلى الله من الكثير المنقطع؛ فالمداومة خيرٌ من الكثرة العارضة.',
  },
  {
    id: 'muslim-2156',
    collection: 'muslim',
    reference: 'Sahih Muslim 482',
    arabic:
      'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ',
    english:
      'The closest a servant is to his Lord is when he is in prostration, so make much supplication.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', "al-A‘raj"],
    chainAr: ['أبو هريرة', 'الأعرج'],
    grade: 'sahih',
    topics: ['Prayer', 'Worship'],
    explanation:
      'Prostration is the moment of greatest nearness to Allah. Pour out your supplications while your forehead is on the ground.',
    explanationAr:
      'أقربُ ما يكون العبد من ربّه في سجوده، فأكثِر من الدعاء وأنت ساجد.',
  },
  {
    id: 'bukhari-6306',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6306',
    arabic:
      'سَيِّدُ الاِسْتِغْفَارِ أَنْ تَقُولَ اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    english:
      'The best manner of seeking forgiveness is to say: O Allah, You are my Lord, there is no god but You. You created me and I am Your servant…',
    narrator: 'Shaddad ibn Aws',
    narratorAr: 'شدّاد بن أوس',
    chain: ['Shaddad ibn Aws', 'Abdullah ibn Burayda'],
    chainAr: ['شدّاد بن أوس', 'عبد الله بن بُريدة'],
    grade: 'sahih',
    topics: ['Repentance', 'Remembrance'],
    explanation:
      'The “master of seeking forgiveness” — a comprehensive du‘a affirming Allah’s lordship, acknowledging sin, and asking pardon.',
    explanationAr:
      'سيّدُ الاستغفار دعاءٌ جامع يُقرّ بربوبيّة الله ويعترف بالذنب ويسأل المغفرة.',
  },
  {
    id: 'muslim-2589',
    collection: 'muslim',
    reference: 'Sahih Muslim 2589',
    arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
    english: 'A good word is charity.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Hammam ibn Munabbih'],
    chainAr: ['أبو هريرة', 'همّام بن منبّه'],
    grade: 'sahih',
    topics: ['Charity', 'Good character'],
    explanation:
      'Kind, beneficial speech is itself an act of charity — an easy good deed available to everyone at all times.',
    explanationAr:
      'الكلمة الطيّبة النافعة صدقة؛ بابٌ من الخير يسيرٌ متاحٌ لكلّ أحدٍ في كلّ حين.',
  },
  {
    id: 'tirmidhi-2616',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 2616',
    arabic: 'رَأْسُ الأَمْرِ الإِسْلاَمُ، وَعَمُودُهُ الصَّلاَةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ',
    english:
      'The head of the matter is Islam, its pillar is the prayer, and its highest peak is striving in the way of Allah.',
    narrator: 'Mu‘adh ibn Jabal',
    narratorAr: 'معاذ بن جبل',
    chain: ['Mu‘adh ibn Jabal', 'Abu Wa’il'],
    chainAr: ['معاذ بن جبل', 'أبو وائل'],
    grade: 'hasan',
    topics: ['Prayer', 'Worship'],
    explanation:
      'Prayer is described as the very pillar that holds up the religion — establish it and the structure of your faith stands firm.',
    explanationAr:
      'الصلاة عمودُ الدّين الذي يقوم عليه؛ فمن أقامها قام بناءُ إيمانه.',
  },
  {
    id: 'bukhari-5970',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 5971',
    arabic: 'رَغِمَ أَنْفُ ثُمَّ رَغِمَ أَنْفُ ثُمَّ رَغِمَ أَنْفُ مَنْ أَدْرَكَ أَبَوَيْهِ عِنْدَ الْكِبَرِ أَحَدَهُمَا أَوْ كِلَيْهِمَا فَلَمْ يَدْخُلِ الْجَنَّةَ',
    english:
      'May he be humbled — then humbled, then humbled — the one who finds his parents in old age, one or both of them, and does not enter Paradise.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Suhayl ibn Abi Salih'],
    chainAr: ['أبو هريرة', 'سهيل بن أبي صالح'],
    grade: 'sahih',
    topics: ['Kindness', 'Good character'],
    explanation:
      'Serving aging parents is a golden path to Paradise. To have that chance and waste it is a profound loss.',
    explanationAr:
      'برُّ الوالدين عند الكِبَر بابٌ عظيم إلى الجنّة، ومن أدركه وفرّط فيه فقد خسر خسرانًا مبينًا.',
  },
  {
    id: 'tirmidhi-2399',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 2399',
    arabic:
      'مَا يَزَالُ الْبَلاَءُ بِالْمُؤْمِنِ وَالْمُؤْمِنَةِ فِي نَفْسِهِ وَوَلَدِهِ وَمَالِهِ حَتَّى يَلْقَى اللَّهَ وَمَا عَلَيْهِ خَطِيئَةٌ',
    english:
      'Trials continue to befall the believing man and woman — in themselves, their children and their wealth — until they meet Allah with no sin upon them.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Muhammad ibn Amr'],
    chainAr: ['أبو هريرة', 'محمّد بن عمرو'],
    grade: 'hasan',
    topics: ['Patience', 'Trust in Allah'],
    explanation:
      'Hardships endured patiently purify the believer of sin. What feels like loss can be a hidden mercy and cleansing.',
    explanationAr:
      'البلاءُ الذي يُصبر عليه يُكفّر خطايا المؤمن؛ فما تظنّه مصيبةً قد يكون رحمةً وتطهيرًا.',
  },
  {
    id: 'muslim-2592',
    collection: 'muslim',
    reference: 'Sahih Muslim 2592',
    arabic:
      'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ، وَيُعْطِي عَلَى الرِّفْقِ مَا لاَ يُعْطِي عَلَى الْعُنْفِ',
    english:
      'Allah is gentle and loves gentleness, and He grants for gentleness what He does not grant for harshness.',
    narrator: 'Aisha bint Abi Bakr',
    narratorAr: 'عائشة بنت أبي بكر',
    chain: ['Aisha bint Abi Bakr', 'al-Miqdam ibn Shurayh'],
    chainAr: ['عائشة بنت أبي بكر', 'المقدام بن شريح'],
    grade: 'sahih',
    topics: ['Kindness', 'Good character'],
    explanation:
      'Gentleness opens doors that force cannot. Allah loves it and rewards it richly in this life and the next.',
    explanationAr:
      'الرّفقُ يفتح ما لا يفتحه العنف، والله يحبّه ويثيب عليه في الدنيا والآخرة.',
  },
  {
    id: 'bukhari-6405',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6405',
    arabic:
      'مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ',
    english:
      'Whoever says “Glory be to Allah and praise be to Him” a hundred times a day, his sins are wiped away even if they are like the foam of the sea.',
    narrator: 'Abu Hurayra',
    narratorAr: 'أبو هريرة',
    chain: ['Abu Hurayra', 'Sumayy', 'Suhayl'],
    chainAr: ['أبو هريرة', 'سُمَيّ', 'سهيل'],
    grade: 'sahih',
    topics: ['Remembrance', 'Repentance'],
    explanation:
      'A short, simple phrase of praise repeated with presence of heart can erase a sea of sins — remembrance is light and immensely rewarding.',
    explanationAr:
      'كلمةٌ يسيرةٌ من التسبيح تُكرَّر بحضور قلبٍ تمحو خطايا كزبد البحر؛ فالذكرُ يسيرٌ عظيمُ الأجر.',
  },
  {
    id: 'tirmidhi-2002',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 2002',
    arabic:
      'مَا مِنْ شَيْءٍ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ خُلُقٍ حَسَنٍ',
    english:
      'Nothing is heavier on the believer’s scale on the Day of Resurrection than good character.',
    narrator: 'Abu al-Darda',
    narratorAr: 'أبو الدّرداء',
    chain: ['Abu al-Darda', 'Umm al-Darda'],
    chainAr: ['أبو الدّرداء', 'أمّ الدّرداء'],
    grade: 'sahih',
    topics: ['Good character', 'Kindness'],
    explanation:
      'Good character is among the weightiest deeds on the Scale — refining how we treat people is itself great worship.',
    explanationAr:
      'حُسنُ الخُلق من أثقل ما يوضع في الميزان؛ فتحسينُ معاملة الناس عبادةٌ عظيمة.',
  },
];

/** Distinct topics, sorted by how many hadiths reference them (desc). */
export const TOPICS: string[] = (() => {
  const counts = new Map<string, number>();
  HADITHS.forEach((h) => h.topics.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.keys()].sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b));
})();

export function hadithById(id: string): Hadith | undefined {
  return HADITHS.find((h) => h.id === id);
}

/**
 * Curated hadiths sorted shortest-english first, then biased toward the shorter
 * half so the daily pick reads like a quick narration.
 */
const DAILY_POOL: Hadith[] = (() => {
  const sorted = [...HADITHS].sort((a, b) => a.english.length - b.english.length);
  const half = Math.ceil(sorted.length / 2);
  // Weight the shorter half twice so it's favoured but longer ones still appear.
  return [...sorted.slice(0, half), ...sorted];
})();

/**
 * A random-but-stable "hadith of the day": deterministic from the calendar date,
 * so it stays the same all day and changes the next day. Picks from the curated
 * {@link HADITHS}, biased toward shorter narrations.
 */
export function hadithOfTheDay(date: Date = new Date()): Hadith {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return DAILY_POOL[((dayIndex % DAILY_POOL.length) + DAILY_POOL.length) % DAILY_POOL.length];
}
