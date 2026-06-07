import type { Ionicons } from '@expo/vector-icons';

export type TabKey = 'Prayer' | 'Salah' | 'Hadith' | 'Mosques' | 'More';

export type TabParamList = Record<TabKey, undefined>;

/** Root stack: the tab bar plus full-screen pages pushed over it. */
export type RootStackParamList = {
  Tabs: undefined;
  Qibla: undefined;
  HadithDetail: { id: string };
  HadithScan: undefined;
  Notifications: undefined;
};

export type TabConfig = {
  name: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

export const TABS: TabConfig[] = [
  { name: 'Prayer', icon: 'time-outline', iconActive: 'time' },
  { name: 'Salah', icon: 'checkmark-done-circle-outline', iconActive: 'checkmark-done-circle' },
  { name: 'Hadith', icon: 'book-outline', iconActive: 'book' },
  { name: 'Mosques', icon: 'navigate-outline', iconActive: 'navigate' },
  { name: 'More', icon: 'ellipsis-horizontal-circle-outline', iconActive: 'ellipsis-horizontal-circle' },
];
