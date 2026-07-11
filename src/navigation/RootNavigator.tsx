import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import {
  HadithScreen,
  HadithDetailScreen,
  MosquesScreen,
  MoreScreen,
  NotificationsScreen,
  PrayerScreen,
  QiblaScreen,
  SalahScreen,
  ScanScreen,
  AthkarScreen,
  AthkarCategoryScreen,
  WitrScreen,
  TasbihScreen,
  NamesScreen,
} from '@/screens';
import { TABS, TabParamList, TabKey, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const SCREENS: Record<TabKey, React.ComponentType> = {
  Prayer: PrayerScreen,
  Salah: SalahScreen,
  Hadith: HadithScreen,
  Mosques: MosquesScreen,
  More: MoreScreen,
};

function AppTabs() {
  const theme = useTheme();
  const t = useT();
  // Respect the device's bottom safe-area (Android gesture/3-button nav bar,
  // iPhone home indicator) so the system bar never overlaps the tab bar.
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TABS.find((tab) => tab.name === route.name)!;
        return {
          headerShown: false,
          tabBarLabel: t(`tabs.${route.name.toLowerCase()}`),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textFaint,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 0.5,
            height: 60 + bottomInset,
            paddingTop: 8,
            paddingBottom: bottomInset,
          },
          tabBarLabelStyle: { fontFamily: theme.fonts.medium, fontSize: 11 },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? config.iconActive : config.icon} size={size} color={color} />
          ),
        };
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={SCREENS[t.name]} />
      ))}
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const theme = useTheme();

  const navTheme: NavTheme = {
    ...(theme.scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontFamily: theme.fonts.semibold, color: theme.colors.text },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Qibla"
          component={QiblaScreen}
          options={{ headerShown: true, title: 'Qibla', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="HadithDetail"
          component={HadithDetailScreen}
          options={{ headerShown: true, title: 'Hadith', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="HadithScan"
          component={ScanScreen}
          options={{ headerShown: true, title: 'Scan a hadith', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: true, title: 'Notifications', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Athkar"
          component={AthkarScreen}
          options={{ headerShown: true, title: 'Athkar', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="AthkarCategory"
          component={AthkarCategoryScreen}
          options={{ headerShown: true, title: 'Athkar', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Witr"
          component={WitrScreen}
          options={{ headerShown: true, title: 'Witr', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Tasbih"
          component={TasbihScreen}
          options={{ headerShown: true, title: 'Tasbih', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Names"
          component={NamesScreen}
          options={{ headerShown: true, title: '99 Names', headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
