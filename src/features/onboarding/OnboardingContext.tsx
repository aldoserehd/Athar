import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'athar.onboarding.v1';

type OnboardingValue = {
  /** Whether the tutorial overlay should be shown. */
  visible: boolean;
  /** Mark the tutorial finished/skipped (persists). */
  complete: () => void;
  /** Re-open the tutorial (e.g. from the More tab). */
  open: () => void;
};

const OnboardingContext = createContext<OnboardingValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

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
      complete: () => {
        setVisible(false);
        AsyncStorage.setItem(STORAGE_KEY, 'done').catch(() => {});
      },
      open: () => setVisible(true),
    }),
    [visible]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
