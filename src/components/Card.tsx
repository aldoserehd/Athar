import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '@/theme';

type CardProps = ViewProps & {
  /** Use the slightly lifted alternate surface (for nested cards). */
  alt?: boolean;
  padded?: boolean;
};

/** Rounded surface container used across the app. */
export function Card({ alt = false, padded = true, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  // A soft shadow in light mode gives cards real depth against the warm page;
  // in dark mode shadows read as noise, so we lean on the border instead.
  const elevated = theme.scheme === 'light' && !alt;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: alt ? theme.colors.surfaceAlt : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing.lg : 0,
        },
        elevated && styles.shadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  shadow: {
    shadowColor: '#1A2833',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
});
