/**
 * Adhān reciters with bundled audio (clips from github.com/abodehq/Athan-MP3).
 * The full adhān plays in-app (preview + when a prayer notification fires while
 * the app is open). Lock-screen alert sound stays the system default because
 * iOS caps custom notification sounds at 30 seconds.
 */
export type Reciter = { id: string; name: string; place: string };

export const RECITERS: Reciter[] = [
  { id: 'makkah', name: 'Makkah Haram', place: 'Grand Mosque' },
  { id: 'alafasy', name: 'Mishary Alafasy', place: 'Kuwait' },
  { id: 'qatami', name: 'Nasser al-Qatami', place: 'Saudi Arabia' },
  { id: 'menshawy', name: 'Mohammad al-Minshawi', place: 'Egypt' },
  { id: 'refaat', name: 'Mohammad Rifʿat', place: 'Egypt' },
];

/** Static requires so Metro bundles the audio assets. */
export const ADHAN_AUDIO: Record<string, number> = {
  makkah: require('../../../assets/adhan/makkah.mp3'),
  alafasy: require('../../../assets/adhan/alafasy.mp3'),
  qatami: require('../../../assets/adhan/qatami.mp3'),
  menshawy: require('../../../assets/adhan/menshawy.mp3'),
  refaat: require('../../../assets/adhan/refaat.mp3'),
};

export function reciterName(id: string): string {
  return RECITERS.find((r) => r.id === id)?.name ?? RECITERS[0].name;
}

export function adhanSource(id: string): number {
  return ADHAN_AUDIO[id] ?? ADHAN_AUDIO.makkah;
}
