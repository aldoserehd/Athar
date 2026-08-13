import AsyncStorage from '@react-native-async-storage/async-storage';
import tzLookup from 'tz-lookup';

import type { GeoPlace } from './location';

export type ManualPlaceResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  countryCode: string | null;
};

type NominatimResult = {
  place_id?: string | number;
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: { country_code?: string };
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const BASE_URL = (
  process.env.EXPO_PUBLIC_GEOCODING_BASE_URL ?? 'https://nominatim.openstreetmap.org'
).replace(/\/$/, '');

function cacheKey(query: string, locale: string): string {
  return `athar.geocoding.v1.${locale}.${encodeURIComponent(query.toLowerCase())}`;
}

async function loadCachedResults(
  key: string,
  now: number,
): Promise<ManualPlaceResult[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; results: ManualPlaceResult[] };
    if (!Array.isArray(cached.results) || now - cached.savedAt > CACHE_TTL_MS) return null;
    return cached.results;
  } catch {
    return null;
  }
}

function parseResult(result: NominatimResult): ManualPlaceResult | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    !result.display_name?.trim() ||
    result.place_id == null
  ) {
    return null;
  }
  return {
    id: String(result.place_id),
    label: result.display_name.trim(),
    latitude,
    longitude,
    countryCode: result.address?.country_code?.toUpperCase() ?? null,
  };
}

export async function searchManualPlaces(
  submittedQuery: string,
  locale: string,
  fetcher: FetchLike = fetch,
): Promise<ManualPlaceResult[]> {
  const query = submittedQuery.trim();
  if (!query) return [];

  const key = cacheKey(query, locale);
  const now = Date.now();
  const cached = await loadCachedResults(key, now);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    'accept-language': locale,
  });

  try {
    const response = await fetcher(`${BASE_URL}/search?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': locale,
        'User-Agent': 'Athar/1.1 (https://try-athar.com)',
      },
    });
    if (!response.ok) throw new Error(`Geocoder returned ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error('Geocoder returned malformed data');
    const results = body
      .map((item) => parseResult(item as NominatimResult))
      .filter((item): item is ManualPlaceResult => item !== null);
    await AsyncStorage.setItem(key, JSON.stringify({ savedAt: now, results })).catch(() => {});
    return results;
  } catch {
    throw new Error('Could not search for that city');
  }
}

export function manualPlaceFromResult(
  result: ManualPlaceResult,
  capturedAt = Date.now(),
): GeoPlace {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    city: result.label,
    countryCode: result.countryCode,
    timezone: tzLookup(result.latitude, result.longitude),
    source: 'manual',
    capturedAt,
    accuracyMeters: null,
  };
}
