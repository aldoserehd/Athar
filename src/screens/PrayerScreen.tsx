import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';

import { Card, IconButton, Logo, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import {
  formatTime,
  methodInfo,
  PrayerSettingsSheet,
  PrayerSlot,
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
  const { place, settings, times, loading, ready, permissionDenied, refreshLocation } =
    usePrayer();
  const salah = useSalah();
  const t = useT();
  const now = useNow();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const remaining = useMemo(() => {
    if (!times) return null;
    return countdownParts(times.next.time.getTime() - now.getTime());
  }, [times, now]);

  return (
    <Screen
      scroll
      title={t('prayer.title')}
      subtitle={place.city + (place.isFallback ? ` · ${t('prayer.defaultSuffix')}` : '')}
      headerRight={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Logo size={26} />
          <IconButton
            icon="options-outline"
            accessibilityLabel="Prayer settings"
            onPress={() => setSettingsOpen(true)}
          />
        </View>
      }
    >
      <Text variant="label" color="textMuted" style={{ marginBottom: 12 }}>
        {t('prayer.greeting')} · {t(`prayer.${greetingKey()}`)}
      </Text>

      {/* Next prayer countdown */}
      <Card style={styles.hero}>
        <View style={styles.heroGlyph}>
          <Ionicons name="time-outline" size={120} color={theme.colors.primary} />
        </View>
        {!ready || !times ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <Text variant="label" color="textMuted" style={styles.heroLabel}>
              {t('prayer.nextIs')} {t(`prayerNames.${times.next.name}`).toUpperCase()}
            </Text>
            <Text variant="display" color="primary" style={{ marginTop: 2 }}>
              {remaining
                ? `${String(remaining.h).padStart(2, '0')}:${String(remaining.m).padStart(2, '0')}:${String(
                    remaining.s
                  ).padStart(2, '0')}`
                : '--:--:--'}
            </Text>
            <Text variant="body" color="textMuted" style={{ marginTop: 4 }}>
              {t('prayer.nextAt', {
                name: t(`prayerNames.${times.next.name}`),
                time: formatTime(times.next.time, settings.hour12),
                city: place.city,
              })}
            </Text>
          </>
        )}
      </Card>

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
          accessibilityLabel="Open qibla compass"
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

      {/* Times list */}
      <View style={styles.listHead}>
        <Text variant="heading">{t('prayer.todaysTimes')}</Text>
        <Pressable onPress={refreshLocation} hitSlop={8} style={styles.refresh}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          ) : (
            <Ionicons name="locate-outline" size={16} color={theme.colors.textMuted} />
          )}
          <Text variant="caption" color="textMuted" style={{ marginLeft: 6 }}>
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
        />
      ))}

      {permissionDenied ? (
        <Pressable onPress={refreshLocation}>
          <Card alt style={styles.notice}>
            <Ionicons name="location-outline" size={18} color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted" style={{ flex: 1, marginLeft: 10 }}>
              {t('prayer.usingDefault', { city: place.city })}
            </Text>
          </Card>
        </Pressable>
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 16 }}>
        {t('prayer.calcNote', { method: methodInfo(settings.method).label })}
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
}: {
  slot: PrayerSlot;
  isNext: boolean;
  isPast: boolean;
  hour12: boolean;
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
            marginLeft: 14,
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
        {formatTime(slot.time, hour12)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', marginBottom: 16, paddingVertical: 22 },
  heroGlyph: { position: 'absolute', right: -16, top: -10, opacity: 0.06 },
  heroLabel: { letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1 },
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
  nextDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 10 },
  notice: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
});
