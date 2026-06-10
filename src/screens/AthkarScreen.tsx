import React, { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ATHKAR_CATEGORIES } from '@/features/athkar';
import type { RootStackParamList } from '@/navigation/types';

export function AthkarScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('athkar.title') });
  }, [navigation, t]);

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 32 }}>
      <Text variant="body" color="textMuted" style={{ marginTop: 4, marginBottom: 16 }}>
        {t('athkar.intro')}
      </Text>

      {ATHKAR_CATEGORIES.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() => navigation.navigate('AthkarCategory', { id: cat.id })}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Card style={styles.row}>
            <View style={[styles.icon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
              <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text variant="bodyMedium">{isAr ? cat.titleAr : cat.titleEn}</Text>
              <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                {isAr ? cat.subtitleAr : cat.subtitleEn} · {t('athkar.count', { n: cat.items.length })}
              </Text>
            </View>
            <Ionicons
              name={isAr ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.colors.textFaint}
            />
          </Card>
        </Pressable>
      ))}

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
          <Ionicons
            name={isAr ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={theme.colors.textFaint}
          />
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { letterSpacing: 0.5, marginTop: 14, marginBottom: 10 },
});
