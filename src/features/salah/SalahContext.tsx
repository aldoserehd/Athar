import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ReasonKey, reasonInfo } from './reasons';
import {
  DayRecord,
  emptyDay,
  SALAH_ORDER,
  SalahEntry,
  SalahKey,
  SalahStatus,
  todayKey,
} from './types';

const STORAGE_KEY = 'athar.salah.v1';

type Persisted = {
  record: DayRecord;
  makeupOwed: number;
  remindersEnabled: boolean;
  /** When on, a prayer whose window has ended without being logged is counted as missed. */
  autoMissed: boolean;
};

function owes(entry: SalahEntry): boolean {
  return entry.status === 'missed';
}

type SalahContextValue = {
  record: DayRecord;
  makeupOwed: number;
  remindersEnabled: boolean;
  hydrated: boolean;
  prayedToday: number;
  requiredToday: number;
  /** Mark a prayer as performed (the in-app oath confirmation). */
  markPrayed: (key: SalahKey) => void;
  /** Log that a prayer wasn't performed, with a reason. */
  markReason: (key: SalahKey, reason: ReasonKey) => void;
  /** Reset a prayer back to unlogged. */
  undo: (key: SalahKey) => void;
  /** Mark a prayer as missed (owes a make-up) — used by the auto-missed tracker. */
  markMissed: (key: SalahKey) => void;
  /** Log one owed prayer as made up. */
  makeUpOne: () => void;
  setRemindersEnabled: (value: boolean) => void;
  /** Whether un-logged prayers are automatically counted as missed. */
  autoMissed: boolean;
  setAutoMissed: (value: boolean) => void;
};

const SalahContext = createContext<SalahContextValue | undefined>(undefined);

export function SalahProvider({ children }: { children: React.ReactNode }) {
  const [record, setRecord] = useState<DayRecord>(() => emptyDay(todayKey()));
  const [makeupOwed, setMakeupOwed] = useState(0);
  const [remindersEnabled, setRemindersState] = useState(false);
  const [autoMissed, setAutoMissedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate, rolling over to a fresh day if the stored record is from the past.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        const today = todayKey();
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setMakeupOwed(Math.max(0, parsed.makeupOwed ?? 0));
          setRemindersState(!!parsed.remindersEnabled);
          setAutoMissedState(!!parsed.autoMissed);
          if (parsed.record && parsed.record.date === today) {
            setRecord({ ...emptyDay(today), ...parsed.record });
          } else {
            setRecord(emptyDay(today));
          }
        }
      })
      .catch(() => {})
      .finally(() => active && setHydrated(true));
    return () => {
      active = false;
    };
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = { record, makeupOwed, remindersEnabled, autoMissed };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [record, makeupOwed, remindersEnabled, autoMissed, hydrated]);

  // Keep "today" fresh if the app stays open past midnight.
  useEffect(() => {
    const id = setInterval(() => {
      const today = todayKey();
      setRecord((prev) => (prev.date === today ? prev : emptyDay(today)));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const setEntry = useCallback((key: SalahKey, status: SalahStatus, reason?: ReasonKey) => {
    setRecord((prev) => {
      const old = prev.entries[key];
      const next: SalahEntry = { status, reason };
      const delta = (owes(next) ? 1 : 0) - (owes(old) ? 1 : 0);
      if (delta !== 0) setMakeupOwed((m) => Math.max(0, m + delta));
      return { ...prev, entries: { ...prev.entries, [key]: next } };
    });
  }, []);

  const markPrayed = useCallback((key: SalahKey) => setEntry(key, 'prayed'), [setEntry]);

  const markReason = useCallback(
    (key: SalahKey, reason: ReasonKey) => {
      const exempt = reasonInfo(reason).exempt;
      setEntry(key, exempt ? 'excused' : 'missed', reason);
    },
    [setEntry]
  );

  const undo = useCallback((key: SalahKey) => setEntry(key, 'pending'), [setEntry]);

  // Only marks a still-pending prayer; never overrides a prayed/excused entry.
  const markMissed = useCallback(
    (key: SalahKey) =>
      setRecord((prev) => {
        if (prev.entries[key].status !== 'pending') return prev;
        setMakeupOwed((m) => Math.max(0, m + 1));
        return { ...prev, entries: { ...prev.entries, [key]: { status: 'missed' } } };
      }),
    []
  );

  const makeUpOne = useCallback(() => setMakeupOwed((m) => Math.max(0, m - 1)), []);

  const setRemindersEnabled = useCallback((value: boolean) => setRemindersState(value), []);
  const setAutoMissed = useCallback((value: boolean) => setAutoMissedState(value), []);

  const { prayedToday, requiredToday } = useMemo(() => {
    let prayed = 0;
    let excused = 0;
    SALAH_ORDER.forEach((k) => {
      const s = record.entries[k].status;
      if (s === 'prayed') prayed += 1;
      if (s === 'excused') excused += 1;
    });
    return { prayedToday: prayed, requiredToday: SALAH_ORDER.length - excused };
  }, [record]);

  const value = useMemo<SalahContextValue>(
    () => ({
      record,
      makeupOwed,
      remindersEnabled,
      hydrated,
      prayedToday,
      requiredToday,
      markPrayed,
      markReason,
      undo,
      markMissed,
      makeUpOne,
      setRemindersEnabled,
      autoMissed,
      setAutoMissed,
    }),
    [
      record,
      makeupOwed,
      remindersEnabled,
      hydrated,
      prayedToday,
      requiredToday,
      markPrayed,
      markReason,
      undo,
      markMissed,
      makeUpOne,
      setRemindersEnabled,
      autoMissed,
      setAutoMissed,
    ]
  );

  return <SalahContext.Provider value={value}>{children}</SalahContext.Provider>;
}

export function useSalah(): SalahContextValue {
  const ctx = useContext(SalahContext);
  if (!ctx) throw new Error('useSalah must be used within a SalahProvider');
  return ctx;
}
