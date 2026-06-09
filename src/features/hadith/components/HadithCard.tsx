import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { COLLECTIONS, collectionLabel, Hadith, referenceArabic } from '../types';
import { GradePill } from './GradePill';

export function HadithCard({ hadith, onPress }: { hadith: Hadith; onPress: () => void }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const collection = isAr
    ? COLLECTIONS.find((c) => c.key === hadith.collection)?.arabic ?? collectionLabel(hadith.collection)
    : collectionLabel(hadith.collection);
  const reference = isAr
    ? referenceArabic(hadith)
    : hadith.reference.replace(/^.*\b(\d+)$/, '#$1');
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ marginBottom: 12 }}>
      <Card>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.fonts.arabic,
            fontSize: 22,
            lineHeight: 38,
            color: theme.colors.text,
            textAlign: 'right',
          }}
        >
          {hadith.arabic}
        </Text>
        {!isAr ? (
          <Text variant="body" color="textMuted" numberOfLines={2} style={{ marginTop: 6, fontStyle: 'italic' }}>
            “{hadith.english}”
          </Text>
        ) : null}
        <View style={styles.meta}>
          <View style={styles.left}>
            <Text variant="caption" color="primary" style={{ fontFamily: theme.fonts.semibold }}>
              {collection}
            </Text>
            <Text variant="caption" color="textFaint">
              {' · '}
              {reference}
            </Text>
          </View>
          <GradePill grade={hadith.grade} arabic={isAr} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
});
