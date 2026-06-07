import { Mosque } from './types';

/**
 * Sample mosque data for the Phase 3 UI. The live version is community-sourced
 * via Supabase (Postgres) with moderation, and rendered on an OpenStreetMap map.
 * These entries are illustrative placeholders, not verified listings.
 */
export const MOSQUES: Mosque[] = [
  {
    id: 'central',
    name: 'Central Mosque',
    area: 'West Kensington, London',
    distanceKm: 0.4,
    latitude: 51.4946,
    longitude: -0.2058,
    verified: true,
    updated: '2h ago',
    jumuahLanguage: 'English & Arabic',
    jamaah: { fajr: '05:20', dhuhr: '13:10', asr: '16:45', maghrib: '18:32', isha: '20:15', jumuah: '13:30' },
    facilities: ['sisters', 'wudu', 'wheelchair', 'parking'],
  },
  {
    id: 'noor',
    name: 'Masjid an-Noor',
    area: 'Whitechapel, London',
    distanceKm: 1.1,
    latitude: 51.5165,
    longitude: -0.0606,
    verified: true,
    updated: 'yesterday',
    jumuahLanguage: 'English & Bengali',
    jamaah: { fajr: '05:15', dhuhr: '13:15', asr: '16:50', maghrib: '18:34', isha: '20:30', jumuah: '13:15' },
    facilities: ['sisters', 'wudu', 'quran', 'funeral'],
  },
  {
    id: 'taqwa',
    name: 'Taqwa Islamic Centre',
    area: 'Croydon',
    distanceKm: 2.6,
    latitude: 51.3762,
    longitude: -0.0982,
    verified: false,
    updated: '3 days ago',
    jumuahLanguage: 'English & Urdu',
    jamaah: { fajr: '05:25', dhuhr: '13:00', asr: '16:40', maghrib: '18:30', isha: '20:00', jumuah: '13:45' },
    facilities: ['sisters', 'wudu', 'parking', 'wheelchair', 'quran'],
  },
  {
    id: 'salam',
    name: 'As-Salam Masjid',
    area: 'Stratford, London',
    distanceKm: 3.3,
    latitude: 51.5423,
    longitude: -0.0008,
    verified: true,
    updated: '5 days ago',
    jumuahLanguage: 'English & Somali',
    jamaah: { fajr: '05:18', dhuhr: '13:20', asr: '16:55', maghrib: '18:36', isha: '20:20', jumuah: '13:30' },
    facilities: ['sisters', 'wudu', 'wheelchair'],
  },
];
