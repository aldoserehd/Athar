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
 *  1. ensure permission (request only if not already granted),
 *  2. read the real position — a fast last-known fix first, then a fresh GPS
 *     reading — and reverse-geocode the city,
 *  3. on denial/failure fall back to the last cached place, then Makkah.
 *
 * Prayer times depend entirely on the coordinates, so using the device's *real*
 * location (rather than the Makkah default) is what makes the times correct in
 * every country. The caller recomputes whenever this resolves a new place.
 */
export async function resolveLocation(): Promise<LocationResult> {
  let granted = false;
  try {
    // Don't re-prompt if permission was already granted in a previous session.
    const existing = await Location.getForegroundPermissionsAsync();
    granted = existing.granted;
    if (!granted) {
      const req = await Location.requestForegroundPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) {
      const cached = await loadCachedPlace();
      return { place: cached ?? MAKKAH, granted: false };
    }

    // A last-known fix returns almost instantly (important indoors / where a GPS
    // lock is slow); then try for a fresh, more accurate reading.
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last) coords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
    } catch {
      /* best-effort */
    }
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch {
      /* keep the last-known fix if the fresh read failed */
    }

    if (!coords) {
      // Permission is granted but no position is available yet — keep any real
      // cached place rather than jumping to the Makkah default.
      const cached = await loadCachedPlace();
      return { place: cached ?? MAKKAH, granted: true };
    }

    const city = await cityNameFor(coords.latitude, coords.longitude);
    const place: GeoPlace = { ...coords, city, isFallback: false };
    await cachePlace(place);
    return { place, granted: true };
  } catch {
    const cached = await loadCachedPlace();
    return { place: cached ?? MAKKAH, granted };
  }
}
