import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components';
import { useTheme } from '@/theme';
import { collectionLabel, Hadith } from '../types';
import { GradePill } from './GradePill';

export function HadithCard({ hadith, onPress }: { hadith: Hadith; onPress: () => void }) {
  const theme = useTheme();
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
        <Text variant="body" color="textMuted" numberOfLines={2} style={{ marginTop: 6, fontStyle: 'italic' }}>
          “{hadith.english}”
        </Text>
        <View style={styles.meta}>
          <View style={styles.left}>
            <Text variant="caption" color="primary" style={{ fontFamily: theme.fonts.semibold }}>
              {collectionLabel(hadith.collection)}
            </Text>
            <Text variant="caption" color="textFaint">
              {' · '}
              {hadith.reference.replace(/^.*\b(\d+)$/, '#$1')}
            </Text>
          </View>
          <GradePill grade={hadith.grade} />
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
