import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { computeTimes, type ComputedTimes } from './calc';
import {
  type GeoPlace,
  loadCachedPlace,
  resolveLocation,
  savePlace,
} from './location';
import {
  METHODS,
  recommendMethod,
  ZERO_ADJUSTMENTS,
  type MadhabKey,
  type MethodKey,
  type MethodMode,
  type PrayerAdjustmentKey,
  type PrayerAdjustments,
  type PrayerCalculationProfile,
} from './methods';

const SETTINGS_KEY = 'athar.prayer.settings.v2';
const LEGACY_SETTINGS_KEY = 'athar.prayer.settings.v1';

export type PrayerSettings = {
  methodMode: MethodMode;
  method: MethodKey;
  madhab: MadhabKey;
  adjustments: PrayerAdjustments;
  hour12: boolean;
};

export type LocationStatus = 'loading' | 'ready' | 'needsPermission' | 'needsLocation';

const DEFAULT_SETTINGS: PrayerSettings = {
  methodMode: 'automatic',
  method: 'MuslimWorldLeague',
  madhab: 'standard',
  adjustments: ZERO_ADJUSTMENTS,
  hour12: true,
};

function clampAdjustment(value: unknown): number {
  return Math.max(-30, Math.min(30, Math.round(typeof value === 'number' ? value : 0)));
}

function parseSettings(raw: string | null): PrayerSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const stored = JSON.parse(raw) as Partial<PrayerSettings>;
    const method = METHODS.some((candidate) => candidate.key === stored.method)
      ? stored.method!
      : DEFAULT_SETTINGS.method;
    const adjustments = Object.fromEntries(
      Object.keys(ZERO_ADJUSTMENTS).map((key) => [
        key,
        clampAdjustment(stored.adjustments?.[key as PrayerAdjustmentKey]),
      ]),
    ) as PrayerAdjustments;
    return {
      methodMode: stored.methodMode === 'manual' ? 'manual' : 'automatic',
      method,
      madhab: stored.madhab === 'hanafi' ? 'hanafi' : 'standard',
      adjustments,
      hour12: stored.hour12 !== false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

type PrayerContextValue = {
  place: GeoPlace | null;
  settings: PrayerSettings;
  profile: PrayerCalculationProfile | null;
  resolvedMethod: MethodKey | null;
  times: ComputedTimes | null;
  loading: boolean;
  ready: boolean;
  locationStatus: LocationStatus;
  canAskAgain: boolean;
  setMethod: (method: MethodKey) => void;
  setMethodMode: (mode: MethodMode) => void;
  setMadhab: (madhab: MadhabKey) => void;
  setAdjustment: (prayer: PrayerAdjustmentKey, minutes: number) => void;
  setHour12: (hour12: boolean) => void;
  setManualPlace: (place: GeoPlace) => Promise<void>;
  refreshLocation: () => Promise<void>;
};

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined);

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [place, setPlace] = useState<GeoPlace | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [times, setTimes] = useState<ComputedTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const resolvedMethod = useMemo<MethodKey | null>(() => {
    if (!place) return null;
    return settings.methodMode === 'automatic'
      ? recommendMethod(place.countryCode, place.latitude)
      : settings.method;
  }, [place, settings.method, settings.methodMode]);

  const profile = useMemo<PrayerCalculationProfile | null>(
    () =>
      resolvedMethod
        ? {
            method: resolvedMethod,
            madhab: settings.madhab,
            adjustments: settings.adjustments,
          }
        : null,
    [resolvedMethod, settings.madhab, settings.adjustments],
  );

  const resolveAndStore = useCallback(async (ignoreManual = false) => {
    setLoading(true);
    try {
      const result = await resolveLocation({ ignoreManual });
      setPlace(result.place);
      setPermissionGranted(result.granted);
      setCanAskAgain(result.canAskAgain);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [rawV2, rawV1, cached] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(LEGACY_SETTINGS_KEY),
        loadCachedPlace(),
      ]);
      if (!active) return;
      setSettings(parseSettings(rawV2 ?? rawV1));
      if (cached) setPlace(cached);

      const result = await resolveLocation();
      if (!active) return;
      setPlace(result.place);
      setPermissionGranted(result.granted);
      setCanAskAgain(result.canAskAgain);
      setReady(true);
      setLoading(false);
    })().catch(() => {
      if (active) {
        setReady(true);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !place || !profile) {
      setTimes(null);
      return undefined;
    }
    const recompute = () =>
      setTimes(
        computeTimes(place.latitude, place.longitude, place.timezone, profile),
      );
    recompute();
    const id = setInterval(recompute, 30_000);
    return () => clearInterval(id);
  }, [ready, place, profile]);

  const lastDeviceTimezone = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !ready) return;
      const nextTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      lastDeviceTimezone.current = nextTimezone;
      void resolveAndStore(false);
    });
    return () => subscription.remove();
  }, [ready, resolveAndStore]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const persist = useCallback((next: PrayerSettings) => {
    setSettings(next);
    void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const setMethod = useCallback(
    (method: MethodKey) =>
      persist({ ...settingsRef.current, methodMode: 'manual', method }),
    [persist],
  );
  const setMethodMode = useCallback(
    (methodMode: MethodMode) => persist({ ...settingsRef.current, methodMode }),
    [persist],
  );
  const setMadhab = useCallback(
    (madhab: MadhabKey) => persist({ ...settingsRef.current, madhab }),
    [persist],
  );
  const setAdjustment = useCallback(
    (prayer: PrayerAdjustmentKey, minutes: number) =>
      persist({
        ...settingsRef.current,
        adjustments: {
          ...settingsRef.current.adjustments,
          [prayer]: clampAdjustment(minutes),
        },
      }),
    [persist],
  );
  const setHour12 = useCallback(
    (hour12: boolean) => persist({ ...settingsRef.current, hour12 }),
    [persist],
  );
  const setManualPlace = useCallback(async (manualPlace: GeoPlace) => {
    await savePlace(manualPlace);
    setPlace(manualPlace);
    setReady(true);
    setLoading(false);
  }, []);
  const refreshLocation = useCallback(
    () => resolveAndStore(true),
    [resolveAndStore],
  );

  const locationStatus: LocationStatus = !ready || loading
    ? 'loading'
    : place
      ? 'ready'
      : permissionGranted
        ? 'needsLocation'
        : 'needsPermission';

  const value = useMemo<PrayerContextValue>(
    () => ({
      place,
      settings,
      profile,
      resolvedMethod,
      times,
      loading,
      ready,
      locationStatus,
      canAskAgain,
      setMethod,
      setMethodMode,
      setMadhab,
      setAdjustment,
      setHour12,
      setManualPlace,
      refreshLocation,
    }),
    [
      place,
      settings,
      profile,
      resolvedMethod,
      times,
      loading,
      ready,
      locationStatus,
      canAskAgain,
      setMethod,
      setMethodMode,
      setMadhab,
      setAdjustment,
      setHour12,
      setManualPlace,
      refreshLocation,
    ],
  );

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayer(): PrayerContextValue {
  const context = useContext(PrayerContext);
  if (!context) throw new Error('usePrayer must be used within a PrayerProvider');
  return context;
}
