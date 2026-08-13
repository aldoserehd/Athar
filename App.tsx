import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';

import { ThemeProvider, useTheme } from '@/theme';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { PrayerProvider } from '@/features/prayer';
import { SalahProvider, SalahAutoMarker } from '@/features/salah';
import { SavedHadithProvider } from '@/features/hadith';
import { RemindersProvider, ReminderScheduler } from '@/features/reminders';
import { AthkarProgressProvider } from '@/features/athkar';
import { PrayerLockOverlay } from '@/features/lock';
import { OnboardingProvider, OnboardingOverlay, TourOverlay } from '@/features/onboarding';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Inner shell so the status bar and system background can react to the active
 * theme (it must live *inside* ThemeProvider to read the resolved scheme).
 */
function ThemedApp() {
  const theme = useTheme();

  // Keep the native window background in sync to avoid white flashes.
  React.useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
      <ReminderScheduler />
      <SalahAutoMarker />
      {/* Prayer-Lock gate sits below onboarding so onboarding always wins. */}
      <PrayerLockOverlay />
      <TourOverlay />
      <OnboardingOverlay />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
    Amiri_400Regular: require('@expo-google-fonts/amiri/Amiri_400Regular.ttf'),
    Amiri_700Bold: require('@expo-google-fonts/amiri/Amiri_700Bold.ttf'),
    IBMPlexSansArabic_400Regular: require('@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf'),
    IBMPlexSansArabic_500Medium: require('@expo-google-fonts/ibm-plex-sans-arabic/500Medium/IBMPlexSansArabic_500Medium.ttf'),
    IBMPlexSansArabic_600SemiBold: require('@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold/IBMPlexSansArabic_600SemiBold.ttf'),
    IBMPlexSansArabic_700Bold: require('@expo-google-fonts/ibm-plex-sans-arabic/700Bold/IBMPlexSansArabic_700Bold.ttf'),
  });

  const onReady = useCallback(() => {
    // Hook for splash-screen hide once we add expo-splash-screen.
  }, []);

  if (!fontsLoaded) {
    // Render nothing until fonts resolve; splash stays up.
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onReady}>
      <LanguageProvider>
        <ThemeProvider>
          <PrayerProvider>
            <SalahProvider>
              <RemindersProvider>
                <SavedHadithProvider>
                  <AthkarProgressProvider>
                    <OnboardingProvider>
                      <ThemedApp />
                    </OnboardingProvider>
                  </AthkarProgressProvider>
                </SavedHadithProvider>
              </RemindersProvider>
            </SalahProvider>
          </PrayerProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
