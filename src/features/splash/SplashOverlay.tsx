import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Logo, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { randomInspiration } from '@/features/inspiration';

/**
 * Branded launch splash shown briefly on every cold start: the Athar logo &
 * wordmark, the slogan, and a *random Quran verse* — then it fades to the app.
 * A dark teal gradient matching the app's hero surfaces. Cold-start only (React
 * state resets each launch), so it naturally shows once per open.
 */
export function SplashOverlay() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [gone, setGone] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(12)).current;

  // Pick one verse for this launch.
  const verse = useMemo(() => randomInspiration('ayah'), []);

  useEffect(() => {
    Animated.timing(rise, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }).start(() => setGone(true));
    }, 2500);
    return () => clearTimeout(timer);
  }, [opacity, rise]);

  if (gone) return null;

  return (
    <Animated.View style={[styles.fill, { opacity }]} pointerEvents="none">
      <LinearGradient
        colors={['#15697F', '#0E4353', '#062A33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.center}>
        <Animated.View style={{ alignItems: 'center', transform: [{ translateY: rise }] }}>
          <Logo size={96} />
          <Text style={{ fontFamily: theme.fonts.arabicBold, fontSize: 40, color: '#FFFFFF', marginTop: 18 }}>
            أثر
          </Text>
          <Text style={{ color: '#D4C5A4', fontSize: 13, letterSpacing: 3, marginTop: 4, fontFamily: theme.fonts.medium }}>
            ATHAR
          </Text>
          <Text align="center" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 12, maxWidth: 260 }}>
            {t('more.tagline')}
          </Text>
        </Animated.View>
      </SafeAreaView>

      {/* Random Quran verse near the bottom */}
      <SafeAreaView style={styles.verseWrap} edges={['bottom']}>
        <Text
          style={{ fontFamily: theme.fonts.arabic, fontSize: 20, lineHeight: 38, color: '#FFFFFF', textAlign: 'center' }}
        >
          {verse.arabic}
        </Text>
        {!isAr ? (
          <Text align="center" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 19, marginTop: 10 }}>
            “{verse.english}”
          </Text>
        ) : null}
        <Text align="center" style={{ color: '#D4C5A4', fontSize: 12, marginTop: 8 }}>
          {isAr ? verse.referenceAr : verse.reference}
        </Text>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 300, elevation: 300 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  verseWrap: { position: 'absolute', left: 32, right: 32, bottom: 24 },
});
