import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Athkar progress & gamification — persisted on-device.
 *
 * Tracks today's per-dhikr counts (so progress survives leaving a screen), which
 * categories were completed today, a daily streak (consecutive days the user
 * completes at least one set), and a lifetime completion count. Daily counts reset
 * at midnight; the streak and totals carry over.
 */

const STORAGE_KEY = 'athar.athkar.progress.v1';

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayKey(): string {
  return dayKey(new Date());
}
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

type State = {
  date: string;
  counts: Record<string, number>;
  completed: Record<string, boolean>;
  streak: number;
  lastCompletionDate: string | null;
  totalSessions: number;
};

const FRESH = (date: string, carry?: Partial<State>): State => ({
  date,
  counts: {},
  completed: {},
  streak: carry?.streak ?? 0,
  lastCompletionDate: carry?.lastCompletionDate ?? null,
  totalSessions: carry?.totalSessions ?? 0,
});

type AthkarProgressValue = {
  hydrated: boolean;
  counts: Record<string, number>;
  completedToday: Record<string, boolean>;
  /** Streak in days — 0 if it has lapsed (no completion today or yesterday). */
  streak: number;
  totalSessions: number;
  increment: (dhikrId: string, max: number) => void;
  resetCategory: (categoryId: string, itemIds: string[]) => void;
  /** Mark a category finished for today; updates the streak (idempotent per day). */
  markComplete: (categoryId: string) => void;
  isCompleteToday: (categoryId: string) => boolean;
};

const Ctx = createContext<AthkarProgressValue | undefined>(undefined);

export function AthkarProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => FRESH(todayKey()));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as State;
        // Roll over to a fresh day if needed (keep streak/total, reset daily counts).
        setState(stored.date === todayKey() ? stored : FRESH(todayKey(), stored));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const increment = useCallback((dhikrId: string, max: number) => {
    setState((s) => {
      const cur = s.counts[dhikrId] ?? 0;
      if (cur >= max) return s;
      return { ...s, counts: { ...s.counts, [dhikrId]: cur + 1 } };
    });
  }, []);

  const resetCategory = useCallback((categoryId: string, itemIds: string[]) => {
    setState((s) => {
      const counts = { ...s.counts };
      itemIds.forEach((id) => delete counts[id]);
      return { ...s, counts, completed: { ...s.completed, [categoryId]: false } };
    });
  }, []);

  const markComplete = useCallback((categoryId: string) => {
    setState((s) => {
      if (s.completed[categoryId]) return s; // already counted today
      const today = todayKey();
      // Update streak only for the first set completed each day.
      let streak = s.streak;
      let lastCompletionDate = s.lastCompletionDate;
      if (lastCompletionDate !== today) {
        streak = lastCompletionDate === yesterdayKey() ? s.streak + 1 : 1;
        lastCompletionDate = today;
      }
      return {
        ...s,
        completed: { ...s.completed, [categoryId]: true },
        totalSessions: s.totalSessions + 1,
        streak,
        lastCompletionDate,
      };
    });
  }, []);

  const isCompleteToday = useCallback((categoryId: string) => !!state.completed[categoryId], [state.completed]);

  // A streak only "counts" if the last completion was today or yesterday.
  const liveStreak =
    state.lastCompletionDate === todayKey() || state.lastCompletionDate === yesterdayKey()
      ? state.streak
      : 0;

  const value = useMemo<AthkarProgressValue>(
    () => ({
      hydrated,
      counts: state.counts,
      completedToday: state.completed,
      streak: liveStreak,
      totalSessions: state.totalSessions,
      increment,
      resetCategory,
      markComplete,
      isCompleteToday,
    }),
    [hydrated, state.counts, state.completed, liveStreak, state.totalSessions, increment, resetCategory, markComplete, isCompleteToday]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAthkarProgress(): AthkarProgressValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAthkarProgress must be used within an AthkarProgressProvider');
  return ctx;
}
