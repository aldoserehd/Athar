import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'athar.onboarding.v1';

type OnboardingValue = {
  /** The first-run setup wizard (language / theme / notifications / features). */
  visible: boolean;
  /** The coach-mark tour that points at the bottom tabs. */
  tourVisible: boolean;
  /** Finish the wizard — then the coach tour begins. */
  complete: () => void;
  /** Skip the whole thing (wizard + tour) at once. */
  skipAll: () => void;
  /** Finish/skip the coach tour (persists that onboarding is done). */
  endTour: () => void;
  /** Re-open the setup wizard (e.g. from the More tab). */
  open: () => void;
  /** Replay just the coach tour. */
  startTour: () => void;
};

const OnboardingContext = createContext<OnboardingValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);

  // Show on first launch only.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v !== 'done') setVisible(true);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<OnboardingValue>(
    () => ({
      visible,
      tourVisible,
      complete: () => {
        setVisible(false);
        setTourVisible(true); // hand off to the coach tour
      },
      skipAll: () => {
        setVisible(false);
        setTourVisible(false);
        AsyncStorage.setItem(STORAGE_KEY, 'done').catch(() => {});
      },
      endTour: () => {
        setTourVisible(false);
        AsyncStorage.setItem(STORAGE_KEY, 'done').catch(() => {});
      },
      open: () => {
        setTourVisible(false);
        setVisible(true);
      },
      startTour: () => {
        setVisible(false);
        setTourVisible(true);
      },
    }),
    [visible, tourVisible]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
