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
import { ReminderSettings } from './scheduler';

const STORAGE_KEY = 'athar.reminders.v1';

const DEFAULTS: ReminderSettings = {
  adhanEnabled: false,
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reciterId: 'makkah',
  athkarEnabled: false,
  athkarHour: 9,
  athkarMinute: 0,
};

type RemindersContextValue = {
  settings: ReminderSettings;
  hydrated: boolean;
  setAdhanEnabled: (v: boolean) => void;
  togglePrayer: (key: SalahKey) => void;
  setReciter: (id: string) => void;
  setAthkarEnabled: (v: boolean) => void;
  setAthkarTime: (hour: number, minute: number) => void;
};

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
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
  const setReciter = useCallback((id: string) => setSettings((s) => ({ ...s, reciterId: id })), []);
  const setAthkarEnabled = useCallback((v: boolean) => setSettings((s) => ({ ...s, athkarEnabled: v })), []);
  const setAthkarTime = useCallback(
    (hour: number, minute: number) => setSettings((s) => ({ ...s, athkarHour: hour, athkarMinute: minute })),
    []
  );

  const value = useMemo<RemindersContextValue>(
    () => ({ settings, hydrated, setAdhanEnabled, togglePrayer, setReciter, setAthkarEnabled, setAthkarTime }),
    [settings, hydrated, setAdhanEnabled, togglePrayer, setReciter, setAthkarEnabled, setAthkarTime]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}
