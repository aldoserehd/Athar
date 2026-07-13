import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Logo, Text } from '@/components';
import { useTheme, useThemeControls, ThemePreference } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LANGUAGES } from '@/i18n';
import { ensurePermission, useReminders } from '@/features/reminders';
import { useOnboarding } from './OnboardingContext';

type Step =
  | { kind: 'welcome' }
  | { kind: 'language' }
  | { kind: 'theme' }
  | { kind: 'notifications' }
  | { kind: 'feature'; icon: keyof typeof Ionicons.glyphMap; titleKey: string; bodyKey: string; feature?: boolean };

const STEPS: Step[] = [
  { kind: 'welcome' },
  { kind: 'language' },
  { kind: 'theme' },
  { kind: 'notifications' },
  { kind: 'feature', icon: 'time', titleKey: 'onboarding.prayerTitle', bodyKey: 'onboarding.prayerBody' },
  { kind: 'feature', icon: 'compass', titleKey: 'onboarding.qiblaTitle', bodyKey: 'onboarding.qiblaBody' },
  { kind: 'feature', icon: 'checkmark-done-circle', titleKey: 'onboarding.salahTitle', bodyKey: 'onboarding.salahBody' },
  { kind: 'feature', icon: 'book', titleKey: 'onboarding.athkarTitle2', bodyKey: 'onboarding.athkarBody2' },
  { kind: 'feature', icon: 'navigate', titleKey: 'onboarding.mosquesTitle', bodyKey: 'onboarding.mosquesBody' },
];

const THEME_OPTIONS: { pref: ThemePreference; icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
  { pref: 'system', icon: 'phone-portrait-outline', labelKey: 'more.system' },
  { pref: 'light', icon: 'sunny-outline', labelKey: 'more.light' },
  { pref: 'dark', icon: 'moon-outline', labelKey: 'more.dark' },
];

export function OnboardingOverlay() {
  const theme = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { preference, setPreference } = useThemeControls();
  const { setAdhanEnabled } = useReminders();
  const { visible, complete } = useOnboarding();
  const [index, setIndex] = useState(0);
  const [notifsOn, setNotifsOn] = useState(false);

  if (!visible) return null;
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  async function enableNotifs() {
    const ok = await ensurePermission();
    if (ok) {
      setAdhanEnabled(true);
      setNotifsOn(true);
    }
  }

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

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {step.kind === 'welcome' ? (
            <Centered
              icon="moon"
              title={t('onboarding.welcomeTitle')}
              body={t('onboarding.welcomeBody')}
            />
          ) : null}

          {step.kind === 'language' ? (
            <View style={styles.setup}>
              <StepHeader icon="language-outline" title={t('onboarding.languageTitle')} body={t('onboarding.languageBody')} />
              {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => setLanguage(lang.code)}
                    style={[
                      styles.optionRow,
                      { borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surface },
                    ]}
                  >
                    <Text variant="bodyMedium" style={{ flex: 1, color: active ? theme.colors.onPrimaryContainer : theme.colors.text }}>
                      {lang.native}
                      {lang.label !== lang.native ? `  ·  ${lang.label}` : ''}
                    </Text>
                    {active ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {step.kind === 'theme' ? (
            <View style={styles.setup}>
              <StepHeader icon="color-palette-outline" title={t('onboarding.themeTitle')} body={t('onboarding.themeBody')} />
              <View style={styles.themeRow}>
                {THEME_OPTIONS.map((opt) => {
                  const active = preference === opt.pref;
                  return (
                    <Pressable
                      key={opt.pref}
                      onPress={() => setPreference(opt.pref)}
                      style={[
                        styles.themeCard,
                        { borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surface },
                      ]}
                    >
                      <Ionicons name={opt.icon} size={26} color={active ? theme.colors.onPrimaryContainer : theme.colors.textMuted} />
                      <Text variant="caption" style={{ marginTop: 8, color: active ? theme.colors.onPrimaryContainer : theme.colors.textMuted }}>
                        {t(opt.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {step.kind === 'notifications' ? (
            <View style={styles.setup}>
              <Centered
                icon="notifications"
                title={t('onboarding.notifTitle')}
                body={t('onboarding.notifBody')}
              />
              <Pressable
                onPress={enableNotifs}
                disabled={notifsOn}
                style={[
                  styles.enableBtn,
                  { backgroundColor: notifsOn ? theme.colors.primaryContainer : theme.colors.primary },
                ]}
              >
                <Ionicons
                  name={notifsOn ? 'checkmark-circle' : 'notifications'}
                  size={20}
                  color={notifsOn ? theme.colors.onPrimaryContainer : theme.colors.onPrimary}
                />
                <Text variant="bodyMedium" style={{ marginLeft: 10, color: notifsOn ? theme.colors.onPrimaryContainer : theme.colors.onPrimary }}>
                  {notifsOn ? t('onboarding.enabled') : t('onboarding.enable')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {step.kind === 'feature' ? (
            <Centered icon={step.icon} title={t(step.titleKey)} body={t(step.bodyKey)} feature={step.feature} />
          ) : null}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? theme.colors.primary : theme.colors.border, width: i === index ? 22 : 8 },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {index > 0 ? (
            <Pressable onPress={() => setIndex((i) => i - 1)} hitSlop={8} style={styles.back}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.textMuted} />
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
          <View style={{ flex: 1 }}>
            <Button
              label={last ? t('onboarding.start') : t('onboarding.next')}
              icon={last ? 'checkmark' : 'arrow-forward'}
              fullWidth
              onPress={() => (last ? complete() : setIndex((i) => i + 1))}
            />
          </View>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function StepHeader({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <View style={[styles.iconSm, { backgroundColor: theme.colors.primaryContainer }]}>
        <Ionicons name={icon} size={26} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="title" align="center" style={{ marginTop: 14 }}>
        {title}
      </Text>
      <Text variant="body" color="textMuted" align="center" style={{ marginTop: 8, maxWidth: 320 }}>
        {body}
      </Text>
    </View>
  );
}

function Centered({
  icon,
  title,
  body,
  feature,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  feature?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 320 }}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: feature ? theme.colors.primary : theme.colors.primaryContainer, borderRadius: theme.radius.pill },
        ]}
      >
        <Ionicons name={icon} size={52} color={feature ? theme.colors.onPrimary : theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="title" align="center" style={{ marginTop: 24 }}>
        {title}
      </Text>
      <Text variant="body" color="textMuted" align="center" style={{ marginTop: 12, maxWidth: 320 }}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 200, elevation: 200 },
  safe: { flex: 1, paddingHorizontal: 28 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 12 },
  setup: { width: '100%' },
  iconWrap: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  iconSm: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 14, marginBottom: 10 },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeCard: { flex: 1, alignItems: 'center', paddingVertical: 20, borderWidth: 1, borderRadius: 16 },
  enableBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, marginTop: 20 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 24 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
