import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { computeTimes, ComputedTimes } from './calc';
import { GeoPlace, loadCachedPlace, MAKKAH, resolveLocation } from './location';
import { MadhabKey, MethodKey } from './methods';

const SETTINGS_KEY = 'athar.prayer.settings.v1';

type Settings = {
  method: MethodKey;
  madhab: MadhabKey;
  hour12: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  method: 'MuslimWorldLeague',
  madhab: 'standard',
  hour12: true,
};

type PrayerContextValue = {
  place: GeoPlace;
  settings: Settings;
  times: ComputedTimes | null;
  loading: boolean;
  /** True until both settings and an initial location have resolved. */
  ready: boolean;
  permissionDenied: boolean;
  setMethod: (method: MethodKey) => void;
  setHour12: (hour12: boolean) => void;
  /** Re-request location and recompute. */
  refreshLocation: () => Promise<void>;
};

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined);

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [place, setPlace] = useState<GeoPlace>(MAKKAH);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [times, setTimes] = useState<ComputedTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Hydrate settings + cached place, then resolve a fresh location.
  useEffect(() => {
    let active = true;
    (async () => {
      const [rawSettings, cached] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        loadCachedPlace(),
      ]);
      if (!active) return;
      if (rawSettings) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) });
        } catch {
          /* ignore corrupt settings */
        }
      }
      if (cached) setPlace(cached);
      setReady(true);

      const { place: resolved, granted } = await resolveLocation();
      if (!active) return;
      setPlace(resolved);
      setPermissionDenied(!granted);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Recompute whenever inputs change, and tick at the top of each minute so the
  // "next prayer" and current-period highlight stay current.
  useEffect(() => {
    function recompute() {
      setTimes(
        computeTimes(place.latitude, place.longitude, settings.method, settings.madhab)
      );
    }
    recompute();
    const id = setInterval(recompute, 30_000);
    return () => clearInterval(id);
  }, [place, settings.method, settings.madhab]);

  // Keep a ref so the setters compose without stale closures.
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setMethod = useCallback(
    (method: MethodKey) => persist({ ...settingsRef.current, method }),
    [persist]
  );
  const setHour12 = useCallback(
    (hour12: boolean) => persist({ ...settingsRef.current, hour12 }),
    [persist]
  );

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    const { place: resolved, granted } = await resolveLocation();
    setPlace(resolved);
    setPermissionDenied(!granted);
    setLoading(false);
  }, []);

  const value = useMemo<PrayerContextValue>(
    () => ({
      place,
      settings,
      times,
      loading,
      ready,
      permissionDenied,
      setMethod,
      setHour12,
      refreshLocation,
    }),
    [place, settings, times, loading, ready, permissionDenied, setMethod, setHour12, refreshLocation]
  );

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayer(): PrayerContextValue {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error('usePrayer must be used within a PrayerProvider');
  return ctx;
}
