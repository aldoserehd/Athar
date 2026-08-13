import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Card, GradientHero, HERO_TEXT, Logo, ProgressRing, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import { formatTime, usePrayer } from '@/features/prayer';
import { ReasonSheet, SALAH_ORDER, SalahKey, useSalah } from '@/features/salah';
import { ensurePermission, useReminders } from '@/features/reminders';

export function SalahScreen() {
  const theme = useTheme();
  const { t, language, isRTL } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { times, settings } = usePrayer();
  const { record, prayedToday, requiredToday, makeupOwed, markPrayed, markReason, undo, makeUpOne, autoMissed, setAutoMissed } =
    useSalah();
  const { settings: reminders, setAdhanEnabled } = useReminders();

  const [reasonFor, setReasonFor] = useState<SalahKey | null>(null);
  // Ticks each minute so prayers unlock the moment their time arrives.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

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
            <Text style={{ color: HERO_TEXT.primary, fontSize: 13, marginStart: 6 }}>
                {t('salah.makeupOwed')}: {makeupOwed.toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      </GradientHero>

      {/* Reminders */}
      <Card style={[styles.reminder, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
        <Pressable style={styles.reminderText} onPress={() => navigation.navigate('Notifications')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="bodyMedium">{t('salah.reminders')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={theme.colors.textFaint} style={{ marginStart: 4 }} />
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
      <Card style={[styles.reminder, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
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
        // A prayer can only be logged once its time has arrived — future prayers
        // stay locked until then.
        const locked = entry.status === 'pending' && !!time && now < time.getTime();
        return (
          <Card key={key} style={[styles.row, isRTL && Platform.OS === 'web' && styles.rowRTL, locked && { opacity: 0.55 }]}>
            <View style={[styles.rowLeft, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
              <StatusDot status={locked ? 'locked' : entry.status} />
            <View style={{ marginStart: 12, flex: 1 }}>
                <Text variant="bodyMedium">{name}</Text>
                <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                  {locked
                    ? `${t('salah.locked')} · ${
                        time && times
                          ? formatTime(time, settings.hour12, times.timezone, language)
                          : ''
                      }`
                    : entry.status === 'pending'
                    ? time && times
                      ? formatTime(time, settings.hour12, times.timezone, language)
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

            {locked ? (
              <Ionicons name="lock-closed" size={16} color={theme.colors.textFaint} />
            ) : entry.status === 'pending' ? (
              <View style={styles.rowActions}>
                <Pressable onPress={() => setReasonFor(key)} hitSlop={8} style={styles.couldnt}>
                  <Text variant="caption" color="textMuted">
                    {t('salah.couldnt')}
                  </Text>
                </Pressable>
                <Button label={t('salah.prayed')} size="sm" onPress={() => markPrayed(key)} />
              </View>
            ) : entry.status === 'missed' ? (
              <View style={styles.rowActions}>
                <UndoAction label={t('salah.undo')} onPress={() => undo(key)} />
                <Button label={t('salah.makeUp')} size="sm" variant="secondary" onPress={() => markPrayed(key)} />
              </View>
            ) : (
              <UndoAction label={t('salah.undo')} onPress={() => undo(key)} />
            )}
          </Card>
        );
      })}

      {/* Make-up (qadāʾ) owed */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('salah.makeupOwed')}
      </Text>
      <Card style={[styles.makeup, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
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
    pending: { color: theme.colors.primary, icon: 'ellipse-outline' },
    locked: { color: theme.colors.textFaint, icon: 'lock-closed' },
  };
  const m = map[status] ?? map.pending;
  return <Ionicons name={m.icon} size={26} color={m.color} />;
}

function UndoAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.undo,
        { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceContainerHigh },
        pressed && { opacity: 0.65 },
      ]}
    >
      <Ionicons name="arrow-undo-outline" size={14} color={theme.colors.textMuted} />
      <Text variant="caption" color="textMuted" style={{ marginStart: 5 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summaryHero: { marginBottom: 16 },
  summaryInner: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  makeupPill: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  reminder: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowRTL: { flexDirection: 'row-reverse' },
  reminderText: { flex: 1, paddingEnd: 12 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couldnt: { paddingVertical: 6, paddingHorizontal: 4 },
  undo: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  makeup: { flexDirection: 'row', alignItems: 'center' },
});
