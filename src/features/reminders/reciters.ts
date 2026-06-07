/**
 * Adhān reciters with bundled audio (clips from github.com/abodehq/Athan-MP3).
 * The full adhān plays in-app (preview + when a prayer notification fires while
 * the app is open). Lock-screen alert sound stays the system default because
 * iOS caps custom notification sounds at 30 seconds.
 */
export type Reciter = { id: string; name: string; place: string };

export const RECITERS: Reciter[] = [
  { id: 'makkah', name: 'Makkah Haram', place: 'Grand Mosque' },
  { id: 'arkani', name: 'Ibrahim al-Arkani', place: 'Makkah' },
  { id: 'alafasy', name: 'Mishary Alafasy', place: 'Kuwait' },
  { id: 'qatami', name: 'Nasser al-Qatami', place: 'Saudi Arabia' },
  { id: 'zahrani', name: 'Mansoor az-Zahrani', place: 'Saudi Arabia' },
  { id: 'basit', name: 'Abdul Basit', place: 'Egypt' },
  { id: 'menshawy', name: 'Mohammad al-Minshawi', place: 'Egypt' },
  { id: 'refaat', name: 'Mohammad Rifʿat', place: 'Egypt' },
  { id: 'deghreri', name: 'Hamad Daghriri', place: 'Saudi Arabia' },
];

/** Static requires so Metro bundles the audio assets. */
export const ADHAN_AUDIO: Record<string, number> = {
  makkah: require('../../../assets/adhan/makkah.mp3'),
  arkani: require('../../../assets/adhan/arkani.mp3'),
  alafasy: require('../../../assets/adhan/alafasy.mp3'),
  qatami: require('../../../assets/adhan/qatami.mp3'),
  zahrani: require('../../../assets/adhan/zahrani.mp3'),
  basit: require('../../../assets/adhan/basit.mp3'),
  menshawy: require('../../../assets/adhan/menshawy.mp3'),
  refaat: require('../../../assets/adhan/refaat.mp3'),
  deghreri: require('../../../assets/adhan/deghreri.mp3'),
};

export function reciterName(id: string): string {
  return RECITERS.find((r) => r.id === id)?.name ?? RECITERS[0].name;
}

export function adhanSource(id: string): number {
  return ADHAN_AUDIO[id] ?? ADHAN_AUDIO.makkah;
}
