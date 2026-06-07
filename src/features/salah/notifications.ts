import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { SalahKey } from './types';

export type ReminderSlot = { key: SalahKey; label: string; time: Date };

const ANDROID_CHANNEL = 'prayer-reminders';

// (Notification handler lives in features/reminders/scheduler.ts — the single
// source of truth now that reminders are managed there.)

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: 'Prayer reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

/**
 * Schedule a daily repeating reminder at each prayer's clock time. Prayer times
 * drift a few minutes across the year, so callers re-schedule when times change.
 */
export async function scheduleReminders(slots: ReminderSlot[]): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const s of slots) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `It's time for ${s.label} 🕌`,
          body: 'Tap when you have prayed, in shāʾ Allah.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: s.time.getHours(),
          minute: s.time.getMinutes(),
          channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
        },
      });
    }
  } catch {
    /* notifications best-effort (limited in Expo Go; reliable in a dev build) */
  }
}

export async function cancelReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}
