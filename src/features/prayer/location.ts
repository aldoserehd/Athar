import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import tzLookup from 'tz-lookup';

export type LocationSource = 'current' | 'cached' | 'manual';

export type GeoPlace = {
  latitude: number;
  longitude: number;
  city: string;
  countryCode: string | null;
  timezone: string;
  source: LocationSource;
  capturedAt: number;
  accuracyMeters: number | null;
};

export type LocationResult = {
  place: GeoPlace | null;
  granted: boolean;
  canAskAgain: boolean;
};

const CACHE_KEY = 'athar.prayer.place.v2';
const MAX_LOCATION_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_ACCURACY_METERS = 5_000;

function hasValidCoordinates(place: GeoPlace): boolean {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

function hasValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function isPlaceTrustworthy(place: GeoPlace, now = Date.now()): boolean {
  if (
    !hasValidCoordinates(place) ||
    !place.city?.trim() ||
    !place.timezone ||
    !hasValidTimezone(place.timezone)
  ) {
    return false;
  }

  if (place.source === 'manual') return true;

  const age = now - place.capturedAt;
  return (
    Number.isFinite(place.capturedAt) &&
    age >= -5 * 60 * 1000 &&
    age <= MAX_LOCATION_AGE_MS &&
    typeof place.accuracyMeters === 'number' &&
    Number.isFinite(place.accuracyMeters) &&
    place.accuracyMeters >= 0 &&
    place.accuracyMeters <= MAX_ACCURACY_METERS
  );
}

function isGeoPlace(value: unknown): value is GeoPlace {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GeoPlace>;
  return (
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number' &&
    typeof candidate.city === 'string' &&
    (typeof candidate.countryCode === 'string' || candidate.countryCode === null) &&
    typeof candidate.timezone === 'string' &&
    (candidate.source === 'current' ||
      candidate.source === 'cached' ||
      candidate.source === 'manual') &&
    typeof candidate.capturedAt === 'number' &&
    (typeof candidate.accuracyMeters === 'number' || candidate.accuracyMeters === null)
  );
}

export async function loadCachedPlace(now = Date.now()): Promise<GeoPlace | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isGeoPlace(parsed)) return null;

    const place: GeoPlace =
      parsed.source === 'current' ? { ...parsed, source: 'cached' } : parsed;
    return isPlaceTrustworthy(place, now) ? place : null;
  } catch {
    return null;
  }
}

export async function savePlace(place: GeoPlace): Promise<void> {
  if (!isPlaceTrustworthy(place)) {
    throw new Error('Cannot save an untrusted prayer location');
  }
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(place));
}

async function placeLabelFor(
  latitude: number,
  longitude: number,
): Promise<{ city: string; countryCode: string | null }> {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (result) {
      const primary = result.city || result.subregion || result.region || result.country;
      const secondary = result.region && result.region !== primary ? result.region : result.country;
      return {
        city: [primary, secondary].filter(Boolean).join(', ') || 'Current location',
        countryCode: result.isoCountryCode?.toUpperCase() ?? null,
      };
    }
  } catch {
    // Coordinates remain authoritative when reverse geocoding is unavailable.
  }
  return { city: 'Current location', countryCode: null };
}

function currentPlaceFrom(
  position: Location.LocationObject,
  label: Awaited<ReturnType<typeof placeLabelFor>>,
): GeoPlace {
  const { latitude, longitude, accuracy } = position.coords;
  return {
    latitude,
    longitude,
    city: label.city,
    countryCode: label.countryCode,
    timezone: tzLookup(latitude, longitude),
    source: 'current',
    capturedAt: position.timestamp,
    accuracyMeters: accuracy,
  };
}

export async function resolveLocation(options: { ignoreManual?: boolean } = {}): Promise<LocationResult> {
  let granted = false;
  let canAskAgain = true;

  try {
    const cached = await loadCachedPlace();
    if (cached?.source === 'manual' && !options.ignoreManual) {
      const permission = await Location.getForegroundPermissionsAsync();
      return {
        place: cached,
        granted: permission.granted,
        canAskAgain: permission.canAskAgain,
      };
    }

    let permission = await Location.getForegroundPermissionsAsync();
    granted = permission.granted;
    canAskAgain = permission.canAskAgain;

    if (!granted && canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
      granted = permission.granted;
      canAskAgain = permission.canAskAgain;
    }

    if (!granted) {
      return { place: await loadCachedPlace(), granted, canAskAgain };
    }

    let candidate = await Location.getLastKnownPositionAsync({
      maxAge: MAX_LOCATION_AGE_MS,
      requiredAccuracy: MAX_ACCURACY_METERS,
    });

    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const accuracy = current.coords.accuracy;
      if (accuracy !== null && accuracy <= MAX_ACCURACY_METERS) candidate = current;
    } catch {
      // A recent accurate last-known fix is still safe to use.
    }

    if (!candidate) {
      return { place: await loadCachedPlace(), granted, canAskAgain };
    }

    const label = await placeLabelFor(candidate.coords.latitude, candidate.coords.longitude);
    const place = currentPlaceFrom(candidate, label);
    if (!isPlaceTrustworthy(place)) {
      return { place: await loadCachedPlace(), granted, canAskAgain };
    }

    await savePlace(place);
    return { place, granted, canAskAgain };
  } catch {
    return { place: await loadCachedPlace(), granted, canAskAgain };
  }
}
