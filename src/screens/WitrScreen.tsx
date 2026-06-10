import React, { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatTime, usePrayer } from '@/features/prayer';
import { DUA_QUNUT, WITR_GUIDE, useWitr } from '@/features/witr';

export function WitrScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation();
  const { times, settings } = usePrayer();
  const { enabled, prayedToday, setEnabled, togglePrayed } = useWitr();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('witr.title') });
  }, [navigation, t]);

  const ishaTime = times?.slots.find((s) => s.name === 'isha')?.time;

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 40 }}>
      <Text variant="body" color="textMuted" style={{ marginTop: 4 }}>
        {t('witr.intro')}
      </Text>

      {/* Time window */}
      <Card style={styles.window}>
        <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text variant="bodyMedium">{t('witr.window')}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {ishaTime
              ? t('witr.windowFrom', { time: formatTime(ishaTime, settings.hour12) })
              : t('witr.windowGeneric')}
          </Text>
        </View>
      </Card>

      {/* Track today */}
      <Card style={styles.track}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="bodyMedium">{t('witr.trackTitle')}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {t('witr.trackDesc')}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {enabled ? (
        <Pressable onPress={togglePrayed} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
          <Card
            style={[
              styles.prayed,
              prayedToday && { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Ionicons
              name={prayedToday ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={prayedToday ? theme.colors.success : theme.colors.textFaint}
            />
            <Text
              variant="bodyMedium"
              style={{ marginLeft: 12, color: prayedToday ? theme.colors.onPrimaryContainer : theme.colors.text }}
            >
              {prayedToday ? t('witr.prayedDone') : t('witr.markPrayed')}
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {/* Du'a al-Qunut */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('witr.qunutTitle')}
      </Text>
      <Card>
        <Text
          style={{
            fontFamily: theme.fonts.arabic,
            fontSize: 22,
            lineHeight: 44,
            color: theme.colors.text,
            textAlign: 'right',
          }}
        >
          {DUA_QUNUT.arabic}
        </Text>
        <Text variant="body" color="textMuted" style={{ marginTop: 14, lineHeight: 22 }}>
          {DUA_QUNUT.translation}
        </Text>
        <Text variant="caption" color="textFaint" style={{ marginTop: 10 }}>
          {DUA_QUNUT.reference}
        </Text>
      </Card>

      {/* Guidance */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('witr.howTitle')}
      </Text>
      <Card>
        {WITR_GUIDE.map((g, i) => (
          <View key={i} style={[styles.guideRow, i > 0 && { marginTop: 12 }]}>
            <Ionicons name="ellipse" size={7} color={theme.colors.primary} style={{ marginTop: 8 }} />
            <Text variant="body" color="textMuted" style={{ flex: 1, marginLeft: 10, lineHeight: 22 }}>
              {isAr ? g.ar : g.en}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  window: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  track: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  prayed: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  guideRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
