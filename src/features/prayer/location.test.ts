import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import {
  isPlaceTrustworthy,
  loadCachedPlace,
  resolveLocation,
  type GeoPlace,
} from './location';

const NOW = Date.parse('2026-08-11T12:00:00.000Z');

function place(overrides: Partial<GeoPlace> = {}): GeoPlace {
  return {
    latitude: 43.6532,
    longitude: -79.3832,
    city: 'Toronto, Ontario',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    source: 'current',
    capturedAt: NOW - 60_000,
    accuracyMeters: 50,
    ...overrides,
  };
}

describe('prayer location trust', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('trusts a fresh, accurate current fix', () => {
    expect(isPlaceTrustworthy(place(), NOW)).toBe(true);
  });

  it('rejects an expired cached fix', () => {
    expect(
      isPlaceTrustworthy(
        place({ source: 'cached', capturedAt: NOW - 7 * 60 * 60 * 1000 }),
        NOW,
      ),
    ).toBe(false);
  });

  it('rejects a current fix whose uncertainty is too large', () => {
    expect(isPlaceTrustworthy(place({ accuracyMeters: 20_000 }), NOW)).toBe(false);
  });

  it('trusts a deliberately selected manual place without GPS accuracy', () => {
    expect(
      isPlaceTrustworthy(
        place({
          latitude: 29.3759,
          longitude: 47.9774,
          city: 'Kuwait City',
          countryCode: 'KW',
          timezone: 'Asia/Kuwait',
          source: 'manual',
          capturedAt: NOW - 365 * 24 * 60 * 60 * 1000,
          accuracyMeters: null,
        }),
        NOW,
      ),
    ).toBe(true);
  });

  it('does not treat a legacy fallback cache as trustworthy prayer data', async () => {
    await AsyncStorage.setItem(
      'athar.prayer.place.v1',
      JSON.stringify({
        latitude: 21.4225,
        longitude: 39.8262,
        city: 'Makkah',
        isFallback: true,
      }),
    );

    await expect(loadCachedPlace()).resolves.toBeNull();
  });

  it('returns setup state instead of Makkah when permission is blocked', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
      expires: 'never',
    });

    await expect(resolveLocation()).resolves.toEqual({
      place: null,
      granted: false,
      canAskAgain: false,
    });
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('constrains last-known fixes by age and accuracy', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      granted: true,
      canAskAgain: true,
      status: Location.PermissionStatus.GRANTED,
      expires: 'never',
    });
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue({
      coords: {
        latitude: 43.6532,
        longitude: -79.3832,
        altitude: null,
        accuracy: 50,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now() - 60_000,
    });
    jest.mocked(Location.getCurrentPositionAsync).mockRejectedValue(new Error('indoors'));
    jest.mocked(Location.reverseGeocodeAsync).mockResolvedValue([
      {
        city: 'Toronto',
        country: 'Canada',
        district: null,
        formattedAddress: null,
        isoCountryCode: 'CA',
        name: null,
        postalCode: null,
        region: 'Ontario',
        street: null,
        streetNumber: null,
        subregion: null,
        timezone: null,
      },
    ]);

    const result = await resolveLocation();

    expect(Location.getLastKnownPositionAsync).toHaveBeenCalledWith({
      maxAge: 6 * 60 * 60 * 1000,
      requiredAccuracy: 5_000,
    });
    expect(result.place).toMatchObject({
      city: 'Toronto, Ontario',
      countryCode: 'CA',
      timezone: 'America/Toronto',
      source: 'current',
      accuracyMeters: 50,
    });
  });
});
