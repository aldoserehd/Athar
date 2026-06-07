import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Logo, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { useOnboarding } from './OnboardingContext';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  bodyKey: string;
  /** Highlighted (the scan feature gets extra emphasis). */
  feature?: boolean;
};

const SLIDES: Slide[] = [
  { icon: 'moon', titleKey: 'onboarding.welcomeTitle', bodyKey: 'onboarding.welcomeBody' },
  { icon: 'time', titleKey: 'onboarding.prayerTitle', bodyKey: 'onboarding.prayerBody' },
  { icon: 'checkmark-done-circle', titleKey: 'onboarding.salahTitle', bodyKey: 'onboarding.salahBody' },
  { icon: 'book', titleKey: 'onboarding.hadithTitle', bodyKey: 'onboarding.hadithBody' },
  { icon: 'scan', titleKey: 'onboarding.scanTitle', bodyKey: 'onboarding.scanBody', feature: true },
  { icon: 'navigate', titleKey: 'onboarding.mosquesTitle', bodyKey: 'onboarding.mosquesBody' },
];

export function OnboardingOverlay() {
  const theme = useTheme();
  const t = useT();
  const { visible, complete } = useOnboarding();
  const [index, setIndex] = useState(0);

  if (!visible) return null;
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe}>
        {/* Top bar: logo + skip */}
        <View style={styles.top}>
          <Logo size={30} />
          <Pressable onPress={complete} hitSlop={8}>
            <Text variant="label" color="textMuted">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        </View>

        {/* Slide */}
        <View style={styles.body}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: slide.feature ? theme.colors.primary : theme.colors.primaryContainer,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Ionicons
              name={slide.icon}
              size={52}
              color={slide.feature ? theme.colors.onPrimary : theme.colors.onPrimaryContainer}
            />
          </View>
          {slide.feature ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
              <Text variant="caption" color="accent">
                ★ {t('tabs.hadith')}
              </Text>
            </View>
          ) : null}
          <Text variant="title" align="center" style={{ marginTop: 24 }}>
            {t(slide.titleKey)}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{ marginTop: 12, maxWidth: 320 }}>
            {t(slide.bodyKey)}
          </Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? theme.colors.primary : theme.colors.border,
                  width: i === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label={last ? t('onboarding.start') : t('onboarding.next')}
            icon={last ? 'checkmark' : 'arrow-forward'}
            fullWidth
            onPress={() => (last ? complete() : setIndex((i) => i + 1))}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 200, elevation: 200 },
  safe: { flex: 1, paddingHorizontal: 28 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginTop: 16 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 },
  dot: { height: 8, borderRadius: 4 },
  actions: { paddingBottom: 24 },
});
