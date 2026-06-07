import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { TypeVariant } from '@/theme';

type ThemedTextProps = RNTextProps & {
  variant?: TypeVariant;
  /** Semantic color key from the theme, or any explicit color string. */
  color?: 'text' | 'textMuted' | 'textFaint' | 'primary' | 'accent' | 'onPrimary' | string;
  align?: TextStyle['textAlign'];
};

/**
 * App text primitive. Defaults to body type + primary text color and pulls
 * its font/size from the theme type scale so the whole app stays consistent.
 */
export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const resolvedColor =
    color in theme.colors ? theme.colors[color as keyof typeof theme.colors] : color;

  return (
    <RNText
      style={[theme.type[variant], { color: resolvedColor, textAlign: align }, style]}
      {...rest}
    />
  );
}
