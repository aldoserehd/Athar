import React, { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { SALAH_ORDER } from '@/features/salah';
import { ensurePermission, RECITERS, useAdhanPreview, useReminders } from '@/features/reminders';

const ATHKAR_TIMES = [
  { key: 'morning', hour: 8, minute: 0 },
  { key: 'midday', hour: 13, minute: 0 },
  { key: 'evening', hour: 19, minute: 0 },
  { key: 'night', hour: 21, minute: 30 },
] as const;

export function NotificationsScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation();
  const { settings, setAdhanEnabled, togglePrayer, setReciter, setAthkarEnabled, setAthkarTime } =
    useReminders();
  const { playing, toggle: previewAdhan } = useAdhanPreview();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('notifications.title') });
  }, [navigation, t]);

  async function toggleAdhan(v: boolean) {
    if (v) {
      const ok = await ensurePermission();
      if (!ok) return;
    }
    setAdhanEnabled(v);
  }
  async function toggleAthkar(v: boolean) {
    if (v) {
      const ok = await ensurePermission();
      if (!ok) return;
    }
    setAthkarEnabled(v);
  }

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingTop: 16 }}>
      {/* Adhan master */}
      <Card style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="bodyMedium">{t('notifications.adhanReminders')}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('notifications.adhanDesc')}
          </Text>
        </View>
        <Switch
          value={settings.adhanEnabled}
          onValueChange={toggleAdhan}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {settings.adhanEnabled ? (
        <>
          <Text variant="label" color="textMuted" style={styles.section}>
            {t('notifications.prayers')}
          </Text>
          <Card padded={false} style={styles.group}>
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
          </Card>

          <Text variant="label" color="textMuted" style={styles.section}>
            {t('notifications.adhanVoice')}
          </Text>
          <Card padded={false} style={styles.group}>
            {RECITERS.map((r, i) => {
              const active = settings.reciterId === r.id;
              return (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable onPress={() => setReciter(r.id)} style={styles.toggleRow}>
                    <Pressable
                      onPress={() => previewAdhan(r.id)}
                      hitSlop={8}
                      style={[styles.playBtn, { backgroundColor: theme.colors.surfaceContainerHigh }]}
                      accessibilityLabel={`Preview ${r.name}`}
                    >
                      <Ionicons
                        name={playing === r.id ? 'stop' : 'play'}
                        size={16}
                        color={theme.colors.primary}
                      />
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
          </Card>
          <Text variant="caption" color="textFaint" style={{ marginTop: 8 }}>
            {t('notifications.voiceNote')}
          </Text>
        </>
      ) : null}

      {/* Athkar */}
      <Card style={[styles.rowBetween, { marginTop: 24 }]}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="bodyMedium">{t('notifications.dailyAthkar')}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('notifications.athkarDesc')}
          </Text>
        </View>
        <Switch
          value={settings.athkarEnabled}
          onValueChange={toggleAthkar}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {settings.athkarEnabled ? (
        <>
          <Text variant="label" color="textMuted" style={styles.section}>
            {t('notifications.timeOfDay')}
          </Text>
          <View style={styles.times}>
            {ATHKAR_TIMES.map((slot) => {
              const active = settings.athkarHour === slot.hour && settings.athkarMinute === slot.minute;
              return (
                <Pressable
                  key={slot.key}
                  onPress={() => setAthkarTime(slot.hour, slot.minute)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text variant="label" style={{ color: active ? theme.colors.onPrimary : theme.colors.textMuted }}>
                    {t(`notifications.${slot.key}`)}
                  </Text>
                  <Text variant="caption" style={{ color: active ? theme.colors.onPrimary : theme.colors.textFaint }}>
                    {String(slot.hour).padStart(2, '0')}:{String(slot.minute).padStart(2, '0')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 24 }}>
        {t('notifications.offlineNote')}
      </Text>
    </Screen>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginLeft: 16 }} />;
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  section: { letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  group: { overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  times: { flexDirection: 'row', gap: 10 },
  timeChip: { flex: 1, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, paddingVertical: 12, gap: 2 },
});
