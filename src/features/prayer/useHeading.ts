import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

/** Shortest signed difference a→b, in (-180, 180]. */
export function angleDelta(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return d;
}

/** Circular low-pass: ease `prev` toward `next` by `alpha`, wrap-safe. */
function smooth(prev: number | null, next: number, alpha: number): number {
  if (prev === null) return next;
  return (prev + angleDelta(prev, next) * alpha + 360) % 360;
}

export type HeadingState = {
  /** Smoothed device heading in degrees from true north, or null until ready. */
  heading: number | null;
  /** Raw OS heading accuracy (lower is better on iOS; 0–3 enum on Android). */
  accuracy: number | null;
  /** True once we have at least one reading. */
  available: boolean;
  /** True if the OS reported low compass accuracy (needs calibration). */
  needsCalibration: boolean;
};

/**
 * Subscribe to the device compass. Prefers `trueHeading` (declination-corrected,
 * relative to geographic north) and falls back to `magHeading`. Smooths the
 * stream so the needle doesn't jitter.
 */
export function useHeading(active = true): HeadingState {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const smoothed = useRef<number | null>(null);
  // Learned magnetic declination (true − magnetic). The Qibla bearing is from
  // *true* north, so when the OS only gives us a magnetic heading we must add
  // this back, otherwise the needle is off by the local declination.
  const declination = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    let sub: Location.LocationSubscription | undefined;

    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
        sub = await Location.watchHeadingAsync((h) => {
          if (!mounted) return;
          // Whenever both readings are present, cache the declination so we can
          // correct magnetic-only readings on devices that don't report true.
          if (h.trueHeading >= 0 && h.magHeading >= 0) {
            declination.current = angleDelta(h.magHeading, h.trueHeading);
          }
          let raw: number;
          if (h.trueHeading >= 0) {
            raw = h.trueHeading;
          } else if (h.magHeading >= 0) {
            raw = (h.magHeading + (declination.current ?? 0) + 360) % 360;
          } else {
            return;
          }
          if (raw == null || Number.isNaN(raw)) return;
          setAccuracy(h.accuracy ?? null);
          smoothed.current = smooth(smoothed.current, raw, 0.18);
          setHeading(smoothed.current);
        });
      } catch {
        /* sensor unavailable */
      }
    })();

    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [active]);

  // iOS reports accuracy as degrees of potential error (>30 is poor). Android's
  // value is a small enum, so this threshold won't false-alarm there.
  const needsCalibration = accuracy != null && accuracy > 30;

  return { heading, accuracy, available: heading !== null, needsCalibration };
}
