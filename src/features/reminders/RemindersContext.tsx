import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SalahKey } from '@/features/salah';
import { AthkarMode, LockSettings, ReminderSettings } from './scheduler';

const STORAGE_KEY = 'athar.reminders.v1';

const DEFAULT_LOCK: LockSettings = {
  enabled: false, // opt-in — Prayer-Lock is OFF by default
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  snoozeMinutes: 10,
  graceMinutes: 0,
};

/** Out-of-the-box adhān voice. Nasser al-Qatami by default. */
const DEFAULT_RECITER = 'qatami';

const DEFAULTS: ReminderSettings = {
  adhanEnabled: false,
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reciterId: DEFAULT_RECITER,
  prayerReciters: {
    fajr: DEFAULT_RECITER,
    dhuhr: DEFAULT_RECITER,
    asr: DEFAULT_RECITER,
    maghrib: DEFAULT_RECITER,
    isha: DEFAULT_RECITER,
  },
  athkarEnabled: false,
  athkarHour: 9,
  athkarMinute: 0,
  athkarPerDay: 1,
  athkarRandomize: true,
  athkarMode: 'spread',
  inspiringContent: true,
  lock: DEFAULT_LOCK,
};

type RemindersContextValue = {
  settings: ReminderSettings;
  hydrated: boolean;
  setAdhanEnabled: (v: boolean) => void;
  togglePrayer: (key: SalahKey) => void;
  setReciter: (id: string) => void;
  setPrayerReciter: (key: SalahKey, id: string) => void;
  setAthkarEnabled: (v: boolean) => void;
  setAthkarTime: (hour: number, minute: number) => void;
  setAthkarPerDay: (n: number) => void;
  setAthkarRandomize: (v: boolean) => void;
  setAthkarMode: (mode: AthkarMode) => void;
  setInspiringContent: (v: boolean) => void;
  setLockEnabled: (v: boolean) => void;
  toggleLockPrayer: (key: SalahKey) => void;
  setLockSnooze: (minutes: number) => void;
};

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as Partial<ReminderSettings>;
        // Deep-merge nested objects so newly-added fields keep their defaults.
        setSettings({
          ...DEFAULTS,
          ...stored,
          prayers: { ...DEFAULTS.prayers, ...stored.prayers },
          prayerReciters: { ...DEFAULTS.prayerReciters, ...stored.prayerReciters },
          lock: { ...DEFAULT_LOCK, ...stored.lock, prayers: { ...DEFAULT_LOCK.prayers, ...stored.lock?.prayers } },
        });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, hydrated]);

  const setAdhanEnabled = useCallback((v: boolean) => setSettings((s) => ({ ...s, adhanEnabled: v })), []);
  const togglePrayer = useCallback(
    (key: SalahKey) => setSettings((s) => ({ ...s, prayers: { ...s.prayers, [key]: !s.prayers[key] } })),
    []
  );
  // Setting the default voice applies it to every prayer (the simple "one voice
  // for all" case); per-prayer overrides can then tweak individual prayers.
  const setReciter = useCallback(
    (id: string) =>
      setSettings((s) => ({
        ...s,
        reciterId: id,
        prayerReciters: { fajr: id, dhuhr: id, asr: id, maghrib: id, isha: id },
      })),
    []
  );
  const setPrayerReciter = useCallback(
    (key: SalahKey, id: string) =>
      setSettings((s) => ({ ...s, prayerReciters: { ...s.prayerReciters, [key]: id } })),
    []
  );
  const setAthkarEnabled = useCallback((v: boolean) => setSettings((s) => ({ ...s, athkarEnabled: v })), []);
  const setAthkarTime = useCallback(
    (hour: number, minute: number) => setSettings((s) => ({ ...s, athkarHour: hour, athkarMinute: minute })),
    []
  );
  const setAthkarPerDay = useCallback(
    (n: number) => setSettings((s) => ({ ...s, athkarPerDay: Math.max(1, Math.min(6, Math.round(n))) })),
    []
  );
  const setAthkarRandomize = useCallback((v: boolean) => setSettings((s) => ({ ...s, athkarRandomize: v })), []);
  const setAthkarMode = useCallback((mode: AthkarMode) => setSettings((s) => ({ ...s, athkarMode: mode })), []);
  const setInspiringContent = useCallback((v: boolean) => setSettings((s) => ({ ...s, inspiringContent: v })), []);
  const setLockEnabled = useCallback(
    (v: boolean) => setSettings((s) => ({ ...s, lock: { ...s.lock, enabled: v } })),
    []
  );
  const toggleLockPrayer = useCallback(
    (key: SalahKey) =>
      setSettings((s) => ({ ...s, lock: { ...s.lock, prayers: { ...s.lock.prayers, [key]: !s.lock.prayers[key] } } })),
    []
  );
  const setLockSnooze = useCallback(
    (minutes: number) => setSettings((s) => ({ ...s, lock: { ...s.lock, snoozeMinutes: Math.max(1, Math.round(minutes)) } })),
    []
  );

  const value = useMemo<RemindersContextValue>(
    () => ({
      settings,
      hydrated,
      setAdhanEnabled,
      togglePrayer,
      setReciter,
      setPrayerReciter,
      setAthkarEnabled,
      setAthkarTime,
      setAthkarPerDay,
      setAthkarRandomize,
      setAthkarMode,
      setInspiringContent,
      setLockEnabled,
      toggleLockPrayer,
      setLockSnooze,
    }),
    [
      settings,
      hydrated,
      setAdhanEnabled,
      togglePrayer,
      setReciter,
      setPrayerReciter,
      setAthkarEnabled,
      setAthkarTime,
      setAthkarPerDay,
      setAthkarRandomize,
      setAthkarMode,
      setInspiringContent,
      setLockEnabled,
      toggleLockPrayer,
      setLockSnooze,
    ]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}
