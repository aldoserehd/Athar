import React, { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { SALAH_ORDER } from '@/features/salah';
import { ensurePermission, RECITERS, reciterName, useAdhanPreview, useReminders } from '@/features/reminders';

const ATHKAR_COUNTS = [1, 2, 3, 4] as const;
const ATHKAR_MODES = ['afterPrayer', 'night', 'spread'] as const;
const SNOOZE_OPTIONS = [5, 10, 15, 30] as const;

const PRAYER_VOICE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  fajr: 'partly-sunny-outline',
  dhuhr: 'sunny-outline',
  asr: 'partly-sunny-outline',
  maghrib: 'moon-outline',
  isha: 'moon-outline',
};

export function NotificationsScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation();
  const {
    settings,
    setAdhanEnabled,
    togglePrayer,
    setReciter,
    setPrayerReciter,
    setAthkarEnabled,
    setAthkarPerDay,
    setAthkarMode,
    setInspiringContent,
    setLockEnabled,
    toggleLockPrayer,
    setLockSnooze,
  } = useReminders();
  const { playing, toggle: previewAdhan } = useAdhanPreview();
  const lock = settings.lock;

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('notifications.title') });
  }, [navigation, t]);

  async function toggleAdhan(v: boolean) {
    if (v && !(await ensurePermission())) return;
    setAdhanEnabled(v);
  }
  async function toggleAthkar(v: boolean) {
    if (v && !(await ensurePermission())) return;
    setAthkarEnabled(v);
  }

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingTop: 12 }}>
      <Text variant="caption" color="textFaint" style={{ marginBottom: 14 }}>
        {t('notifications.lead')}
      </Text>

      {/* ───── Adhān reminders ───── */}
      <Section
        icon="notifications"
        tint={theme.colors.primary}
        title={t('notifications.adhanReminders')}
        subtitle={t('notifications.adhanDesc')}
        value={settings.adhanEnabled}
        onValueChange={toggleAdhan}
        defaultOpen
      >
        <Label>{t('notifications.prayers')}</Label>
        <View style={styles.inner}>
          {SALAH_ORDER.map((key, i) => (
            <View key={key}>
              {i > 0 ? <Divider /> : null}
              <View style={styles.toggleRow}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {t(`prayerNames.${key}`)}
                </Text>
                <Switch
                  value={settings.prayers[key]}
                  onValueChange={() => togglePrayer(key)}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Default adhān voice — applies to every prayer at once */}
        <Collapsible
          icon="musical-notes-outline"
          title={t('notifications.adhanVoice')}
          value={reciterName(settings.reciterId)}
        >
          <Text variant="caption" color="textFaint" style={{ marginBottom: 8 }}>
            {t('notifications.adhanVoiceHint')}
          </Text>
          <ReciterPicker
            selectedId={settings.reciterId}
            onSelect={setReciter}
            playing={playing}
            onPreview={previewAdhan}
          />
          <Text variant="caption" color="textFaint" style={{ marginTop: 8 }}>
            {t('notifications.voiceNote')}
          </Text>
        </Collapsible>

        {/* Per-prayer adhān voice — tweak each prayer individually */}
        <Collapsible
          icon="options-outline"
          title={t('notifications.perPrayerVoice')}
          value={
            SALAH_ORDER.every((k) => settings.prayerReciters[k] === settings.prayerReciters.fajr)
              ? reciterName(settings.prayerReciters.fajr)
              : t('notifications.mixed')
          }
        >
          <Text variant="caption" color="textFaint" style={{ marginBottom: 4 }}>
            {t('notifications.perPrayerVoiceHint')}
          </Text>
          {SALAH_ORDER.map((key) => (
            <Collapsible
              key={key}
              icon={PRAYER_VOICE_ICON[key]}
              title={t(`prayerNames.${key}`)}
              value={reciterName(settings.prayerReciters[key])}
            >
              <ReciterPicker
                selectedId={settings.prayerReciters[key]}
                onSelect={(id) => setPrayerReciter(key, id)}
                playing={playing}
                onPreview={previewAdhan}
              />
            </Collapsible>
          ))}
        </Collapsible>
      </Section>

      {/* ───── Daily athkār ───── */}
      <Section
        icon="book"
        tint={theme.colors.primary}
        title={t('notifications.dailyAthkar')}
        subtitle={t('notifications.athkarDesc')}
        value={settings.athkarEnabled}
        onValueChange={toggleAthkar}
      >
        <Label>{t('notifications.athkarMode')}</Label>
        <View style={styles.chips}>
          {ATHKAR_MODES.map((mode) => {
            const active = settings.athkarMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setAthkarMode(mode)}
                style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: active ? theme.colors.primary : theme.colors.border }]}
              >
                <Text variant="label" style={{ color: active ? theme.colors.onPrimary : theme.colors.textMuted }}>
                  {t(`notifications.mode_${mode}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption" color="textFaint" style={{ marginTop: 8 }}>
          {t(`notifications.modeDesc_${settings.athkarMode}`)}
        </Text>

        {settings.athkarMode !== 'afterPrayer' ? (
          <>
            <Label>{t('notifications.perDay')}</Label>
            <View style={styles.chips}>
              {ATHKAR_COUNTS.map((n) => {
                const active = settings.athkarPerDay === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setAthkarPerDay(n)}
                    style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: active ? theme.colors.primary : theme.colors.border }]}
                  >
                    <Text variant="bodyMedium" style={{ color: active ? theme.colors.onPrimary : theme.colors.textMuted }}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </Section>

      {/* ───── Inspiring reminders (simple toggle, no sub-options) ───── */}
      <Section
        icon="sparkles"
        tint={theme.colors.accent}
        title={t('notifications.inspiring')}
        subtitle={t('notifications.inspiringDesc')}
        value={settings.inspiringContent}
        onValueChange={setInspiringContent}
      />

      {/* ───── Prayer Focus ───── */}
      <Section
        icon="moon"
        tint={theme.colors.primary}
        title={t('notifications.prayerLock')}
        subtitle={t('notifications.prayerLockDesc')}
        value={lock.enabled}
        onValueChange={setLockEnabled}
      >
        <Label>{t('notifications.prayerFocusHowTitle')}</Label>
        <View style={[styles.howCard, { backgroundColor: theme.colors.surfaceContainer }]}>
          {[t('notifications.prayerFocusStep1'), t('notifications.prayerFocusStep2'), t('notifications.prayerFocusStep3')].map((step, i) => (
            <View key={i} style={[styles.stepRow, i > 0 && { marginTop: 12 }]}>
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]}>
                <Text variant="caption" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>{i + 1}</Text>
              </View>
              <Text variant="body" color="textMuted" style={{ flex: 1, marginLeft: 12, lineHeight: 21 }}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        <Label>{t('notifications.lockPrayers')}</Label>
        <View style={styles.inner}>
          {SALAH_ORDER.map((key, i) => (
            <View key={key}>
              {i > 0 ? <Divider /> : null}
              <View style={styles.toggleRow}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {t(`prayerNames.${key}`)}
                </Text>
                <Switch
                  value={lock.prayers[key]}
                  onValueChange={() => toggleLockPrayer(key)}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))}
        </View>

        <Label>{t('notifications.snooze')}</Label>
        <View style={styles.chips}>
          {SNOOZE_OPTIONS.map((m) => {
            const active = lock.snoozeMinutes === m;
            return (
              <Pressable
                key={m}
                onPress={() => setLockSnooze(m)}
                style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: active ? theme.colors.primary : theme.colors.border }]}
              >
                <Text variant="bodyMedium" style={{ color: active ? theme.colors.onPrimary : theme.colors.textMuted }}>
                  {t('notifications.minutesShort', { minutes: String(m) })}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption" color="textFaint" style={{ marginTop: 10 }}>
          {t('notifications.lockNote')}
        </Text>
      </Section>

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 18 }}>
        {t('notifications.offlineNote')}
      </Text>
    </Screen>
  );
}

/**
 * A settings category: a compact card with an icon, title, master switch, and an
 * expand chevron that reveals its sub-options (only when the feature is on, and
 * only if it has any). Collapsed by default so the whole page is scannable.
 */
function Section({
  icon,
  tint,
  title,
  subtitle,
  value,
  onValueChange,
  defaultOpen,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);
  const expandable = !!children && value;

  function handleToggle(v: boolean) {
    onValueChange(v);
    if (v) setOpen(true); // reveal options the moment it's enabled
  }

  return (
    <Card padded={false} style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
        <Pressable
          style={{ flex: 1 }}
          disabled={!expandable}
          onPress={() => setOpen((o) => !o)}
        >
          <Text variant="bodyMedium">{title}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        </Pressable>
        {expandable ? (
          <Pressable onPress={() => setOpen((o) => !o)} hitSlop={8} style={{ marginRight: 8 }}>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textFaint} />
          </Pressable>
        ) : null}
        <Switch
          value={value}
          onValueChange={handleToggle}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </View>
      {expandable && open ? (
        <View style={[styles.body, { borderTopColor: theme.colors.border }]}>{children}</View>
      ) : null}
    </Card>
  );
}

/** A label-less nested collapsible (e.g. the reciter picker) showing its current value. */
function Collapsible({
  icon,
  title,
  value,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 14 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={[styles.collapsibleHead, { backgroundColor: theme.colors.surfaceContainer }]}
      >
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text variant="bodyMedium">{title}</Text>
          {!open ? (
            <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
              {value}
            </Text>
          ) : null}
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textFaint} />
      </Pressable>
      {open ? <View style={{ marginTop: 8 }}>{children}</View> : null}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label" color="textMuted" style={styles.label}>
      {children}
    </Text>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginLeft: 16 }} />;
}

/** The reciter list with per-row preview — reused for the default voice and each prayer. */
function ReciterPicker({
  selectedId,
  onSelect,
  playing,
  onPreview,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  playing: string | null;
  onPreview: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.inner}>
      {RECITERS.map((r, i) => {
        const active = selectedId === r.id;
        return (
          <View key={r.id}>
            {i > 0 ? <Divider /> : null}
            <Pressable onPress={() => onSelect(r.id)} style={styles.toggleRow}>
              <Pressable
                onPress={() => onPreview(r.id)}
                hitSlop={8}
                style={[styles.playBtn, { backgroundColor: theme.colors.surfaceContainerHigh }]}
                accessibilityLabel={`Preview ${r.name}`}
              >
                <Ionicons name={playing === r.id ? 'stop' : 'play'} size={15} color={theme.colors.primary} />
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="bodyMedium">{r.name}</Text>
                <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                  {r.place}
                </Text>
              </View>
              {active ? (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
              ) : (
                <View style={{ width: 22 }} />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 16 },
  label: { letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  inner: { borderRadius: 12, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingVertical: 11, gap: 2 },
  collapsibleHead: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  howCard: { borderRadius: 12, padding: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
