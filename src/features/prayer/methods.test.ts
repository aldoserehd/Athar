import { buildParams, recommendMethod, type PrayerCalculationProfile } from './methods';

describe('regional prayer calculation profiles', () => {
  it.each([
    ['KW', 29.37, 'Kuwait'],
    ['SA', 24.71, 'UmmAlQura'],
    ['CA', 43.65, 'NorthAmerica'],
    ['US', 40.71, 'NorthAmerica'],
    ['MY', 3.14, 'Singapore'],
  ] as const)('recommends %s for the selected region', (country, latitude, expected) => {
    expect(recommendMethod(country, latitude)).toBe(expected);
  });

  it('copies each user adjustment into Adhan parameters', () => {
    const profile: PrayerCalculationProfile = {
      method: 'Kuwait',
      madhab: 'standard',
      adjustments: {
        fajr: 2,
        sunrise: -1,
        dhuhr: 1,
        asr: 3,
        maghrib: 0,
        isha: -2,
      },
    };

    expect(buildParams(profile).adjustments).toEqual(profile.adjustments);
  });
});
