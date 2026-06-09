import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { usePrayer } from '@/features/prayer';
import { useReminders } from '@/features/reminders';
import { useSalah, ReasonSheet, ReasonKey, SalahKey, SALAH_ORDER } from '@/features/salah';
import { inspirationForPrayer, InspirationItem } from '@/features/inspiration';

/**
 * Cross-platform "Prayer Lock" commitment gate.
 *
 * When Lock is enabled, a full-screen, encouraging overlay appears shortly after
 * a (lock-enabled) prayer time if that prayer hasn't been logged yet. It shows
 * the prayer name, a bilingual inspiring hadith/ayah, and a gentle nudge to pray.
 *
 * It can NEVER trap the user — there are always three ways out:
 *   • "I prayed"        → marks the prayer in SalahContext and dismisses.
 *   • "Remind me later" → snoozes for the user-chosen minutes.
 *   • "I can't right now"→ opens the existing salah reasons sheet (sick / menses /
 *                          travel / …); picking any reason dismisses the gate.
 *
 * This is the working layer that the (scaffolded) native iOS app-blocking
 * degrades to. See src/features/lock/screenTime.ts and docs/IOS_APP_LOCK.md.
 */

/** A prayer becomes "active" for the gate from its time until this many ms later. */
const ACTIVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

type Pending = { key: SalahKey; at: number };

export function PrayerLockOverlay() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { times } = usePrayer();
  const { settings } = useReminders();
  const { record, markPrayed, markReason, hydrated } = useSalah();
  const lock = settings.lock;

  const [now, setNow] = useState(() => Date.now());
  // Per-prayer snooze: prayer key -> timestamp until which the gate is hushed.
  const [snoozedUntil, setSnoozedUntil] = useState<Partial<Record<SalahKey, number>>>({});
  // Prayers the user dismissed this app-session via "I prayed"/reason already
  // handled by SalahContext; snooze handles the rest.
  const [reasonFor, setReasonFor] = useState<SalahKey | null>(null);
  const [item, setItem] = useState<InspirationItem | null>(null);

  // Tick every 20s so the gate appears promptly after a prayer time passes, and
  // refresh on foreground.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20_000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  // Which prayer (if any) should currently raise the gate?
  const pending = useMemo<Pending | null>(() => {
    if (!hydrated || !lock.enabled || !times) return null;
    const grace = lock.graceMinutes * 60 * 1000;
    let best: Pending | null = null;
    for (const slot of times.slots) {
      if (!slot.isPrayer) continue;
      const key = slot.name as SalahKey;
      if (!SALAH_ORDER.includes(key)) continue;
      if (!lock.prayers[key]) continue;
      const status = record.entries[key]?.status;
      if (status && status !== 'pending') continue; // already prayed/excused/missed
      const at = slot.time.getTime() + grace;
      if (now < at) continue; // not time yet
      if (now > at + ACTIVE_WINDOW_MS) continue; // window passed
      const snooze = snoozedUntil[key];
      if (snooze && now < snooze) continue; // snoozed
      // Prefer the most recent eligible prayer.
      if (!best || at > best.at) best = { key, at };
    }
    return best;
  }, [hydrated, lock, times, record, now, snoozedUntil]);

  // Pick a fresh inspiration each time a new prayer raises the gate.
  useEffect(() => {
    if (pending) setItem((cur) => cur ?? inspirationForPrayer());
    else setItem(null);
  }, [pending]);

  const onPrayed = useCallback(() => {
    if (pending) markPrayed(pending.key);
    setItem(null);
  }, [pending, markPrayed]);

  const onSnooze = useCallback(() => {
    if (!pending) return;
    const until = Date.now() + lock.snoozeMinutes * 60 * 1000;
    setSnoozedUntil((m) => ({ ...m, [pending.key]: until }));
    setItem(null);
  }, [pending, lock.snoozeMinutes]);

  const onReason = useCallback(
    (reason: ReasonKey) => {
      if (pending) markReason(pending.key, reason);
      setReasonFor(null);
      setItem(null);
    },
    [pending, markReason]
  );

  if (!pending || !item) return null;

  const prayerName = t(`prayerNames.${pending.key}`);
  const inspirationText = isAr ? item.arabic : item.english;
  const inspirationRef = isAr ? item.referenceAr : item.reference;

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.pill },
            ]}
          >
            <Ionicons name="moon" size={46} color={theme.colors.onPrimaryContainer} />
          </View>

          <Text variant="label" color="accent" style={{ marginTop: 20, letterSpacing: 1 }}>
            {t('lock.itsTimeFor')}
          </Text>
          <Text variant="title" align="center" style={{ marginTop: 4 }}>
            {prayerName}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{ marginTop: 8, maxWidth: 320 }}>
            {t('lock.nudge')}
          </Text>

          {/* Inspiring hadith / ayah */}
          <View
            style={[
              styles.inspire,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.arabic,
                fontSize: 22,
                lineHeight: 38,
                textAlign: 'center',
                color: theme.colors.text,
              }}
            >
              {item.arabic}
            </Text>
            {!isAr ? (
              <Text variant="body" color="textMuted" align="center" style={{ marginTop: 12 }}>
                {item.english}
              </Text>
            ) : null}
            <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 10 }}>
              {inspirationRef}
            </Text>
          </View>
        </View>

        {/* Actions — always a way out */}
        <View style={styles.actions}>
          <Button label={t('lock.iPrayed')} icon="checkmark" fullWidth onPress={onPrayed} />
          <Button
            label={t('lock.remindMe', { minutes: String(lock.snoozeMinutes) })}
            icon="time-outline"
            variant="secondary"
            fullWidth
            style={{ marginTop: 10 }}
            onPress={onSnooze}
          />
          <Button
            label={t('lock.cantNow')}
            variant="ghost"
            fullWidth
            style={{ marginTop: 10 }}
            onPress={() => setReasonFor(pending.key)}
          />
        </View>
      </SafeAreaView>

      <ReasonSheet
        visible={reasonFor !== null}
        prayerLabel={prayerName}
        onClose={() => setReasonFor(null)}
        onPick={onReason}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 150, elevation: 150 },
  safe: { flex: 1, paddingHorizontal: 28 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  inspire: { marginTop: 28, padding: 20, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  actions: { paddingBottom: 24 },
});
