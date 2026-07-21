import React, { useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Card, GradientHero, HERO_TEXT, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { DIVINE_NAMES } from '@/features/names';

export function NamesScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('names.title') });
  }, [navigation, t]);

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 32 }}>
      {/* Intro — premium hero */}
      <GradientHero glyph="sparkles" style={{ marginTop: 8 }}>
        <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 }}>
          <Text
            align="center"
            style={{
              fontFamily: theme.fonts.arabicBold,
              fontSize: 28,
              lineHeight: 46,
              includeFontPadding: false,
              color: '#FFFFFF',
            }}
          >
            أَسْمَاءُ اللَّهِ الْحُسْنَى
          </Text>
          <Text align="center" style={{ color: HERO_TEXT.muted, fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 300 }}>
            {t('names.hadith')}
          </Text>
        </View>
      </GradientHero>

      {DIVINE_NAMES.map((name) => (
        <Card key={name.n} style={styles.row}>
          <View style={[styles.num, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Text variant="caption" color="primary">
              {name.n}
            </Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 14 }}>
            <Text variant="caption" color="textFaint">
              {name.translit}
            </Text>
            <Text variant="body" color="textMuted" style={{ marginTop: 2 }}>
              {isAr ? name.arMeaning : name.en}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: theme.fonts.arabic,
              fontSize: 26,
              lineHeight: 40,
              includeFontPadding: false,
              color: theme.colors.text,
            }}
          >
            {name.arabic}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
