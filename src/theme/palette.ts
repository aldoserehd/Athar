/**
 * Athar color palette — Material 3 tokens, adapted from the Stitch designs.
 *
 * Light mode keeps the brand deep-teal as primary on a warm off-white; dark
 * mode is a deep navy with a luminous light-blue primary. Components read these
 * via `useTheme().colors.*` — never hardcode hex.
 */

export const brand = {
  teal: '#0F4C5C',
  tealDeep: '#003441',
  navy: '#051424',
  skyBlue: '#90D0E3', // dark-mode primary
  sand: '#D4C5A4',
  gold: '#D4A574',
  ink: '#1A1A1A',
} as const;

export type ThemeColors = {
  /** App background. */
  background: string;
  /** Base surface (often == background in M3). */
  surface: string;
  /** Tonal card surface (surface-container-low). */
  surfaceAlt: string;
  /** A higher container tone (surface-container). */
  surfaceContainer: string;
  /** Highest container tone (surface-container-high). */
  surfaceContainerHigh: string;
  /** Hairline borders / dividers (outline-variant). */
  border: string;

  /** Brand primary for key actions and active states. */
  primary: string;
  /** Foreground on top of `primary`. */
  onPrimary: string;
  /** Tonal primary fill. */
  primaryContainer: string;
  /** Foreground on `primaryContainer`. */
  onPrimaryContainer: string;

  /** Secondary accent (gold/sand). */
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  /** Alias kept for older components: the gold/sand highlight. */
  accent: string;

  /** Default body text (on-surface). */
  text: string;
  /** Secondary text (on-surface-variant). */
  textMuted: string;
  /** Faint text / disabled (outline). */
  textFaint: string;
  /** Alias of textMuted for M3 naming. */
  onSurfaceVariant: string;
  /** Alias of textFaint for M3 naming. */
  outline: string;

  success: string;
  danger: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  // A soft, cool-neutral page (like iOS grouped backgrounds) so crisp white cards
  // lift off it and the teal brand reads clean and premium rather than muddy.
  background: '#EEF1F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F7F9',
  surfaceContainer: '#E9EDF1',
  surfaceContainerHigh: '#DFE5EA',
  border: '#E4E9ED',

  primary: '#0F4C5C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#CDE9F1',
  onPrimaryContainer: '#00363F',

  secondary: '#7C572D',
  secondaryContainer: '#FBE2C4',
  onSecondaryContainer: '#6B4A22',
  accent: '#B5793A',

  text: '#141A1D',
  textMuted: '#48535A',
  textFaint: '#7A868C',
  onSurfaceVariant: '#48535A',
  outline: '#7A868C',

  success: '#2E7D32',
  danger: '#BA1A1A',
  overlay: 'rgba(15, 23, 28, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#051424',
  surface: '#051424',
  surfaceAlt: '#0E1C2D',
  surfaceContainer: '#122031',
  surfaceContainerHigh: '#1D2B3C',
  border: '#233244',

  primary: '#90D0E3',
  onPrimary: '#003640',
  primaryContainer: '#599AAB',
  onPrimaryContainer: '#002E38',

  secondary: '#D4C5A4',
  secondaryContainer: '#50462C',
  onSecondaryContainer: '#C2B493',
  accent: '#D4C5A4',

  text: '#D5E4FA',
  textMuted: '#BFC8CB',
  textFaint: '#899295',
  onSurfaceVariant: '#BFC8CB',
  outline: '#899295',

  success: '#5BAE83',
  danger: '#FFB4AB',
  overlay: 'rgba(0, 0, 0, 0.6)',
};
