import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * The app's signature "hero" surface — a deep-teal gradient card with a soft
 * shadow and an optional decorative glyph. Used as the focal element at the top
 * of key screens so the whole app shares one premium look. Content inside should
 * use light text (white / rgba white) since the background is always dark.
 */
export function GradientHero({
  children,
  style,
  glyph = 'moon',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Faint decorative icon in the corner; pass null to hide. */
  glyph?: keyof typeof Ionicons.glyphMap | null;
}) {
  return (
    <View style={[styles.hero, style]}>
      <LinearGradient
        colors={['#15697F', '#0E4353', '#062A33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {glyph ? <Ionicons name={glyph} size={150} color="rgba(255,255,255,0.06)" style={styles.glyph} /> : null}
      {children}
    </View>
  );
}

/** Shared light-on-dark text colors for content placed inside a GradientHero. */
export const HERO_TEXT = {
  primary: '#FFFFFF',
  muted: 'rgba(255,255,255,0.75)',
  faint: 'rgba(255,255,255,0.55)',
  accent: '#D4C5A4',
  sky: '#90D0E3',
  chip: 'rgba(255,255,255,0.14)',
  track: 'rgba(255,255,255,0.16)',
};

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#062A33',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  glyph: { position: 'absolute', right: -24, top: -20 },
});
