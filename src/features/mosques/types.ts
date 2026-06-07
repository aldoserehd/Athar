import type { Ionicons } from '@expo/vector-icons';

export type FacilityKey =
  | 'sisters'
  | 'wudu'
  | 'wheelchair'
  | 'parking'
  | 'quran'
  | 'funeral';

export type Facility = {
  key: FacilityKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const FACILITIES: Record<FacilityKey, Facility> = {
  sisters: { key: 'sisters', label: "Sisters' section", icon: 'woman-outline' },
  wudu: { key: 'wudu', label: 'Full wudu area', icon: 'water-outline' },
  wheelchair: { key: 'wheelchair', label: 'Wheelchair access', icon: 'accessibility-outline' },
  parking: { key: 'parking', label: 'Parking', icon: 'car-outline' },
  quran: { key: 'quran', label: 'Quran classes', icon: 'book-outline' },
  funeral: { key: 'funeral', label: 'Janāzah services', icon: 'heart-outline' },
};

export type JamaahTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuah: string;
};

export type Mosque = {
  id: string;
  name: string;
  area: string;
  /** Sample static distance (km) until live location wiring. */
  distanceKm: number;
  latitude: number;
  longitude: number;
  verified: boolean;
  /** When the community last confirmed the info. */
  updated: string;
  jumuahLanguage: string;
  jamaah: JamaahTimes;
  facilities: FacilityKey[];
};
