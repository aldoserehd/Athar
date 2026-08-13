import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

import { usePrayer } from '@/features/prayer';
import { useLanguage } from '@/i18n/LanguageProvider';
import { SalahKey } from '@/features/salah';
import { useReminders } from './RemindersContext';
import { applyReminders, PrayerCalc, ReminderMessages } from './scheduler';
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
  const { settings, hydrated, setScheduleError } = useReminders();
  const { place, profile, ready } = usePrayer();
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
    if (!hydrated || !ready || !place || !profile) return;
    const messages: ReminderMessages = {
      prayerName: (key: SalahKey) => t(`prayerNames.${key}`),
      adhanTitle: (name: string, time: string) => t('reminders.adhanTitle', { name, time }),
      adhanBody: t('reminders.adhanBody'),
      athkarTitle: t('reminders.athkarTitle'),
      language,
    };
    // Schedule from the location + method/madhab so we can compute each future
    // day's real prayer times (one-off triggers), not just today's clock time.
    const calc: PrayerCalc = {
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      profile,
    };
    const calcSig = `${calc.latitude},${calc.longitude},${calc.timezone},${JSON.stringify(calc.profile)}`;
    const next = JSON.stringify(settings) + '|' + calcSig + '|' + language + '|' + day;
    if (next === sig.current) return;
    sig.current = next;
    void applyReminders(settings, calc, messages)
      .then((result) => {
        if (result.stale) return;
        setScheduleError(result.errors.length > 0 ? result.errors[0] : null);
      })
      .catch((error) => {
        setScheduleError(error instanceof Error ? error.message : String(error));
      });
  }, [settings, hydrated, ready, place, profile, language, t, day, setScheduleError]);

  // Play the full adhān when its notification arrives while the app is open.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      const data = n.request.content.data;
      if (data?.type === 'adhan') {
        // Play this prayer's chosen reciter (falls back to the default voice).
        playAdhanOnce(typeof data.reciter === 'string' ? data.reciter : reciterRef.current);
      }
    });
    return () => sub.remove();
  }, []);

  return null;
}
