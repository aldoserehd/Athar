import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';

import { Card, HERO_TEXT, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

const PHRASES = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', en: 'Glory be to Allah' },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', en: 'All praise is for Allah' },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', en: 'Allah is the Greatest' },
  { id: 'tahlil', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', en: 'There is no god but Allah' },
  { id: 'istighfar', arabic: 'أَسْتَغْفِرُ اللَّهَ', en: 'I seek Allah’s forgiveness' },
  { id: 'hawqala', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', en: 'No power except with Allah' },
];

const TARGETS = [33, 99, 100, 0]; // 0 = free count
const TOTAL_KEY = 'athar.tasbih.total';

export function TasbihScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const lifetimeRef = useRef(0);

  const phrase = PHRASES[phraseIndex];

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('tasbih.title') });
  }, [navigation, t]);

  useEffect(() => {
    AsyncStorage.getItem(TOTAL_KEY).then((raw) => {
      const n = raw ? parseInt(raw, 10) || 0 : 0;
      lifetimeRef.current = n;
      setLifetime(n);
    });
  }, []);

  const persistLifetime = (n: number) => {
    lifetimeRef.current = n;
    setLifetime(n);
    AsyncStorage.setItem(TOTAL_KEY, String(n)).catch(() => {});
  };

  const tap = () => {
    const next = count + 1;
    persistLifetime(lifetimeRef.current + 1);
    if (target > 0 && next >= target) {
      // Completed a full round.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRounds((r) => r + 1);
      setCount(0);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setCount(next);
    }
  };

  const reset = () => {
    setCount(0);
    setRounds(0);
  };

  const progress = target > 0 ? count / target : 0;

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 32 }}>
      {/* Phrase selector */}
      <View style={styles.chips}>
        {PHRASES.map((p, i) => {
          const active = i === phraseIndex;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPhraseIndex(i)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceContainer,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                variant="caption"
                color={active ? theme.colors.onPrimary : 'textMuted'}
                style={{ fontFamily: theme.fonts.arabic, fontSize: 15, lineHeight: 24, includeFontPadding: false }}
              >
                {p.arabic}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Big tap counter */}
      <Pressable onPress={tap} style={({ pressed }) => [styles.dialWrap, { opacity: pressed ? 0.9 : 1 }]}>
        <View style={[styles.dial, { borderColor: theme.colors.primary }]}>
          <LinearGradient
            colors={['#15697F', '#0E4353', '#062A33']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={{ color: HERO_TEXT.faint, fontSize: 12, marginBottom: 6 }}>
            {target > 0 ? t('tasbih.ofTarget', { target }) : t('tasbih.free')}
          </Text>
          <Text style={[theme.type.counter, { fontSize: 72, lineHeight: 80, includeFontPadding: false, color: '#FFFFFF' }]}>
            {count}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.arabic,
              fontSize: 24,
              lineHeight: 38,
              includeFontPadding: false,
              color: '#FFFFFF',
              marginTop: 6,
            }}
          >
            {phrase.arabic}
          </Text>
          <Text style={{ color: HERO_TEXT.muted, fontSize: 12, marginTop: 4 }}>
            {phrase.en}
          </Text>
        </View>
      </Pressable>

      {/* Progress bar */}
      {target > 0 ? (
        <View style={[styles.bar, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
          <View style={[styles.barFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: theme.colors.primary }]} />
        </View>
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 10 }}>
        {t('tasbih.tapHint')}
      </Text>

      {/* Targets */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('tasbih.target')}
      </Text>
      <View style={styles.targets}>
        {TARGETS.map((tg) => {
          const active = tg === target;
          return (
            <Pressable
              key={tg}
              onPress={() => {
                setTarget(tg);
                setCount(0);
              }}
              style={[
                styles.target,
                {
                  backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text variant="bodyMedium" color={active ? theme.colors.onPrimaryContainer : 'text'}>
                {tg === 0 ? '∞' : tg}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Text variant="title">{rounds}</Text>
          <Text variant="caption" color="textFaint" style={{ marginTop: 4 }}>
            {t('tasbih.rounds')}
          </Text>
        </Card>
        <Card style={styles.stat}>
          <Text variant="title">{lifetime.toLocaleString()}</Text>
          <Text variant="caption" color="textFaint" style={{ marginTop: 4 }}>
            {t('tasbih.lifetime')}
          </Text>
        </Card>
      </View>

      <Pressable onPress={reset} style={styles.reset} hitSlop={8}>
        <Ionicons name="refresh" size={16} color={theme.colors.textMuted} />
        <Text variant="caption" color="textMuted" style={{ marginLeft: 6 }}>
          {t('tasbih.reset')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  dialWrap: { alignItems: 'center', marginTop: 12 },
  dial: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  bar: { height: 6, borderRadius: 3, marginTop: 20, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  targets: { flexDirection: 'row', gap: 10 },
  target: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  stat: { flex: 1, alignItems: 'center' },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});
