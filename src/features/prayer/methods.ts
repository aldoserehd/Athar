import { CalculationMethod, CalculationParameters, Madhab } from 'adhan';

/**
 * Calculation methods exposed in the UI, mapped to adhan's parameter presets.
 * adhan implements the same astronomical model the Aladhan API uses, so these
 * produce correct times anywhere in the world from coordinates alone.
 */
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
  { key: 'MuslimWorldLeague', label: 'Muslim World League', region: 'Europe, Far East, parts of US' },
  { key: 'NorthAmerica', label: 'ISNA', region: 'North America' },
  { key: 'Egyptian', label: 'Egyptian', region: 'Africa, Syria, Lebanon' },
  { key: 'UmmAlQura', label: 'Umm al-Qura', region: 'Arabian Peninsula' },
  { key: 'Karachi', label: 'Karachi', region: 'Pakistan, India, Bangladesh' },
  { key: 'Dubai', label: 'Dubai', region: 'UAE' },
  { key: 'Qatar', label: 'Qatar', region: 'Qatar' },
  { key: 'Kuwait', label: 'Kuwait', region: 'Kuwait' },
  { key: 'Singapore', label: 'Singapore', region: 'Singapore, Malaysia' },
  { key: 'Turkey', label: 'Diyanet', region: 'Turkey' },
  { key: 'Tehran', label: 'Tehran', region: 'Iran, Shia' },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee', region: 'Global, seasonal' },
];

export function methodInfo(key: MethodKey): MethodInfo {
  return METHODS.find((m) => m.key === key) ?? METHODS[0];
}

/** Asr juristic method: standard (Shafi/Maliki/Hanbali) vs. Hanafi (later). */
export type MadhabKey = 'standard' | 'hanafi';

/** Build adhan CalculationParameters for a method + Asr madhab. */
export function buildParams(method: MethodKey, madhab: MadhabKey): CalculationParameters {
  const params: CalculationParameters = CalculationMethod[method]();
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}
