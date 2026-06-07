import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { deviceLanguage, i18n, isRtlLanguage, LocaleCode } from './index';

const STORAGE_KEY = 'athar.language.v1';

type TranslateOptions = Record<string, string | number>;

type LanguageContextValue = {
  language: LocaleCode;
  isRTL: boolean;
  setLanguage: (code: LocaleCode) => void;
  t: (key: string, options?: TranslateOptions) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LocaleCode>(deviceLanguage());

  // Restore saved language (or fall back to the device default).
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setLanguageState(stored as LocaleCode);
    });
  }, []);

  // Keep the i18n singleton in sync so t() resolves the right locale.
  i18n.locale = language;

  const setLanguage = useCallback(
    (code: LocaleCode) => {
      setLanguageState(code);
      i18n.locale = code;
      AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});

      // Right-to-left layout requires a native reload to fully apply.
      const wantRtl = isRtlLanguage(code);
      if (I18nManager.isRTL !== wantRtl) {
        I18nManager.allowRTL(wantRtl);
        I18nManager.forceRTL(wantRtl);
        Alert.alert(
          'Restart needed',
          'Please close and reopen Athar to apply the new text direction.'
        );
      }
    },
    []
  );

  const t = useCallback(
    (key: string, options?: TranslateOptions) => i18n.t(key, { locale: language, ...options }),
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, isRTL: isRtlLanguage(language), setLanguage, t }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

/** Convenience hook for just the translate function. */
export function useT(): LanguageContextValue['t'] {
  return useLanguage().t;
}
