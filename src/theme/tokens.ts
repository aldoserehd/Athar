/**
 * Non-color design tokens: spacing, radius, typography scale.
 * Spacing uses a 4pt base grid.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

/** Font families registered in App.tsx via expo-google-fonts. */
export const fonts = {
  // Inter — UI
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Amiri — Arabic / scriptural text
  arabic: 'Amiri_400Regular',
  arabicBold: 'Amiri_700Bold',
} as const;

/** Type scale. Sizes pair with a comfortable lineHeight for reading. */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.bold },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold },
  heading: { fontSize: 19, lineHeight: 26, fontFamily: fonts.semibold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: fonts.medium },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.medium },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium },
  // Large numeric readouts (counters, stats)
  counter: { fontSize: 40, lineHeight: 44, fontFamily: fonts.bold },
} as const;

export type TypeVariant = keyof typeof type;
