import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

import { usePrayer } from '@/features/prayer';
import { useLanguage } from '@/i18n/LanguageProvider';
import { SalahKey } from '@/features/salah';
import { useReminders } from './RemindersContext';
import { applyReminders, ReminderMessages } from './scheduler';
import { playAdhanOnce } from './adhanPlayer';

/** Local calendar day as a stable string, so we reschedule on day rollover. */
function dayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

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
  // Bumped when the app returns to the foreground on a new calendar day, so the
  // athkār selection re-randomizes day to day even if nothing else changed.
  const [day, setDay] = useState(dayStamp());

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setDay(dayStamp());
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!hydrated || !ready) return;
    const messages: ReminderMessages = {
      prayerName: (key: SalahKey) => t(`prayerNames.${key}`),
      adhanTitle: (name: string) => t('reminders.adhanTitle', { name }),
      adhanBody: (reciter: string) => t('reminders.adhanBody', { reciter }),
      athkarTitle: t('reminders.athkarTitle'),
      language,
    };
    const timeSig = times
      ? times.slots.map((s) => `${s.name}:${s.time.getHours()}:${s.time.getMinutes()}`).join(',')
      : 'none';
    const next = JSON.stringify(settings) + '|' + timeSig + '|' + language + '|' + day;
    if (next === sig.current) return;
    sig.current = next;
    applyReminders(settings, times, messages);
  }, [settings, hydrated, ready, times, language, t, day]);

  // Play the full adhān when its notification arrives while the app is open.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      if (n.request.content.data?.type === 'adhan') playAdhanOnce(reciterRef.current);
    });
    return () => sub.remove();
  }, []);

  return null;
}
