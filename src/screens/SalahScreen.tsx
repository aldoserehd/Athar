import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Card, GradientHero, HERO_TEXT, Logo, ProgressRing, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import { formatTime, usePrayer } from '@/features/prayer';
import { ReasonSheet, SALAH_ORDER, SalahKey, useSalah } from '@/features/salah';
import { ensurePermission, useReminders } from '@/features/reminders';

export function SalahScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { times, settings } = usePrayer();
  const { record, prayedToday, requiredToday, makeupOwed, markPrayed, markReason, undo, makeUpOne, autoMissed, setAutoMissed } =
    useSalah();
  const { settings: reminders, setAdhanEnabled } = useReminders();

  const [reasonFor, setReasonFor] = useState<SalahKey | null>(null);

  async function toggleReminders(value: boolean) {
    if (value) {
      const ok = await ensurePermission();
      if (!ok) return; // permission denied — leave off
    }
    setAdhanEnabled(value);
  }

  const progress = requiredToday === 0 ? 1 : prayedToday / requiredToday;
  const timeFor = (key: SalahKey) =>
    times?.slots.find((s) => s.name === key)?.time;

  return (
    <Screen scroll title={t('salah.title')} subtitle={t('salah.subtitle')} headerRight={<Logo size={26} />}>
      {/* Summary — premium gradient hero */}
      <GradientHero glyph="checkmark-done-circle" style={styles.summaryHero}>
        <View style={styles.summaryInner}>
          <ProgressRing
            progress={progress}
            size={148}
            strokeWidth={12}
            centerLabel={`${prayedToday}/${requiredToday}`}
            caption={t('common.today')}
            trackColor={HERO_TEXT.track}
            progressColor={HERO_TEXT.sky}
            labelColor={HERO_TEXT.primary}
            captionColor={HERO_TEXT.faint}
          />
          <Text align="center" style={{ color: HERO_TEXT.muted, marginTop: 16, fontSize: 15, lineHeight: 22 }}>
            {requiredToday === 0
              ? t('salah.allExcused')
              : prayedToday === requiredToday
              ? t('salah.allDone')
              : t('salah.tapEach')}
          </Text>
          {makeupOwed > 0 ? (
            <View style={[styles.makeupPill, { backgroundColor: HERO_TEXT.chip }]}>
              <Ionicons name="refresh" size={13} color={HERO_TEXT.accent} />
              <Text style={{ color: HERO_TEXT.primary, fontSize: 13, marginLeft: 6 }}>
                {t('salah.makeupOwed')}: {makeupOwed.toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      </GradientHero>

      {/* Reminders */}
      <Card style={styles.reminder}>
        <Pressable style={styles.reminderText} onPress={() => navigation.navigate('Notifications')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="bodyMedium">{t('salah.reminders')}</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textFaint} style={{ marginLeft: 4 }} />
          </View>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('salah.remindersDesc')}
          </Text>
        </Pressable>
        <Switch
          value={reminders.adhanEnabled}
          onValueChange={toggleReminders}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {/* Auto-count missed prayers (opt-in) */}
      <Card style={styles.reminder}>
        <View style={styles.reminderText}>
          <Text variant="bodyMedium">{t('salah.autoMissed')}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('salah.autoMissedDesc')}
          </Text>
        </View>
        <Switch
          value={autoMissed}
          onValueChange={setAutoMissed}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {/* Per-prayer rows */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('salah.todaysPrayers')}
      </Text>
      {SALAH_ORDER.map((key) => {
        const entry = record.entries[key];
        const name = t(`prayerNames.${key}`);
        const time = timeFor(key);
        return (
          <Card key={key} style={styles.row}>
            <View style={styles.rowLeft}>
              <StatusDot status={entry.status} />
              <View style={{ marginLeft: 12 }}>
                <Text variant="bodyMedium">{name}</Text>
                <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                  {entry.status === 'pending'
                    ? time
                      ? formatTime(time, settings.hour12)
                      : ''
                    : entry.status === 'prayed'
                    ? t('salah.prayed')
                    : entry.status === 'excused'
                    ? entry.reason
                      ? `${t('salah.excused')} · ${t(`salahReasons.${entry.reason}`)}`
                      : t('salah.excused')
                    : entry.reason
                    ? `${t('salah.missed')} · ${t(`salahReasons.${entry.reason}`)}`
                    : t('salah.missed')}
                </Text>
              </View>
            </View>

            {entry.status === 'pending' ? (
              <View style={styles.rowActions}>
                <Pressable onPress={() => setReasonFor(key)} hitSlop={8} style={styles.couldnt}>
                  <Text variant="caption" color="textMuted">
                    {t('salah.couldnt')}
                  </Text>
                </Pressable>
                <Button label={t('salah.prayed')} size="sm" onPress={() => markPrayed(key)} />
              </View>
            ) : (
              <Pressable onPress={() => undo(key)} hitSlop={8} accessibilityLabel={`Reset ${name}`}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textFaint} />
              </Pressable>
            )}
          </Card>
        );
      })}

      {/* Make-up (qadāʾ) owed */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('salah.makeupOwed')}
      </Text>
      <Card style={styles.makeup}>
        <View style={{ flex: 1 }}>
          <Text variant="title">{makeupOwed.toLocaleString()}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('salah.makeupDesc')}
          </Text>
        </View>
        {makeupOwed > 0 ? (
          <Button label={t('salah.madeOne')} size="sm" variant="secondary" onPress={makeUpOne} />
        ) : null}
      </Card>

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 16 }}>
        {t('salah.honour')}
      </Text>

      <ReasonSheet
        visible={reasonFor !== null}
        prayerLabel={reasonFor ? t(`prayerNames.${reasonFor}`) : undefined}
        onClose={() => setReasonFor(null)}
        onPick={(reason) => reasonFor && markReason(reasonFor, reason)}
      />
    </Screen>
  );
}

function StatusDot({ status }: { status: string }) {
  const theme = useTheme();
  const map: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    prayed: { color: theme.colors.success, icon: 'checkmark-circle' },
    missed: { color: theme.colors.danger, icon: 'alert-circle' },
    excused: { color: theme.colors.accent, icon: 'pause-circle' },
    pending: { color: theme.colors.textFaint, icon: 'ellipse-outline' },
  };
  const m = map[status] ?? map.pending;
  return <Ionicons name={m.icon} size={26} color={m.color} />;
}

const styles = StyleSheet.create({
  summaryHero: { marginBottom: 16 },
  summaryInner: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  makeupPill: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  reminder: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reminderText: { flex: 1, paddingRight: 12 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couldnt: { paddingVertical: 6, paddingHorizontal: 4 },
  makeup: { flexDirection: 'row', alignItems: 'center' },
});
