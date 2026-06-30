import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { athkarCategory, dhikrQuote, useAthkarProgress, type Dhikr } from '@/features/athkar';
import type { RootStackParamList } from '@/navigation/types';

type CategoryRoute = RouteProp<RootStackParamList, 'AthkarCategory'>;

export function AthkarCategoryScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation();
  const route = useRoute<CategoryRoute>();
  const category = athkarCategory(route.params.id);
  const { counts, increment, resetCategory, markComplete, isCompleteToday, streak } = useAthkarProgress();

  useLayoutEffect(() => {
    navigation.setOptions({ title: category ? (isAr ? category.titleAr : category.titleEn) : t('athkar.title') });
  }, [navigation, category, isAr, t]);

  const completed = useMemo(
    () => (category ? category.items.filter((it) => (counts[it.id] ?? 0) >= it.repeat).length : 0),
    [category, counts]
  );
  const allDone = !!category && completed === category.items.length;

  // The moment every dhikr is finished, record the completion (updates streak).
  useEffect(() => {
    if (category && allDone && !isCompleteToday(category.id)) {
      markComplete(category.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [allDone, category, isCompleteToday, markComplete]);

  if (!category) {
    return (
      <Screen edges={['left', 'right']}>
        <Text variant="body" color="textMuted" style={{ marginTop: 24 }}>
          {t('athkar.notFound')}
        </Text>
      </Screen>
    );
  }

  const done = isCompleteToday(category.id);
  const quote = dhikrQuote(Math.floor(Date.now() / 86_400_000) + category.id.length);

  const tap = (item: Dhikr) => {
    if ((counts[item.id] ?? 0) >= item.repeat) return;
    const willComplete = counts[item.id] + 1 >= item.repeat;
    increment(item.id, item.repeat);
    if (willComplete) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const share = () => {
    const title = isAr ? category.titleAr : category.titleEn;
    Share.share({
      message: isAr
        ? `أتممتُ ${title} في تطبيق أثر 🤲\n${quote.arabic}\n— ${quote.referenceAr}`
        : `I completed ${title} on Athar 🤲\n“${quote.english}”\n— ${quote.reference}`,
    }).catch(() => {});
  };

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 40 }}>
      {/* Completion celebration */}
      {done ? (
        <Card style={[styles.celebrate, { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }]}>
          <View style={styles.celebrateTop}>
            <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
            <Text variant="bodyMedium" style={{ marginLeft: 10, color: theme.colors.onPrimaryContainer, flex: 1 }}>
              {t('athkar.completedTitle')}
            </Text>
            {streak > 0 ? (
              <View style={[styles.streakPill, { backgroundColor: theme.colors.surface }]}>
                <Text variant="caption">🔥 {t('athkar.dayStreak', { n: streak })}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontFamily: theme.fonts.arabic, fontSize: 19, lineHeight: 34, textAlign: 'right', marginTop: 12, color: theme.colors.onPrimaryContainer }}>
            {quote.arabic}
          </Text>
          {!isAr ? (
            <Text variant="caption" style={{ marginTop: 8, color: theme.colors.onPrimaryContainer, opacity: 0.85, lineHeight: 18 }}>
              “{quote.english}”
            </Text>
          ) : null}
          <View style={styles.celebrateActions}>
            <Text variant="caption" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}>
              {isAr ? quote.referenceAr : quote.reference}
            </Text>
            <Pressable onPress={share} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="share-social-outline" size={16} color={theme.colors.onPrimaryContainer} />
              <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.onPrimaryContainer }}>
                {t('hadith.share')}
              </Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      {/* Progress */}
      <Card style={styles.progress}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" color={allDone ? 'primary' : 'text'}>
            {allDone ? t('athkar.allComplete') : t('athkar.progress', { done: completed, total: category.items.length })}
          </Text>
          <View style={[styles.bar, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <View
              style={[
                styles.barFill,
                { width: `${(completed / category.items.length) * 100}%`, backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        </View>
        <Pressable
          onPress={() => resetCategory(category.id, category.items.map((i) => i.id))}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}
        >
          <Ionicons name="refresh" size={16} color={theme.colors.textMuted} />
          <Text variant="caption" color="textMuted" style={{ marginLeft: 4 }}>
            {t('athkar.reset')}
          </Text>
        </Pressable>
      </Card>

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 4, marginBottom: 12 }}>
        {t('athkar.tapHint')}
      </Text>

      {category.items.map((item) => {
        const count = counts[item.id] ?? 0;
        const remaining = Math.max(0, item.repeat - count);
        const isDone = remaining === 0;
        const virtue = isAr ? item.virtueAr : item.virtue;
        return (
          <Pressable key={item.id} onPress={() => tap(item)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <Card style={[styles.item, isDone && { borderColor: theme.colors.primary, borderWidth: 1 }]}>
              <Text
                style={{
                  fontFamily: theme.fonts.arabic,
                  fontSize: 22,
                  lineHeight: 42,
                  includeFontPadding: false,
                  color: theme.colors.text,
                  textAlign: 'right',
                }}
              >
                {item.arabic}
              </Text>

              <Text variant="body" color="textMuted" style={styles.translation}>
                {item.translation}
              </Text>

              {virtue ? (
                <View style={[styles.virtue, { backgroundColor: theme.colors.surfaceContainer }]}>
                  <Ionicons name="sparkles-outline" size={13} color={theme.colors.accent} />
                  <Text variant="caption" color="textMuted" style={{ flex: 1, marginLeft: 6 }}>
                    {virtue}
                  </Text>
                </View>
              ) : null}

              <View style={styles.footer}>
                <Text variant="caption" color="textFaint">
                  {item.reference}
                </Text>
                <View
                  style={[
                    styles.counter,
                    { backgroundColor: isDone ? theme.colors.primary : theme.colors.surfaceContainerHigh },
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={18} color={theme.colors.onPrimary} />
                  ) : (
                    <Text variant="bodyMedium" color={theme.colors.primary}>
                      {remaining}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebrate: { marginTop: 8, marginBottom: 12, borderWidth: 1 },
  celebrateTop: { flexDirection: 'row', alignItems: 'center' },
  streakPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  celebrateActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  progress: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bar: { height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  item: { marginBottom: 12 },
  translation: { marginTop: 12, lineHeight: 22 },
  virtue: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  counter: { minWidth: 36, height: 36, borderRadius: 18, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
});
