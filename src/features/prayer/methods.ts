import { CalculationMethod, CalculationParameters, Madhab } from 'adhan';

export type MethodKey =
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'Karachi'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'MoonsightingCommittee';

export type MethodInfo = {
  key: MethodKey;
  label: string;
  region: string;
};

export const METHODS: MethodInfo[] = [
  { key: 'MuslimWorldLeague', label: 'Muslim World League', region: 'Europe and worldwide' },
  { key: 'NorthAmerica', label: 'ISNA', region: 'North America' },
  { key: 'Egyptian', label: 'Egyptian', region: 'Africa, Syria and Lebanon' },
  { key: 'UmmAlQura', label: 'Umm al-Qura', region: 'Saudi Arabia' },
  { key: 'Karachi', label: 'Karachi', region: 'Pakistan, India and Bangladesh' },
  { key: 'Dubai', label: 'Dubai', region: 'United Arab Emirates' },
  { key: 'Qatar', label: 'Qatar', region: 'Qatar' },
  { key: 'Kuwait', label: 'Kuwait', region: 'Kuwait' },
  { key: 'Singapore', label: 'Singapore', region: 'Singapore and Malaysia' },
  { key: 'Turkey', label: 'Diyanet', region: 'Türkiye' },
  { key: 'Tehran', label: 'Tehran', region: 'Iran' },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee', region: 'Global and seasonal' },
];

export type MadhabKey = 'standard' | 'hanafi';
export type MethodMode = 'automatic' | 'manual';
export type PrayerAdjustmentKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerAdjustments = Record<PrayerAdjustmentKey, number>;

export type PrayerCalculationProfile = {
  method: MethodKey;
  madhab: MadhabKey;
  adjustments: PrayerAdjustments;
};

export const ZERO_ADJUSTMENTS: PrayerAdjustments = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export function methodInfo(key: MethodKey): MethodInfo {
  return METHODS.find((method) => method.key === key) ?? METHODS[0];
}

const COUNTRY_METHODS: Partial<Record<string, MethodKey>> = {
  AE: 'Dubai',
  BD: 'Karachi',
  CA: 'NorthAmerica',
  EG: 'Egyptian',
  ID: 'Singapore',
  IN: 'Karachi',
  IR: 'Tehran',
  KW: 'Kuwait',
  LB: 'Egyptian',
  MY: 'Singapore',
  PK: 'Karachi',
  QA: 'Qatar',
  SA: 'UmmAlQura',
  SG: 'Singapore',
  SY: 'Egyptian',
  TR: 'Turkey',
  US: 'NorthAmerica',
};

export function recommendMethod(countryCode: string | null, latitude: number): MethodKey {
  const countryMethod = countryCode ? COUNTRY_METHODS[countryCode.toUpperCase()] : undefined;
  if (countryMethod) return countryMethod;
  if (Math.abs(latitude) >= 48) return 'MoonsightingCommittee';
  return 'MuslimWorldLeague';
}

export function buildParams(profile: PrayerCalculationProfile): CalculationParameters {
  const params: CalculationParameters = CalculationMethod[profile.method]();
  params.madhab = profile.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.adjustments = { ...profile.adjustments };
  return params;
}
