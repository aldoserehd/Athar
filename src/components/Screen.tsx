import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Text } from './Text';

type ScreenProps = {
  children: React.ReactNode;
  /** Optional large title rendered at the top of the screen. */
  title?: string;
  subtitle?: string;
  /** Right-aligned element in the header row (e.g. an icon button). */
  headerRight?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: Edge[];
};

/**
 * Standard screen container: applies the themed background, safe-area insets,
 * a consistent horizontal gutter, and an optional header.
 */
export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  scroll = false,
  contentStyle,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const theme = useTheme();

  const header = title ? (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="label" color="textMuted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {headerRight}
    </View>
  ) : null;

  const body = (
    <>
      {header}
      {children}
    </>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            { flex: 1, paddingHorizontal: theme.spacing.xl },
            contentStyle,
          ]}
        >
          {body}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  headerText: { flex: 1 },
});
