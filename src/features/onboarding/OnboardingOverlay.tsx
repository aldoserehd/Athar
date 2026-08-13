import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Logo, Text } from '@/components';
import { ensurePermission, useReminders } from '@/features/reminders';
import { usePrayer } from '@/features/prayer';
import { LANGUAGES } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { useOnboarding } from './OnboardingContext';

type Step = 'welcome' | 'language' | 'location' | 'notifications' | 'focus';
const STEPS: Step[] = ['welcome', 'language', 'location', 'notifications', 'focus'];

export function OnboardingOverlay() {
  const theme = useTheme();
  const { t, language, isRTL, setLanguage } = useLanguage();
  const { place, locationStatus, loading: locationLoading, canAskAgain, refreshLocation } = usePrayer();
  const { settings, setAdhanEnabled, setLockEnabled } = useReminders();
  const { visible, complete, skipAll } = useOnboarding();
  const [index, setIndex] = useState(0);
  const [notificationState, setNotificationState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  if (!visible) return null;
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const locationReady = locationStatus === 'ready' && Boolean(place);

  async function enableNotifications() {
    setNotificationState('loading');
    const granted = await ensurePermission();
    if (granted) {
      setAdhanEnabled(true);
      setNotificationState('granted');
    } else {
      setNotificationState('denied');
    }
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Logo size={32} />
          <Pressable accessibilityRole="button" onPress={skipAll} hitSlop={10}>
            <Text variant="label" color="textMuted">{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {step === 'welcome' ? (
            <Setup icon="sparkles-outline" title={t('onboarding.welcomeTitle')} body={t('onboarding.welcomeBody')}>
              <View style={styles.welcomePoints}>
                <WelcomePoint icon="time-outline" text={t('onboarding.welcomeAccurate')} />
                <WelcomePoint icon="shield-checkmark-outline" text={t('onboarding.welcomePrivate')} />
                <WelcomePoint icon="leaf-outline" text={t('onboarding.welcomeSimple')} />
              </View>
            </Setup>
          ) : null}

          {step === 'language' ? (
            <Setup icon="language-outline" title={t('onboarding.languageTitle')} body={t('onboarding.languageBody')}>
              {LANGUAGES.map((item) => {
                const active = language === item.code;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    key={item.code}
                    onPress={() => void setLanguage(item.code)}
                    style={({ pressed }) => [
                      styles.option,
                      isRTL && Platform.OS === 'web' && styles.rowRTL,
                      {
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surface,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text variant="bodyMedium" style={styles.optionLabel}>{item.native}</Text>
                    <Text variant="caption" color="textFaint">{item.label}</Text>
                    {active ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </Setup>
          ) : null}

          {step === 'location' ? (
            <Setup icon="location-outline" title={t('onboarding.locationTitle')} body={t('onboarding.locationBody')}>
              <StatusCard
                icon={locationReady ? 'checkmark-circle' : 'navigate-circle-outline'}
                title={locationReady ? place!.city : t('onboarding.locationNeeded')}
                body={locationReady ? t('locationSetup.localTimezone') : t('onboarding.locationPrivacy')}
                positive={locationReady}
              />
              <Button
                fullWidth
                icon={locationReady ? 'refresh' : 'navigate'}
                label={locationLoading ? t('onboarding.checking') : locationReady ? t('onboarding.refreshLocation') : t('onboarding.allowLocation')}
                disabled={locationLoading}
                onPress={() => void refreshLocation()}
                style={styles.primaryAction}
              />
              {!locationReady && !canAskAgain ? (
                <Button
                  fullWidth
                  variant="secondary"
                  icon="settings-outline"
                  label={t('onboarding.openSettings')}
                  onPress={() => void Linking.openSettings()}
                  style={styles.secondaryAction}
                />
              ) : null}
              <Text variant="caption" color="textFaint" align="center" style={styles.laterHint}>
                {t('onboarding.manualLater')}
              </Text>
            </Setup>
          ) : null}

          {step === 'notifications' ? (
            <Setup icon="notifications-outline" title={t('onboarding.notifTitle')} body={t('onboarding.notifBody')}>
              <StatusCard
                icon={notificationState === 'granted' || settings.adhanEnabled ? 'checkmark-circle' : 'notifications-outline'}
                title={notificationState === 'granted' || settings.adhanEnabled ? t('onboarding.enabled') : t('onboarding.notificationsOptional')}
                body={t('onboarding.notificationsControl')}
                positive={notificationState === 'granted' || settings.adhanEnabled}
              />
              <Button
                fullWidth
                icon="notifications"
                label={notificationState === 'loading' ? t('onboarding.checking') : t('onboarding.enable')}
                disabled={notificationState === 'loading' || notificationState === 'granted'}
                onPress={() => void enableNotifications()}
                style={styles.primaryAction}
              />
              {notificationState === 'denied' ? (
                <View style={styles.permissionHelp}>
                  <Text variant="caption" color="error" align="center">{t('onboarding.notificationsDenied')}</Text>
                  <Button
                    fullWidth
                    variant="secondary"
                    icon="settings-outline"
                    label={t('onboarding.openSettings')}
                    onPress={() => void Linking.openSettings()}
                    style={styles.secondaryAction}
                  />
                </View>
              ) : null}
            </Setup>
          ) : null}

          {step === 'focus' ? (
            <Setup icon="shield-checkmark-outline" title={t('onboarding.focusTitle')} body={t('onboarding.focusBody')}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: settings.lock.enabled }}
                onPress={() => setLockEnabled(!settings.lock.enabled)}
                style={[
                  styles.focusCard,
                  isRTL && Platform.OS === 'web' && styles.rowRTL,
                  {
                    borderColor: settings.lock.enabled ? theme.colors.primary : theme.colors.border,
                    backgroundColor: settings.lock.enabled ? theme.colors.primaryContainer : theme.colors.surface,
                  },
                ]}
              >
                <View style={styles.focusText}>
                  <Text variant="bodyMedium">{t('onboarding.focusToggle')}</Text>
                  <Text variant="caption" color="textMuted" style={styles.focusCaption}>{t('onboarding.focusTruth')}</Text>
                </View>
                <View style={[styles.switchTrack, { backgroundColor: settings.lock.enabled ? theme.colors.primary : theme.colors.border }]}>
                  <View style={[styles.switchThumb, { transform: [{ translateX: settings.lock.enabled ? (isRTL ? -18 : 18) : 0 }] }]} />
                </View>
              </Pressable>
              <Text variant="caption" color="textFaint" align="center" style={styles.laterHint}>
                {t('onboarding.focusNativeNote')}
              </Text>
            </Setup>
          ) : null}
        </ScrollView>

        <View style={styles.dots}>
          {STEPS.map((item, dotIndex) => (
            <View
              key={item}
              style={[
                styles.dot,
                { backgroundColor: dotIndex === index ? theme.colors.primary : theme.colors.border, width: dotIndex === index ? 24 : 8 },
              ]}
            />
          ))}
        </View>

        <View style={[styles.actions, isRTL && Platform.OS === 'web' && styles.rowRTL]}>
          {index > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => setIndex((value) => value - 1)} hitSlop={8} style={styles.back}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={21} color={theme.colors.textMuted} />
            </Pressable>
          ) : <View style={styles.back} />}
          <Button
            label={isLast ? t('onboarding.start') : t('onboarding.next')}
            icon={isLast ? 'checkmark' : isRTL ? 'arrow-back' : 'arrow-forward'}
            fullWidth
            onPress={() => (isLast ? complete() : setIndex((value) => value + 1))}
            style={styles.next}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Setup({ icon, title, body, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.setup}>
      <View style={[styles.icon, { backgroundColor: theme.colors.primaryContainer }]}>
        <Ionicons name={icon} size={30} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="title" align="center" style={styles.title}>{title}</Text>
      <Text variant="body" color="textMuted" align="center" style={styles.description}>{body}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function StatusCard({ icon, title, body, positive }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; positive?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.statusCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name={icon} size={24} color={positive ? theme.colors.primary : theme.colors.textMuted} />
      <View style={styles.statusText}>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="caption" color="textMuted" style={styles.statusBody}>{body}</Text>
      </View>
    </View>
  );
}

function WelcomePoint({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  return (
    <View
      style={[
        styles.welcomePoint,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        isRTL && Platform.OS === 'web' && styles.rowRTL,
      ]}
    >
      <View style={[styles.welcomePointIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <Ionicons name={icon} size={18} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="bodyMedium" style={styles.welcomePointText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 200, elevation: 200 },
  safe: { flex: 1, paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  setup: { width: '100%', alignItems: 'center' },
  icon: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 18 },
  description: { marginTop: 8, maxWidth: 340 },
  content: { width: '100%', marginTop: 28 },
  rowRTL: { flexDirection: 'row-reverse' },
  welcomePoints: { gap: 10 },
  welcomePoint: { minHeight: 58, flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 },
  welcomePointIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  welcomePointText: { flex: 1, marginStart: 12 },
  option: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: 16, marginBottom: 10 },
  optionLabel: { flex: 1 },
  statusCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 },
  statusText: { flex: 1, marginStart: 14 },
  statusBody: { marginTop: 3 },
  primaryAction: { marginTop: 14 },
  secondaryAction: { marginTop: 10 },
  laterHint: { marginTop: 14, paddingHorizontal: 16 },
  permissionHelp: { marginTop: 12 },
  focusCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderWidth: 1, borderRadius: 18 },
  focusText: { flex: 1, paddingEnd: 16 },
  focusCaption: { marginTop: 5 },
  switchTrack: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 22 },
  back: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  next: { flex: 1 },
});
