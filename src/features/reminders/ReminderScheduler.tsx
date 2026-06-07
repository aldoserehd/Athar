import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { usePrayer } from '@/features/prayer';
import { useLanguage } from '@/i18n/LanguageProvider';
import { SalahKey } from '@/features/salah';
import { useReminders } from './RemindersContext';
import { applyReminders, ReminderMessages } from './scheduler';
import { playAdhanOnce } from './adhanPlayer';

/**
 * Headless component (mount once near the app root). Rebuilds the scheduled
 * notifications whenever settings, prayer times, or the chosen language change,
 * and plays the full adhān in-app when a prayer notification fires while the app
 * is open.
 */
export function ReminderScheduler() {
  const { settings, hydrated } = useReminders();
  const { times, ready } = usePrayer();
  const { t, language } = useLanguage();
  const sig = useRef('');
  const reciterRef = useRef(settings.reciterId);
  reciterRef.current = settings.reciterId;

  useEffect(() => {
    if (!hydrated || !ready) return;
    const messages: ReminderMessages = {
      prayerName: (key: SalahKey) => t(`prayerNames.${key}`),
      adhanTitle: (name: string) => t('reminders.adhanTitle', { name }),
      adhanBody: (reciter: string) => t('reminders.adhanBody', { reciter }),
      athkarTitle: t('reminders.athkarTitle'),
    };
    const timeSig = times
      ? times.slots.map((s) => `${s.name}:${s.time.getHours()}:${s.time.getMinutes()}`).join(',')
      : 'none';
    const next = JSON.stringify(settings) + '|' + timeSig + '|' + language;
    if (next === sig.current) return;
    sig.current = next;
    applyReminders(settings, times, messages);
  }, [settings, hydrated, ready, times, language, t]);

  // Play the full adhān when its notification arrives while the app is open.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      if (n.request.content.data?.type === 'adhan') playAdhanOnce(reciterRef.current);
    });
    return () => sub.remove();
  }, []);

  return null;
}
