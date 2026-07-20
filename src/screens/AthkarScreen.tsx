import React, { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, GradientHero, HERO_TEXT, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ATHKAR_CATEGORIES, dhikrQuote, useAthkarProgress } from '@/features/athkar';
import type { RootStackParamList } from '@/navigation/types';

export function AthkarScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { counts, isCompleteToday, streak } = useAthkarProgress();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('athkar.title') });
  }, [navigation, t]);

  const quote = dhikrQuote(Math.floor(Date.now() / 86_400_000));
  const completedCount = ATHKAR_CATEGORIES.filter((c) => isCompleteToday(c.id)).length;

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 32 }}>
      {/* Daily quote + progress — premium hero */}
      <GradientHero glyph="sparkles">
        <View style={styles.heroInner}>
          <Text style={{ fontFamily: theme.fonts.arabic, fontSize: 20, lineHeight: 38, textAlign: 'center', color: HERO_TEXT.primary }}>
            {quote.arabic}
          </Text>
          {!isAr ? (
            <Text align="center" style={{ color: HERO_TEXT.muted, marginTop: 10, fontSize: 13, lineHeight: 19 }}>
              “{quote.english}”
            </Text>
          ) : null}
          <Text align="center" style={{ color: HERO_TEXT.faint, marginTop: 8, fontSize: 12 }}>
            {isAr ? quote.referenceAr : quote.reference}
          </Text>

          <View style={[styles.heroStats, { borderTopColor: 'rgba(255,255,255,0.14)' }]}>
            <View style={styles.heroStat}>
              <Text style={{ color: HERO_TEXT.primary, fontSize: 22, fontFamily: theme.fonts.bold }}>🔥 {streak}</Text>
              <Text style={{ color: HERO_TEXT.faint, fontSize: 11, marginTop: 2 }}>
                {streak > 0 ? t('athkar.dayStreak', { n: streak }) : t('athkar.startStreak')}
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.14)' }]} />
            <View style={styles.heroStat}>
              <Text style={{ color: HERO_TEXT.primary, fontSize: 22, fontFamily: theme.fonts.bold }}>
                {completedCount}/{ATHKAR_CATEGORIES.length}
              </Text>
              <Text style={{ color: HERO_TEXT.faint, fontSize: 11, marginTop: 2 }}>{t('athkar.doneToday')}</Text>
            </View>
          </View>
        </View>
      </GradientHero>

      {ATHKAR_CATEGORIES.map((cat) => {
        const doneItems = cat.items.filter((it) => (counts[it.id] ?? 0) >= it.repeat).length;
        const done = isCompleteToday(cat.id);
        return (
          <Pressable
            key={cat.id}
            onPress={() => navigation.navigate('AthkarCategory', { id: cat.id })}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Card style={styles.row}>
              <View style={[styles.icon, { backgroundColor: done ? theme.colors.primary : theme.colors.surfaceContainerHigh }]}>
                <Ionicons
                  name={done ? 'checkmark' : (cat.icon as keyof typeof Ionicons.glyphMap)}
                  size={22}
                  color={done ? theme.colors.onPrimary : theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text variant="bodyMedium">{isAr ? cat.titleAr : cat.titleEn}</Text>
                <Text variant="caption" color={done ? 'primary' : 'textFaint'} style={{ marginTop: 2 }}>
                  {done
                    ? t('athkar.completedToday')
                    : doneItems > 0
                    ? t('athkar.progress', { done: doneItems, total: cat.items.length })
                    : `${isAr ? cat.subtitleAr : cat.subtitleEn} · ${t('athkar.count', { n: cat.items.length })}`}
                </Text>
              </View>
              <Ionicons name={isAr ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.colors.textFaint} />
            </Card>
          </Pressable>
        );
      })}

      {/* Witr — voluntary night prayer */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('athkar.moreWorship')}
      </Text>
      <Pressable
        onPress={() => navigation.navigate('Witr')}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Card style={styles.row}>
          <View style={[styles.icon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons name="star-outline" size={22} color={theme.colors.accent} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text variant="bodyMedium">{t('witr.title')}</Text>
            <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
              {t('witr.subtitle')}
            </Text>
          </View>
          <Ionicons name={isAr ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.colors.textFaint} />
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroInner: { paddingVertical: 22, paddingHorizontal: 22 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  heroStat: { flex: 1, alignItems: 'center' },
  heroDivider: { width: StyleSheet.hairlineWidth, height: 34 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { letterSpacing: 0.5, marginTop: 14, marginBottom: 10 },
});
