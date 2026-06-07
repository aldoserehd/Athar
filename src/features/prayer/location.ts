import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GeoPlace = {
  latitude: number;
  longitude: number;
  city: string;
  /** True when this is the Makkah fallback, not the user's real location. */
  isFallback: boolean;
};

/** Makkah — a meaningful default when location is unavailable. */
export const MAKKAH: GeoPlace = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: 'Makkah',
  isFallback: true,
};

const CACHE_KEY = 'athar.prayer.place.v1';

export async function loadCachedPlace(): Promise<GeoPlace | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as GeoPlace) : null;
  } catch {
    return null;
  }
}

async function cachePlace(place: GeoPlace): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(place));
  } catch {
    /* best effort */
  }
}

async function cityNameFor(latitude: number, longitude: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const r = results[0];
    if (r) {
      const place = r.city || r.subregion || r.region || r.country;
      const region = r.region && r.region !== place ? r.region : r.country;
      return [place, region].filter(Boolean).join(', ') || 'Current location';
    }
  } catch {
    /* reverse geocode is best-effort */
  }
  return 'Current location';
}

export type LocationResult = {
  place: GeoPlace;
  /** Whether the OS permission was granted this call. */
  granted: boolean;
};

/**
 * Resolve the device location for prayer-time calculation:
 *  1. request permission,
 *  2. read current position + reverse-geocode the city,
 *  3. on denial/failure fall back to the last cached place, then Makkah.
 */
export async function resolveLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const cached = await loadCachedPlace();
      return { place: cached ?? MAKKAH, granted: false };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;
    const city = await cityNameFor(latitude, longitude);
    const place: GeoPlace = { latitude, longitude, city, isFallback: false };
    await cachePlace(place);
    return { place, granted: true };
  } catch {
    const cached = await loadCachedPlace();
    return { place: cached ?? MAKKAH, granted: false };
  }
}
