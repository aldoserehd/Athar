import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Card, Logo, Screen, Text } from '@/components';
import { useOnboarding } from '@/features/onboarding';
import { usePrayer } from '@/features/prayer';
import { LANGUAGES } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme, useThemeControls, type ThemePreference } from '@/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '—';

export function MoreScreen() {
  const { preference, setPreference } = useThemeControls();
  const { t, language, isRTL, setLanguage } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { open: openTutorial } = useOnboarding();
  const { place } = usePrayer();
  const appearanceLabel = preference === 'system'
    ? t('more.system')
    : preference === 'light'
      ? t('more.light')
      : t('more.dark');
  const currentLanguage = LANGUAGES.find((item) => item.code === language);

  return (
    <Screen scroll title={t('more.title')}>
      <SectionLabel>{t('more.preferences')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow icon="location-outline" label={t('more.prayerLocation')} value={place?.city ?? t('more.notSet')} onPress={() => navigation.navigate('LocationSetup')} isRTL={isRTL} />
        <Divider />
        <LinkRow icon="notifications-outline" label={t('more.remindersRow')} onPress={() => navigation.navigate('Notifications')} isRTL={isRTL} />
        <Divider />
        <ChoiceRow
          icon="color-palette-outline"
          label={t('more.appearance')}
          value={appearanceLabel}
          options={[
            { key: 'system', label: t('more.system'), icon: 'phone-portrait-outline' },
            { key: 'light', label: t('more.light'), icon: 'sunny-outline' },
            { key: 'dark', label: t('more.dark'), icon: 'moon-outline' },
          ]}
          selected={preference}
          onSelect={(key) => setPreference(key as ThemePreference)}
        />
        <Divider />
        <ChoiceRow
          icon="language-outline"
          label={t('more.language')}
          value={currentLanguage?.native}
          options={LANGUAGES.map((item) => ({ key: item.code, label: item.native }))}
          selected={language}
          onSelect={(key) => setLanguage(key as typeof language)}
        />
      </Card>

      <SectionLabel>{t('more.help')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow icon="help-circle-outline" label={t('more.howItWorks')} onPress={openTutorial} isRTL={isRTL} />
        <Divider />
        <LinkRow icon="mail-outline" label={t('more.feedback')} onPress={() => void Linking.openURL('mailto:salam@try-athar.com')} isRTL={isRTL} />
      </Card>

      <SectionLabel>{t('more.about')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow icon="lock-closed-outline" label={t('more.privacy')} onPress={() => void Linking.openURL('https://try-athar.com/privacy')} isRTL={isRTL} />
        <Divider />
        <LinkRow icon="document-text-outline" label={t('more.terms')} onPress={() => void Linking.openURL('https://try-athar.com/terms')} isRTL={isRTL} />
        <Divider />
        <StaticRow icon="information-circle-outline" label={t('more.version')} value={APP_VERSION} />
      </Card>

      <View style={styles.footer}>
        <Logo size={48} />
        <Text variant="caption" color="textFaint" style={styles.footerText}>{t('more.tagline')}</Text>
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text variant="label" color="textMuted" style={styles.sectionLabel}>{children}</Text>;
}

type ChoiceOption = { key: string; label: string; icon?: keyof typeof Ionicons.glyphMap };

function ChoiceRow({ label, icon, value, options, selected, onSelect }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  options: ChoiceOption[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((current) => !current)} style={({ pressed }) => [styles.row, isRTL && Platform.OS === 'web' && styles.rowRTL, { opacity: pressed ? 0.65 : 1 }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.rowLabel}>{label}</Text>
        {!open ? <Text variant="caption" color="textFaint" numberOfLines={1} style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textFaint} />
      </Pressable>
      {open ? (
        <View style={[styles.options, { borderTopColor: theme.colors.border }]}>
          {options.map((option) => (
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected === option.key }} key={option.key} onPress={() => onSelect(option.key)} style={({ pressed }) => [styles.option, isRTL && Platform.OS === 'web' && styles.rowRTL, { opacity: pressed ? 0.65 : 1 }]}>
              {option.icon ? <Ionicons name={option.icon} size={18} color={theme.colors.textMuted} /> : <View style={styles.optionIcon} />}
              <Text variant="body" style={styles.optionLabel}>{option.label}</Text>
              {selected === option.key ? <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} /> : <View style={styles.checkSpace} />}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LinkRow({ label, icon, value, onPress, isRTL }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  onPress: () => void;
  isRTL: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, isRTL && Platform.OS === 'web' && styles.rowRTL, { opacity: pressed ? 0.65 : 1 }]}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.rowLabel}>{label}</Text>
      {value ? <Text variant="caption" color="textFaint" numberOfLines={1} style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.colors.textFaint} />
    </Pressable>
  );
}

function StaticRow({ label, icon, value }: { label: string; icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  return (
    <View style={[styles.row, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.rowLabel}>{label}</Text>
      <Text variant="caption" color="textFaint">{value}</Text>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />;
}

const styles = StyleSheet.create({
  sectionLabel: { marginTop: 8, marginBottom: 10 },
  group: { marginBottom: 24, overflow: 'hidden' },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  rowLabel: { flex: 1, marginHorizontal: 14 },
  rowValue: { maxWidth: '38%', marginEnd: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginStart: 50 },
  options: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  option: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  optionIcon: { width: 18 },
  optionLabel: { flex: 1, marginHorizontal: 12 },
  checkSpace: { width: 20 },
  footer: { alignItems: 'center', marginTop: 8, paddingBottom: 8 },
  footerText: { marginTop: 10 },
});
