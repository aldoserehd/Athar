import { useEffect, useState } from 'react';

import { dateKeyAt, usePrayer } from '@/features/prayer';
import { useSalah } from './SalahContext';
import { SalahKey } from './types';

/**
 * Headless. When the user has enabled "auto-count missed prayers", any prayer
 * whose window has ended (i.e. the next prayer's time has arrived) without being
 * logged is marked as missed — so an un-logged prayer counts against the make-up
 * tally instead of quietly disappearing at midnight. Opt-in and off by default.
 */
export function SalahAutoMarker() {
  const { times, place } = usePrayer();
  const { autoMissed, hydrated, record, markMissed } = useSalah();
  const [now, setNow] = useState(() => Date.now());

  // Re-check every minute so a prayer flips to "missed" as soon as its window ends.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Never auto-mark without a trusted location (times may not match the user)
    // actually is) or on a stale times table — that would mark prayers wrongly.
    if (!autoMissed || !hydrated || !times || !place) return;
    if (times.dateKey !== dateKeyAt(new Date(now), place.timezone)) return;

    const prayers = times.slots.filter((s) => s.isPrayer);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 0);
    prayers.forEach((slot, i) => {
      const key = slot.name as SalahKey;
      // A prayer's window ends when the next prayer begins (Isha → end of day).
      const deadline = prayers[i + 1]?.time.getTime() ?? endOfDay.getTime();
      // Require BOTH the prayer's own time AND its window-end to be in the past,
      // so a prayer that hasn't arrived yet can never be counted as missed.
      if (now > slot.time.getTime() && now > deadline && record.entries[key]?.status === 'pending') {
        markMissed(key);
      }
    });
  }, [now, autoMissed, hydrated, times, place, record, markMissed]);

  return null;
}
