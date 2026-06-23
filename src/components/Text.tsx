import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import { ARABIC_UI_FONT } from '@/theme';
import type { TypeVariant } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

type ThemedTextProps = RNTextProps & {
  variant?: TypeVariant;
  /** Semantic color key from the theme, or any explicit color string. */
  color?: 'text' | 'textMuted' | 'textFaint' | 'primary' | 'accent' | 'onPrimary' | string;
  align?: TextStyle['textAlign'];
};

/**
 * App text primitive. Defaults to body type + primary text color and pulls
 * its font/size from the theme type scale so the whole app stays consistent.
 *
 * In Arabic, UI text is rendered in Tajawal (a clean Arabic UI face) instead of
 * the dense system naskh fallback, with slightly looser line-height so Arabic
 * reads comfortably rather than cramped. Scriptural text that explicitly sets
 * `fontFamily` (Amiri) in its own `style` still wins, since `style` is applied last.
 */
export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const { language } = useLanguage();
  const resolvedColor =
    color in theme.colors ? theme.colors[color as keyof typeof theme.colors] : color;

  const base = theme.type[variant];
  // Arabic UI override: swap Inter → Tajawal and give the line a little more room.
  const arabic =
    language === 'ar' && base.fontFamily in ARABIC_UI_FONT
      ? { fontFamily: ARABIC_UI_FONT[base.fontFamily], lineHeight: Math.round(base.lineHeight * 1.2) }
      : null;

  return (
    <RNText
      style={[base, arabic, { color: resolvedColor, textAlign: align }, style]}
      {...rest}
    />
  );
}
