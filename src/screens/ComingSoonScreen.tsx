import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';

type ComingSoonProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  phase: string;
  description: string;
};

/** Shared placeholder for features arriving in later phases. */
export function ComingSoonScreen({ title, subtitle, icon, phase, description }: ComingSoonProps) {
  const theme = useTheme();
  return (
    <Screen title={title} subtitle={subtitle}>
      <View style={styles.center}>
        <Card style={styles.card}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill },
            ]}
          >
            <Ionicons name={icon} size={36} color={theme.colors.primary} />
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill },
            ]}
          >
            <Text variant="caption" color="accent">
              {phase}
            </Text>
          </View>
          <Text variant="heading" align="center" style={{ marginTop: 12 }}>
            Coming soon
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{ marginTop: 8, maxWidth: 300 }}>
            {description}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  card: { alignItems: 'center', paddingVertical: 36 },
  iconWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, marginTop: 16 },
});
