import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';

import { ThemeProvider, useTheme } from '@/theme';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { PrayerProvider } from '@/features/prayer';
import { SalahProvider } from '@/features/salah';
import { SavedHadithProvider } from '@/features/hadith';
import { RemindersProvider, ReminderScheduler } from '@/features/reminders';
import { OnboardingProvider, OnboardingOverlay } from '@/features/onboarding';
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
      <OnboardingOverlay />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
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
                  <OnboardingProvider>
                    <ThemedApp />
                  </OnboardingProvider>
                </SavedHadithProvider>
              </RemindersProvider>
            </SalahProvider>
          </PrayerProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
