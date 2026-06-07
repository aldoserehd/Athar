import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { ComputedTimes } from '@/features/prayer';
import { SalahKey } from '@/features/salah';
import { randomAthkar } from './athkar';
import { reciterName } from './reciters';

export type ReminderSettings = {
  adhanEnabled: boolean;
  prayers: Record<SalahKey, boolean>;
  reciterId: string;
  athkarEnabled: boolean;
  athkarHour: number;
  athkarMinute: number;
};

const ANDROID_CHANNEL = 'athar-reminders';

/** Localized text for the scheduled notifications (built by the caller via t). */
export type ReminderMessages = {
  prayerName: (key: SalahKey) => string;
  adhanTitle: (name: string) => string;
  adhanBody: (reciter: string) => string;
  athkarTitle: string;
};

Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    // Adhān: don't play the short alert sound in-foreground — we play the full
    // adhān in-app instead (see ReminderScheduler). Locked/background still uses
    // the bundled 30s clip via the OS.
    const isAdhan = n.request.content.data?.type === 'adhan';
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isAdhan,
      shouldSetBadge: false,
    };
  },
});

export async function ensurePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: 'Athar reminders',
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

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}

/**
 * Rebuild all scheduled notifications from the current settings + prayer times.
 * Adhān prayers repeat daily at their clock time; athkār is scheduled as a week
 * of one-off notifications (each a different random dhikr) and refreshed on app
 * open so it varies day to day.
 */
export async function applyReminders(
  settings: ReminderSettings,
  times: ComputedTimes | null,
  messages: ReminderMessages
): Promise<void> {
  await cancelAll();
  if (!settings.adhanEnabled && !settings.athkarEnabled) return;

  const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL : undefined;

  // Adhān — daily repeating per enabled prayer, with a 30s adhān clip as the
  // alert sound (plays on the lock screen). On Android the sound lives on a
  // per-reciter channel; on iOS it's referenced per-notification.
  if (settings.adhanEnabled && times) {
    const soundFile = `${settings.reciterId}_30.wav`;
    let adhanChannel = channelId;
    if (Platform.OS === 'android') {
      adhanChannel = `adhan-${settings.reciterId}`;
      await Notifications.setNotificationChannelAsync(adhanChannel, {
        name: `Adhān — ${reciterName(settings.reciterId)}`,
        importance: Notifications.AndroidImportance.HIGH,
        sound: soundFile,
      });
    }
    for (const slot of times.slots) {
      if (!slot.isPrayer) continue;
      const key = slot.name as SalahKey;
      if (!settings.prayers[key]) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${messages.adhanTitle(messages.prayerName(key))} 🕌`,
          body: messages.adhanBody(reciterName(settings.reciterId)),
          sound: soundFile,
          data: { type: 'adhan' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.time.getHours(),
          minute: slot.time.getMinutes(),
          channelId: adhanChannel,
        },
      });
    }
  }

  // Athkār — next 7 days, one-off, random each day.
  if (settings.athkarEnabled) {
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const when = new Date(now);
      when.setDate(now.getDate() + i);
      when.setHours(settings.athkarHour, settings.athkarMinute, 0, 0);
      if (when.getTime() <= now.getTime()) continue; // skip past times today
      const dhikr = randomAthkar();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${messages.athkarTitle} ✨`,
          body: `${dhikr.arabic}\n${dhikr.translation}`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId,
        },
      });
    }
  }
}
