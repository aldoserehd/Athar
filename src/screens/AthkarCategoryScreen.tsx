import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { athkarCategory, type Dhikr } from '@/features/athkar';
import type { RootStackParamList } from '@/navigation/types';

type CategoryRoute = RouteProp<RootStackParamList, 'AthkarCategory'>;

export function AthkarCategoryScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation();
  const route = useRoute<CategoryRoute>();
  const category = athkarCategory(route.params.id);

  // How many times each item has been recited so far (keyed by dhikr id).
  const [done, setDone] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    navigation.setOptions({ title: category ? (isAr ? category.titleAr : category.titleEn) : t('athkar.title') });
  }, [navigation, category, isAr, t]);

  const completed = useMemo(
    () => (category ? category.items.filter((it) => (done[it.id] ?? 0) >= it.repeat).length : 0),
    [category, done]
  );

  if (!category) {
    return (
      <Screen edges={['left', 'right']}>
        <Text variant="body" color="textMuted" style={{ marginTop: 24 }}>
          {t('athkar.notFound')}
        </Text>
      </Screen>
    );
  }

  const allDone = completed === category.items.length;

  const tap = (item: Dhikr) => {
    setDone((prev) => {
      const current = prev[item.id] ?? 0;
      if (current >= item.repeat) return prev; // already complete
      const next = current + 1;
      if (next >= item.repeat) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return { ...prev, [item.id]: next };
    });
  };

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 40 }}>
      {/* Progress */}
      <Card style={styles.progress}>
        <Text variant="bodyMedium" color={allDone ? 'primary' : 'text'}>
          {allDone ? t('athkar.allComplete') : t('athkar.progress', { done: completed, total: category.items.length })}
        </Text>
        <Pressable onPress={() => setDone({})} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        const count = done[item.id] ?? 0;
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
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  item: { marginBottom: 12 },
  translation: { marginTop: 12, lineHeight: 22 },
  virtue: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  counter: { minWidth: 36, height: 36, borderRadius: 18, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
});
