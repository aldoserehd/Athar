import { Hadith } from './types';

/**
 * A small curated, offline seed of well-known authentic narrations across the
 * six major Sunni collections. Phase 2 ships this bundled dataset to power the
 * UI and basic search; a later iteration expands to the full corpus + on-device
 * semantic search. Arabic, references and gradings follow the standard prints.
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
    chain: ['Umar ibn al-Khattab', 'Alqama ibn Waqqas', "Muhammad ibn Ibrahim", 'Yahya ibn Sa‘id'],
    grade: 'sahih',
    topics: ['Intentions', 'Sincerity'],
    explanation:
      'The foundation of Islamic ethics: the worth of any deed depends on the intention behind it. Ordinary acts become worship when done sincerely for Allah.',
  },
  {
    id: 'muslim-55',
    collection: 'muslim',
    reference: 'Sahih Muslim 55',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    english:
      '“The religion is sincerity (naseehah).” We said: To whom? He said: “To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.”',
    narrator: 'Tamim al-Dari',
    chain: ['Tamim al-Dari', 'Suhayl ibn Abi Salih'],
    grade: 'sahih',
    topics: ['Sincerity', 'Brotherhood'],
    explanation:
      'True religion is wishing good and being honest — toward Allah, His revelation, His Messenger, and toward both leaders and ordinary people.',
  },
  {
    id: 'bukhari-13',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 13',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english:
      'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Malik',
    chain: ['Anas ibn Malik', 'Qatada'],
    grade: 'sahih',
    topics: ['Brotherhood', 'Kindness'],
    explanation:
      'Complete faith includes wanting the same good for others that you want for yourself — a cure for envy and selfishness.',
  },
  {
    id: 'bukhari-6114',
    collection: 'bukhari',
    reference: 'Sahih al-Bukhari 6114',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    english:
      'The strong person is not the one who overcomes others by strength, but the one who controls himself when angry.',
    narrator: 'Abu Hurayra',
    chain: ['Abu Hurayra', 'al-A‘raj'],
    grade: 'sahih',
    topics: ['Anger', 'Patience'],
    explanation:
      'Real strength is self-mastery. Restraining anger in the heat of the moment is greater than physical power.',
  },
  {
    id: 'tirmidhi-1924',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 1924',
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    english:
      'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth and the One above the heavens will be merciful to you.',
    narrator: 'Abdullah ibn Amr',
    chain: ['Abdullah ibn Amr ibn al-As'],
    grade: 'hasan',
    topics: ['Kindness', 'Mercy'],
    explanation:
      'Mercy is reciprocal: show compassion to all creation — people and animals — and you invite the mercy of Allah upon yourself.',
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
    chain: ['Abu Hurayra', 'Abu Salih'],
    grade: 'sahih',
    topics: ['Neighbours', 'Kindness'],
    explanation:
      'Faith shows in two everyday habits: guarding the tongue (speak good or stay quiet) and treating neighbours generously.',
  },
  {
    id: 'tirmidhi-1956',
    collection: 'tirmidhi',
    reference: 'Jami‘ at-Tirmidhi 1956',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    english: 'Your smiling in the face of your brother is charity.',
    narrator: 'Abu Dharr al-Ghifari',
    chain: ['Abu Dharr al-Ghifari'],
    grade: 'hasan',
    topics: ['Charity', 'Kindness'],
    explanation:
      'Charity is not only money. A warm smile that brings ease to another is itself a rewarded act of giving.',
  },
  {
    id: 'muslim-223',
    collection: 'muslim',
    reference: 'Sahih Muslim 223',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    english: 'Purity is half of faith.',
    narrator: 'Abu Malik al-Ash‘ari',
    chain: ['Abu Malik al-Ash‘ari'],
    grade: 'sahih',
    topics: ['Purity', 'Worship'],
    explanation:
      'Outward and inward purification hold a great share of the faith — cleanliness of body and heart prepares one to stand before Allah.',
  },
  {
    id: 'abudawud-4682',
    collection: 'abudawud',
    reference: 'Sunan Abi Dawud 4682',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    english:
      'The most complete of the believers in faith is the best of them in character.',
    narrator: 'Abu Hurayra',
    chain: ['Abu Hurayra', 'Muhammad ibn Amr'],
    grade: 'hasan',
    topics: ['Character', 'Kindness'],
    explanation:
      'Good manners are a measure of faith. Refining one’s character is part of perfecting one’s belief.',
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
    chain: ['Abu Dharr al-Ghifari', 'Mu‘adh ibn Jabal'],
    grade: 'hasan',
    topics: ['Character', 'Patience'],
    explanation:
      'A complete code of conduct: God-consciousness in private and public, erasing mistakes with good deeds, and kindness toward people.',
  },
  {
    id: 'nasai-3940',
    collection: 'nasai',
    reference: "Sunan an-Nasa'i 3940",
    arabic: 'حُبِّبَ إِلَىَّ مِنَ الدُّنْيَا النِّسَاءُ وَالطِّيبُ، وَجُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلاَةِ',
    english:
      'Made beloved to me from your world are women and perfume, and the coolness of my eyes is in prayer.',
    narrator: 'Anas ibn Malik',
    chain: ['Anas ibn Malik'],
    grade: 'sahih',
    topics: ['Worship', 'Prayer'],
    explanation:
      'The Prophet ﷺ found his deepest comfort and delight in prayer — a reminder that salah is meant to be a source of peace, not a burden.',
  },
  {
    id: 'ibnmajah-224',
    collection: 'ibnmajah',
    reference: 'Sunan Ibn Majah 224',
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    english: 'Seeking knowledge is an obligation upon every Muslim.',
    narrator: 'Anas ibn Malik',
    chain: ['Anas ibn Malik'],
    grade: 'hasan',
    topics: ['Knowledge', 'Worship'],
    explanation:
      'Learning what one needs to practise the religion correctly is a duty on every believer, man and woman alike.',
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
