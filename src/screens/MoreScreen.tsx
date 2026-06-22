import React, { useState } from 'react';
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

  const appearanceLabel =
    preference === 'system' ? t('more.system') : preference === 'light' ? t('more.light') : t('more.dark');
  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <Screen scroll title={t('more.title')}>
      {/* Worship */}
      <SectionLabel>{t('more.worship')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow label={t('athkar.title')} icon="book-outline" onPress={() => navigation.navigate('Athkar')} />
        <Divider />
        <LinkRow label={t('tasbih.title')} icon="ellipse-outline" onPress={() => navigation.navigate('Tasbih')} />
        <Divider />
        <LinkRow label={t('names.title')} icon="sparkles-outline" onPress={() => navigation.navigate('Names')} />
        <Divider />
        <LinkRow label={t('witr.title')} icon="star-outline" onPress={() => navigation.navigate('Witr')} />
      </Card>

      {/* Settings */}
      <SectionLabel>{t('more.settings')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow
          label={t('more.remindersRow')}
          icon="notifications-outline"
          onPress={() => navigation.navigate('Notifications')}
        />
        <Divider />
        <Accordion label={t('more.appearance')} icon="color-palette-outline" value={appearanceLabel}>
          <OptionRow label={t('more.system')} icon="phone-portrait-outline" active={preference === 'system'} onPress={() => setPreference('system')} />
          <OptionRow label={t('more.light')} icon="sunny-outline" active={preference === 'light'} onPress={() => setPreference('light')} />
          <OptionRow label={t('more.dark')} icon="moon-outline" active={preference === 'dark'} onPress={() => setPreference('dark')} />
        </Accordion>
        <Divider />
        <Accordion label={t('more.language')} icon="language-outline" value={currentLang?.native}>
          {LANGUAGES.map((lang) => (
            <OptionRow
              key={lang.code}
              label={lang.native + (lang.label !== lang.native ? `  ·  ${lang.label}` : '')}
              active={language === lang.code}
              onPress={() => setLanguage(lang.code)}
            />
          ))}
        </Accordion>
        <Divider />
        <LinkRow label={t('more.howItWorks')} icon="help-circle-outline" onPress={openTutorial} />
      </Card>

      {/* About / legal */}
      <SectionLabel>{t('more.about')}</SectionLabel>
      <Card padded={false} style={styles.group}>
        <LinkRow label={t('more.privacy')} icon="lock-closed-outline" onPress={() => Linking.openURL('https://try-athar.com/privacy')} />
        <Divider />
        <LinkRow label={t('more.terms')} icon="document-text-outline" onPress={() => Linking.openURL('https://try-athar.com/terms')} />
        <Divider />
        <LinkRow label={t('more.feedback')} icon="mail-outline" onPress={() => Linking.openURL('mailto:salam@try-athar.com')} />
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label" color="textMuted" style={styles.sectionLabel}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

/** A collapsible group: tap the header to reveal its options. */
function Accordion({
  label,
  icon,
  value,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Row onPress={() => setOpen((v) => !v)}>
        <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
        <Text variant="bodyMedium" style={styles.rowLabel}>
          {label}
        </Text>
        {!open && value ? (
          <Text variant="caption" color="textFaint" style={{ marginRight: 8 }}>
            {value}
          </Text>
        ) : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textFaint} />
      </Row>
      {open ? <View style={[styles.accordionBody, { borderTopColor: theme.colors.border }]}>{children}</View> : null}
    </View>
  );
}

function OptionRow({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.optionRow, { opacity: pressed ? 0.6 : 1 }]}>
      {icon ? <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={{ width: 26 }} /> : <View style={{ width: 26 }} />}
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      {active ? (
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
      ) : (
        <View style={{ width: 20 }} />
      )}
    </Pressable>
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
  accordionBody: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  footer: { alignItems: 'center', marginTop: 16 },
});
