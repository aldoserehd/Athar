import { isSupabaseConfigured, supabase } from '@/lib/supabase';

import { MOSQUES } from './data';
import { JamaahTimes, Mosque } from './types';

export type MosqueSource = 'live' | 'osm' | 'sample';
export type Coords = { latitude: number; longitude: number };

/** Shape of a row in the Supabase `mosques` table (see supabase/schema.sql). */
type MosqueRow = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  jumuah_language: string | null;
  jamaah: Partial<JamaahTimes> | null;
  facilities: string[] | null;
  updated_at: string | null;
};

const EMPTY_JAMAAH: JamaahTimes = {
  fajr: '—',
  dhuhr: '—',
  asr: '—',
  maghrib: '—',
  isha: '—',
  jumuah: '—',
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'recently';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} wk ago`;
}

/** Great-circle distance in km. */
function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function rowToMosque(r: MosqueRow): Mosque {
  return {
    id: r.id,
    name: r.name,
    area: r.area,
    distanceKm: 0,
    latitude: r.latitude,
    longitude: r.longitude,
    verified: r.verified,
    updated: relativeTime(r.updated_at),
    jumuahLanguage: r.jumuah_language ?? '—',
    jamaah: { ...EMPTY_JAMAAH, ...(r.jamaah ?? {}) },
    facilities: (r.facilities ?? []) as Mosque['facilities'],
  };
}

// ---------------------------------------------------------------------------
// OpenStreetMap (Overpass) — free, global mosque *locations*. The community
// layer (Supabase) adds jamāʿah times and facilities on top.
// ---------------------------------------------------------------------------
type OverpassEl = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** Public Overpass endpoints, tried in order for resilience. */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

async function overpass(query: string): Promise<{ elements: OverpassEl[] }> {
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      // Some mirrors return an HTML error page with a 200 — guard on content-type.
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !type.includes('json')) throw new Error(`overpass ${res.status}`);
      return (await res.json()) as { elements: OverpassEl[] };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('overpass unavailable');
}

export async function fetchNearbyOsmMosques(
  origin: Coords,
  radiusKm = 8
): Promise<Mosque[]> {
  const r = Math.round(radiusKm * 1000);
  const { latitude: lat, longitude: lon } = origin;
  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lon}););out center 80;`;

  const json = await overpass(query);

  return json.elements
    .map((el): Mosque | null => {
      const latitude = el.lat ?? el.center?.lat;
      const longitude = el.lon ?? el.center?.lon;
      if (latitude == null || longitude == null) return null;
      const t = el.tags ?? {};
      const area = [t['addr:suburb'], t['addr:city']].filter(Boolean).join(', ');
      return {
        id: `osm-${el.type}-${el.id}`,
        name: t.name || t['name:en'] || 'Unnamed masjid',
        area: area || 'Nearby',
        distanceKm: Math.round(haversineKm(origin, { latitude, longitude }) * 10) / 10,
        latitude,
        longitude,
        verified: false,
        updated: 'from OpenStreetMap',
        jumuahLanguage: '—',
        jamaah: { ...EMPTY_JAMAAH },
        facilities: [],
      };
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Load mosques, best source first:
 *   1. Supabase community listings (when configured),
 *   2. live OpenStreetMap mosques near `origin` (free, global),
 *   3. bundled sample data.
 */
export async function fetchMosques(
  origin?: Coords | null
): Promise<{ data: Mosque[]; source: MosqueSource }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('mosques')
        .select('*')
        .eq('status', 'approved')
        .order('name');
      if (!error && data && data.length > 0) {
        return { data: (data as MosqueRow[]).map(rowToMosque), source: 'live' };
      }
    } catch {
      /* fall through */
    }
  }

  if (origin) {
    try {
      const osm = await fetchNearbyOsmMosques(origin);
      if (osm.length > 0) return { data: osm, source: 'osm' };
    } catch {
      /* fall through */
    }
  }

  return { data: MOSQUES, source: 'sample' };
}

/** Flag a listing for moderator review. No-op until Supabase is configured. */
export async function reportMosque(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.rpc('report_mosque', { mosque_id: id });
    return !error;
  } catch {
    return false;
  }
}
