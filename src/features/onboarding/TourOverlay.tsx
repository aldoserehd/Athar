import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TABS } from '@/navigation/types';
import { useOnboarding } from './OnboardingContext';

/**
 * A lightweight coach-mark tour that runs right after the setup wizard. It dims
 * the screen and points a callout at each bottom-tab in turn, explaining what it
 * does — bilingual and skippable. Positions are computed from the tab layout
 * (5 evenly-spaced tabs) rather than measured, so it stays robust.
 */
export function TourOverlay() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const insets = useSafeAreaInsets();
  const { tourVisible, endTour } = useOnboarding();
  const [step, setStep] = useState(0);

  if (!tourVisible) return null;

  const { width, height } = Dimensions.get('window');
  const bottomInset = Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomInset;
  const count = TABS.length;
  const tabWidth = width / count;

  // In RTL the tab order is visually mirrored.
  const visualIndex = isAr ? count - 1 - step : step;
  const tabCenterX = tabWidth * (visualIndex + 0.5);

  const tab = TABS[step];
  const tabKey = tab.name.toLowerCase();
  const last = step === count - 1;

  // Callout sits above the tab bar; its pointer aligns to the tab centre.
  const calloutBottom = tabBarHeight + 22;
  const sideMargin = 20;
  const pointerLeft = Math.min(Math.max(tabCenterX - sideMargin - 9, 8), width - 2 * sideMargin - 26);

  return (
    <View style={styles.fill} pointerEvents="box-none">
      {/* Dim scrim (tap anywhere = next) */}
      <Pressable style={styles.scrim} onPress={() => (last ? endTour() : setStep((s) => s + 1))} />

      {/* Highlight ring over the active tab */}
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left: tabCenterX - 32,
            bottom: tabBarHeight - 44,
            borderColor: theme.colors.primary,
          },
        ]}
      />

      {/* Callout card */}
      <View
        style={[
          styles.callout,
          {
            bottom: calloutBottom,
            left: sideMargin,
            right: sideMargin,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.calloutHead}>
          <View style={[styles.iconChip, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name={tab.iconActive} size={18} color={theme.colors.onPrimaryContainer} />
          </View>
          <Text variant="bodyMedium" style={{ marginHorizontal: 10, flex: 1 }}>
            {t(`tabs.${tabKey}`)}
          </Text>
          <Text variant="caption" color="textFaint">
            {step + 1}/{count}
          </Text>
        </View>
        <Text variant="body" color="textMuted" style={{ marginTop: 8, lineHeight: 22 }}>
          {t(`tour.${tabKey}`)}
        </Text>

        <View style={styles.calloutActions}>
          <Pressable onPress={endTour} hitSlop={8}>
            <Text variant="label" color="textMuted">
              {t('tour.skip')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => (last ? endTour() : setStep((s) => s + 1))}
            style={[styles.nextBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text variant="label" style={{ color: theme.colors.onPrimary }}>
              {last ? t('tour.done') : t('tour.next')}
            </Text>
            <Ionicons name={last ? 'checkmark' : 'arrow-forward'} size={16} color={theme.colors.onPrimary} style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        {/* Downward pointer aligned to the tab */}
        <View style={[styles.pointer, { left: pointerLeft, borderTopColor: theme.colors.surface }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 190, elevation: 190 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
  },
  callout: { position: 'absolute', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  calloutHead: { flexDirection: 'row', alignItems: 'center' },
  iconChip: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  calloutActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
  pointer: {
    position: 'absolute',
    bottom: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
