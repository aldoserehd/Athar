import React, { useMemo } from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme';

type CompassRoseProps = {
  size: number;
  /** Qibla bearing in degrees from north (fixed on the rose). */
  qibla: number;
  /** Whether the user is currently locked onto the qibla (highlights marker). */
  aligned: boolean;
};

/** Convert a bearing (deg clockwise from north, 0 = up) to an x/y on a circle. */
function pointOnCircle(cx: number, cy: number, radius: number, bearingDeg: number) {
  const rad = ((bearingDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * Static compass rose: degree ticks, cardinal letters, and a Kaaba marker fixed
 * at the qibla bearing. The parent rotates the whole rose by `-heading` so North
 * always points to true north as the phone turns.
 */
export function CompassRose({ size, qibla, aligned }: CompassRoseProps) {
  const theme = useTheme();
  const c = size / 2;
  const ringR = c - 6;
  const tickOuter = ringR - 4;

  const ticks = useMemo(() => {
    const items: React.ReactNode[] = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const major = deg % 30 === 0;
      const len = major ? 14 : 7;
      const a = pointOnCircle(c, c, tickOuter, deg);
      const b = pointOnCircle(c, c, tickOuter - len, deg);
      items.push(
        <Line
          key={deg}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={major ? theme.colors.textMuted : theme.colors.border}
          strokeWidth={major ? 2 : 1}
        />
      );
    }
    return items;
  }, [c, tickOuter, theme.colors.textMuted, theme.colors.border]);

  const cardinals: { label: string; deg: number; color: string }[] = [
    { label: 'N', deg: 0, color: theme.colors.danger },
    { label: 'E', deg: 90, color: theme.colors.textMuted },
    { label: 'S', deg: 180, color: theme.colors.textMuted },
    { label: 'W', deg: 270, color: theme.colors.textMuted },
  ];

  const markerColor = aligned ? theme.colors.success : theme.colors.primary;
  const kaaba = pointOnCircle(c, c, ringR - 30, qibla);
  const cube = 26;

  return (
    <Svg width={size} height={size}>
      {/* dial face */}
      <Circle cx={c} cy={c} r={ringR} fill={theme.colors.surfaceAlt} stroke={theme.colors.border} strokeWidth={1} />
      <Circle cx={c} cy={c} r={ringR - 30} fill="none" stroke={theme.colors.border} strokeWidth={1} opacity={0.5} />

      {ticks}

      {cardinals.map((cd) => {
        const p = pointOnCircle(c, c, tickOuter - 30, cd.deg);
        return (
          <SvgText
            key={cd.label}
            x={p.x}
            y={p.y + 7}
            fill={cd.color}
            fontSize={20}
            fontWeight="700"
            textAnchor="middle"
          >
            {cd.label}
          </SvgText>
        );
      })}

      {/* line from center to the qibla marker */}
      <Line x1={c} y1={c} x2={kaaba.x} y2={kaaba.y} stroke={markerColor} strokeWidth={2} opacity={0.55} />

      {/* Kaaba marker (a small cube) */}
      <G originX={kaaba.x} originY={kaaba.y} rotation={qibla}>
        <Rect
          x={kaaba.x - cube / 2}
          y={kaaba.y - cube / 2}
          width={cube}
          height={cube}
          rx={4}
          fill={markerColor}
        />
        {/* simple gold band to suggest the Kaaba's kiswah */}
        <Rect
          x={kaaba.x - cube / 2}
          y={kaaba.y - 3}
          width={cube}
          height={6}
          fill={theme.colors.accent}
        />
      </G>

      {/* center hub */}
      <Circle cx={c} cy={c} r={5} fill={theme.colors.textMuted} />
    </Svg>
  );
}

/** A fixed downward chevron drawn at the top of the dial (the "you are facing" mark). */
export function FixedPointer({ size, color }: { size: number; color: string }) {
  const w = 22;
  const h = 16;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0 }}>
      <Path d={`M0 0 L${w} 0 L${w / 2} ${h} Z`} fill={color} />
    </Svg>
  );
}
