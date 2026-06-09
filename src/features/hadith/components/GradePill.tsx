import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { useTheme } from '@/theme';
import { Grade, GRADE_LABEL, GRADE_LABEL_AR } from '../types';

/** Small coloured chip showing the authentication grade. */
export function GradePill({ grade, arabic }: { grade: Grade; arabic?: boolean }) {
  const theme = useTheme();
  const color =
    grade === 'sahih'
      ? theme.colors.success
      : grade === 'hasan'
      ? theme.colors.accent
      : grade === 'daif'
      ? theme.colors.danger
      : theme.colors.textFaint;
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" style={{ color }}>
        {arabic ? GRADE_LABEL_AR[grade] : GRADE_LABEL[grade]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
});
