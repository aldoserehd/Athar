import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

import { translations, LocaleCode } from './translations';

export type LanguageInfo = {
  code: LocaleCode;
  /** English name. */
  label: string;
  /** Endonym (name in its own script). */
  native: string;
  rtl: boolean;
};

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', native: 'English', rtl: false },
  { code: 'ar', label: 'Arabic', native: 'العربية', rtl: true },
];

export const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function isRtlLanguage(code: LocaleCode): boolean {
  return LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
}

/** Best supported locale for the device, defaulting to English. */
export function deviceLanguage(): LocaleCode {
  const codes = getLocales().map((l) => l.languageCode);
  for (const c of codes) {
    if (c && LANGUAGES.some((l) => l.code === c)) return c as LocaleCode;
  }
  return 'en';
}

export type { LocaleCode } from './translations';
