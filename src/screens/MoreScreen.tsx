import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Logo, Screen, Text } from '@/components';
import { useTheme, useThemeControls } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LANGUAGES } from '@/i18n';
import { useOnboarding } from '@/features/onboarding';
import type { RootStackParamList } from '@/navigation/types';

const APP_VERSION = '0.1.0';

export function MoreScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeControls();
  const { t, language, setLanguage } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { open: openTutorial } = useOnboarding();

  return (
    <Screen scroll title={t('more.title')}>
      {/* Reminders */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('more.reminders')}
      </Text>
      <Card padded={false} style={styles.group}>
        <LinkRow
          label={t('more.remindersRow')}
          icon="notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <Divider />
        <LinkRow label={t('more.howItWorks')} icon="help-circle-outline" onPress={openTutorial} />
      </Card>

      {/* Appearance */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('more.appearance').toUpperCase()}
      </Text>
      <Card padded={false} style={styles.group}>
        <ThemeOption label={t('more.system')} icon="phone-portrait-outline" active={preference === 'system'} onPress={() => setPreference('system')} />
        <Divider />
        <ThemeOption label={t('more.light')} icon="sunny-outline" active={preference === 'light'} onPress={() => setPreference('light')} />
        <Divider />
        <ThemeOption label={t('more.dark')} icon="moon-outline" active={preference === 'dark'} onPress={() => setPreference('dark')} />
      </Card>

      {/* Language */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('more.language').toUpperCase()}
      </Text>
      <Card padded={false} style={styles.group}>
        {LANGUAGES.map((lang, i) => (
          <View key={lang.code}>
            {i > 0 ? <Divider /> : null}
            <Row onPress={() => setLanguage(lang.code)}>
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {lang.native}
                {lang.label !== lang.native ? (
                  <Text variant="caption" color="textFaint">
                    {'   '}
                    {lang.label}
                  </Text>
                ) : null}
              </Text>
              {language === lang.code ? (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
              ) : (
                <View style={{ width: 22 }} />
              )}
            </Row>
          </View>
        ))}
      </Card>

      {/* About / legal */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('more.about').toUpperCase()}
      </Text>
      <Card padded={false} style={styles.group}>
        <LinkRow label={t('more.privacy')} icon="lock-closed-outline" onPress={() => Linking.openURL('https://athar.app/privacy')} />
        <Divider />
        <LinkRow label={t('more.terms')} icon="document-text-outline" onPress={() => Linking.openURL('https://athar.app/terms')} />
        <Divider />
        <LinkRow label={t('more.feedback')} icon="mail-outline" onPress={() => Linking.openURL('mailto:salam@athar.app')} />
      </Card>

      <View style={styles.footer}>
        <Logo size={52} />
        <Text variant="caption" color="textFaint" style={{ marginTop: 10 }}>
          Athar · أثر · v{APP_VERSION}
        </Text>
        <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
          {t('more.tagline')}
        </Text>
      </View>
    </Screen>
  );
}

function ThemeOption({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Row onPress={onPress}>
      <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
      <Text variant="bodyMedium" style={styles.rowLabel}>
        {label}
      </Text>
      {active ? (
        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
      ) : (
        <View style={{ width: 22 }} />
      )}
    </Row>
  );
}

function LinkRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Row onPress={onPress}>
      <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
      <Text variant="bodyMedium" style={styles.rowLabel}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
    </Row>
  );
}

function Row({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.rowInner, { opacity: pressed ? 0.6 : 1 }]}>
      {children}
    </Pressable>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />;
}

const styles = StyleSheet.create({
  sectionLabel: { letterSpacing: 0.5, marginTop: 8, marginBottom: 10 },
  group: { marginBottom: 24, overflow: 'hidden' },
  rowInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  rowLabel: { flex: 1, marginLeft: 14 },
  dividerLine: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
  footer: { alignItems: 'center', marginTop: 16 },
});
