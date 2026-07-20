import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';
import { Text } from './Text';

type ProgressRingProps = {
  /** Completion from 0 to 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Big centered value (e.g. "62%"). */
  centerLabel?: string;
  /** Small caption under the value. */
  caption?: string;
  trackColor?: string;
  progressColor?: string;
  /** Override the center value / caption colors (e.g. on a dark hero). */
  labelColor?: string;
  captionColor?: string;
};

/**
 * Circular progress indicator. Pure SVG so it works on iOS, Android and web
 * without animation libraries.
 */
export function ProgressRing({
  progress,
  size = 168,
  strokeWidth = 14,
  centerLabel,
  caption,
  trackColor,
  progressColor,
  labelColor,
  captionColor,
}: ProgressRingProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor ?? theme.colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          // Start the arc at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {(centerLabel || caption) && (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {centerLabel ? <Text variant="display" color={labelColor}>{centerLabel}</Text> : null}
          {caption ? (
            <Text variant="caption" color={captionColor ?? 'textMuted'} style={{ marginTop: 2 }}>
              {caption}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
