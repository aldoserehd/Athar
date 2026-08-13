import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';

import { Card, IconButton, Logo, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT, useLanguage } from '@/i18n/LanguageProvider';
import {
  formatTime,
  PrayerSettingsSheet,
  PrayerSlot,
  sunnahTimes,
  usePrayer,
} from '@/features/prayer';
import { useSalah } from '@/features/salah';

const PRAYER_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  fajr: 'partly-sunny-outline',
  sunrise: 'sunny-outline',
  dhuhr: 'sunny',
  asr: 'partly-sunny',
  maghrib: 'moon-outline',
  isha: 'moon',
};

function greetingKey(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function countdownParts(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function PrayerScreen() {
  const theme = useTheme();
  const { place, settings, profile, resolvedMethod, times, loading, ready, refreshLocation } =
    usePrayer();
  const salah = useSalah();
  const t = useT();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const now = useNow();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const remaining = useMemo(() => {
    if (!times) return null;
    return countdownParts(times.next.time.getTime() - now.getTime());
  }, [times, now]);

  // Fraction of the current interval elapsed (previous prayer → next), 0..1.
  const intervalProgress = useMemo(() => {
    if (!times) return 0;
    const nowMs = now.getTime();
    const nextMs = times.next.time.getTime();
    const past = times.slots
      .filter((s) => s.isPrayer && s.time.getTime() <= nowMs)
      .map((s) => s.time.getTime());
    let prevMs = past.length ? Math.max(...past) : null;
    if (prevMs == null) {
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      prevMs = midnight.getTime();
    }
    const frac = (nowMs - prevMs) / Math.max(1, nextMs - prevMs);
    return Math.max(0, Math.min(1, frac));
  }, [times, now]);

  // Last third of the night — the best time for Qiyām/Tahajjud and Witr.
  const lastThird = useMemo(() => {
    if (!times || !place || !profile) return null;
    try {
      return sunnahTimes(
        place.latitude,
        place.longitude,
        place.timezone,
        profile,
      ).lastThirdOfTheNight;
    } catch {
      return null;
    }
  }, [times, place, profile]);

  if (!place) {
    return (
      <Screen
        scroll
        title={t('prayer.title')}
        subtitle={t('prayer.locationRequired')}
        headerRight={<Logo size={26} />}
      >
        <Card alt style={styles.locationSetup}>
          {loading || !ready ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Ionicons name="location-outline" size={28} color={theme.colors.primary} />
          )}
          <Text variant="heading" align="center" style={{ marginTop: 14 }}>
            {loading || !ready ? t('prayer.findingLocation') : t('prayer.locationRequired')}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{ marginTop: 8 }}>
            {t('prayer.locationRequiredDesc')}
          </Text>
          {!loading && ready ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('LocationSetup')}
              style={[styles.locationButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text variant="label" color="onPrimary">
                {t('prayer.setLocation')}
              </Text>
            </Pressable>
          ) : null}
        </Card>
        <Text variant="label" color="textMuted" style={styles.toolsLabel}>{t('prayer.worshipTools')}</Text>
        <View style={styles.quickRow}>
          {([
            { key: 'Athkar' as const, icon: 'book-outline' as const, label: t('quick.athkar') },
            { key: 'Tasbih' as const, icon: 'ellipse-outline' as const, label: t('quick.tasbih') },
            { key: 'Names' as const, icon: 'sparkles-outline' as const, label: t('quick.names') },
            { key: 'Witr' as const, icon: 'star-outline' as const, label: t('quick.witr') },
          ]).map((tool) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tool.label}
              key={tool.key}
              onPress={() => navigation.navigate(tool.key)}
              style={styles.quickTile}
            >
              <Card style={styles.quickCard}>
                <View style={[styles.quickIcon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                  <Ionicons name={tool.icon} size={20} color={theme.colors.primary} />
                </View>
                <Text variant="caption" color="textMuted" align="center" style={{ marginTop: 8 }}>{tool.label}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      title={t('prayer.title')}
      subtitle={place.city}
      headerRight={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Logo size={26} />
          <IconButton
            icon="options-outline"
            accessibilityLabel={t('settings.prayerSettings')}
            onPress={() => setSettingsOpen(true)}
          />
        </View>
      }
    >
      <Text variant="label" color="textMuted" style={{ marginBottom: 12 }}>
        {t('prayer.greeting')} · {t(`prayer.${greetingKey()}`)}
      </Text>

      {/* Next prayer countdown — premium gradient hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={['#15697F', '#0E4353', '#062A33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="moon" size={150} color="rgba(255,255,255,0.06)" style={styles.heroGlyph} />
        {!ready || !times ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.heroInner}>
            <View style={[styles.heroTop, isAr && Platform.OS === 'web' && styles.rowRTL]}>
              <View style={styles.heroIcon}>
                <Ionicons name={PRAYER_ICON[times.next.name]} size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.heroEyebrow, isAr && { letterSpacing: 0, fontFamily: theme.fonts.uiArabicMedium }]}>
                {isAr
                  ? `${t('prayer.nextIs')} · ${t(`prayerNames.${times.next.name}`)}`
                  : `${t('prayer.nextIs').toUpperCase()} · ${t(`prayerNames.${times.next.name}`).toUpperCase()}`}
              </Text>
            </View>

            <View style={[styles.countdownRow, isAr && Platform.OS !== 'web' && styles.countdownLTRNative]}>
              {([
                { v: remaining?.h ?? 0, l: t('prayer.hrs') },
                { v: remaining?.m ?? 0, l: t('prayer.min') },
                { v: remaining?.s ?? 0, l: t('prayer.sec') },
              ] as const).map((seg, i) => (
                <React.Fragment key={seg.l}>
                  {i > 0 ? (
                    <Text style={styles.countdownColon}>
                      :
                    </Text>
                  ) : null}
                  <View style={styles.countdownCell}>
                    <Text style={styles.countdownNum}>
                      {String(seg.v).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.countdownLabel, isAr && { fontFamily: theme.fonts.uiArabicMedium }]}>
                      {seg.l}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            <View style={[styles.heroBar, isAr && styles.heroBarRTL]}>
              <View style={[styles.heroBarFill, { width: `${Math.round(intervalProgress * 100)}%` }]} />
            </View>

            <Text style={[styles.heroAt, isAr && { fontFamily: theme.fonts.uiArabicMedium, textAlign: 'right' }]}>
              {t('prayer.atTime', {
                time: formatTime(times.next.time, settings.hour12, place.timezone, language),
                city: place.city,
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Quick stats: today's salah + Qibla (tap to open the compass) */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={styles.statTop}>
            <Ionicons name="checkmark-done-circle-outline" size={18} color={theme.colors.primary} />
            <Text variant="caption" color="primary">
              {t('prayer.todayLabel')}
            </Text>
          </View>
          <Text variant="title" style={{ marginTop: 10 }}>
            {salah.prayedToday}/{salah.requiredToday}
          </Text>
          <Text variant="caption" color="textFaint" style={{ marginTop: 6 }}>
            {t('prayer.prayersPrayed')}
          </Text>
        </Card>
        <Pressable
          style={styles.statCard}
          onPress={() => navigation.navigate('Qibla')}
          accessibilityRole="button"
          accessibilityLabel={t('qibla.title')}
        >
          <Card style={{ flex: 1 }}>
            <View style={styles.statTop}>
              <Ionicons name="compass-outline" size={18} color={theme.colors.accent} />
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
            </View>
            <Text variant="title" style={{ marginTop: 10 }}>
              {times ? `${Math.round(times.qiblaDegrees)}°` : '—'}
            </Text>
            <Text variant="caption" color="textFaint" style={{ marginTop: 6 }}>
              {t('prayer.qiblaTap')}
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Worship quick actions */}
      <View style={styles.quickRow}>
        {([
          { key: 'Athkar' as const, icon: 'book-outline' as const, label: t('quick.athkar') },
          { key: 'Tasbih' as const, icon: 'ellipse-outline' as const, label: t('quick.tasbih') },
          { key: 'Names' as const, icon: 'sparkles-outline' as const, label: t('quick.names') },
          { key: 'Witr' as const, icon: 'star-outline' as const, label: t('quick.witr') },
        ]).map((q) => (
          <Pressable
            key={q.key}
            style={styles.quickTile}
            onPress={() => navigation.navigate(q.key)}
            accessibilityRole="button"
            accessibilityLabel={q.label}
          >
            <Card style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                <Ionicons name={q.icon} size={20} color={theme.colors.primary} />
              </View>
              <Text variant="caption" color="textMuted" align="center" style={{ marginTop: 8 }}>
                {q.label}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Times list */}
      <View style={styles.listHead}>
        <Text variant="heading">{t('prayer.todaysTimes')}</Text>
        <Pressable onPress={refreshLocation} hitSlop={8} style={styles.refresh}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          ) : (
            <Ionicons name="locate-outline" size={16} color={theme.colors.textMuted} />
          )}
          <Text variant="caption" color="textMuted" style={{ marginStart: 6 }}>
            {place.city}
          </Text>
        </Pressable>
      </View>

      {times?.slots.map((slot) => (
        <PrayerRow
          key={slot.name}
          slot={slot}
          isNext={times.next.name === slot.name && slot.isPrayer}
          isPast={slot.time.getTime() < now.getTime()}
          hour12={settings.hour12}
          timezone={place.timezone}
          locale={language}
        />
      ))}

      {/* Last third of the night — best time for Qiyām/Tahajjud & Witr. */}
      {lastThird ? (
        <View
          style={[
            styles.prayerRow,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.prayerLeft}>
            <Ionicons name="cloudy-night-outline" size={20} color={theme.colors.accent} />
          <View style={{ marginStart: 14 }}>
              <Text variant="body">{t('prayer.lastThird')}</Text>
              <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                {t('prayer.qiyamHint')}
              </Text>
            </View>
          </View>
          <Text variant="body" style={{ color: theme.colors.textMuted }}>
            {formatTime(lastThird, settings.hour12, place.timezone, language)}
          </Text>
        </View>
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 16 }}>
        {t('prayer.calcNote', {
          method: resolvedMethod
            ? t(`settings.methods.${resolvedMethod}.label`)
            : t('settings.automatic'),
        })}
      </Text>

      <PrayerSettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenNotifications={() => {
          setSettingsOpen(false);
          navigation.navigate('Notifications');
        }}
      />
    </Screen>
  );
}

function PrayerRow({
  slot,
  isNext,
  isPast,
  hour12,
  timezone,
  locale,
}: {
  slot: PrayerSlot;
  isNext: boolean;
  isPast: boolean;
  hour12: boolean;
  timezone: string;
  locale: string;
}) {
  const theme = useTheme();
  const t = useT();
  const muted = isPast && !isNext;
  return (
    <View
      style={[
        styles.prayerRow,
        {
          backgroundColor: isNext ? theme.colors.primaryContainer : theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          opacity: muted ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.prayerLeft}>
        <Ionicons
          name={PRAYER_ICON[slot.name]}
          size={20}
          color={isNext ? theme.colors.onPrimaryContainer : theme.colors.textMuted}
        />
        <Text
          variant={isNext ? 'bodyMedium' : 'body'}
          style={{
    marginStart: 14,
            color: isNext ? theme.colors.onPrimaryContainer : theme.colors.text,
          }}
        >
          {t(`prayerNames.${slot.name}`)}
        </Text>
        {isNext ? (
          <View style={[styles.nextDot, { backgroundColor: theme.colors.onPrimaryContainer }]} />
        ) : null}
      </View>
      <Text
        variant={isNext ? 'bodyMedium' : 'body'}
        style={{ color: isNext ? theme.colors.onPrimaryContainer : theme.colors.textMuted }}
      >
        {formatTime(slot.time, hour12, timezone, locale)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  locationSetup: { alignItems: 'center', paddingVertical: 32, marginTop: 12 },
  locationButton: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 20 },
  hero: {
    overflow: 'hidden',
    marginBottom: 16,
    borderRadius: 24,
    minHeight: 190,
    justifyContent: 'center',
    shadowColor: '#062A33',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroGlyph: { position: 'absolute', right: -24, top: -20 },
  heroInner: { padding: 24 },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  rowRTL: { flexDirection: 'row-reverse' },
  heroIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  heroEyebrow: { color: '#D4C5A4', fontSize: 12, letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold' },
  countdownRow: { flexDirection: 'row', alignItems: 'flex-start' },
  countdownLTRNative: { flexDirection: 'row-reverse' },
  countdownCell: { alignItems: 'center', minWidth: 62 },
  countdownNum: { color: '#FFFFFF', fontSize: 46, lineHeight: 50, fontFamily: 'Inter_700Bold', letterSpacing: -1, writingDirection: 'ltr' },
  countdownLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: 1, marginTop: 2, fontFamily: 'Inter_500Medium' },
  countdownColon: { color: 'rgba(255,255,255,0.4)', fontSize: 38, lineHeight: 50, fontFamily: 'Inter_700Bold', marginHorizontal: 2, writingDirection: 'ltr' },
  heroBar: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.16)', overflow: 'hidden', marginTop: 20 },
  heroBarRTL: { alignItems: 'flex-end' },
  heroBarFill: { height: 5, borderRadius: 3, backgroundColor: '#90D0E3' },
  heroAt: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 14, fontFamily: 'Inter_500Medium' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  toolsLabel: { marginTop: 22, marginBottom: 10 },
  quickTile: { flex: 1 },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4 },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refresh: { flexDirection: 'row', alignItems: 'center' },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 8,
  },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  nextDot: { width: 6, height: 6, borderRadius: 3, marginStart: 10 },
  notice: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
});
