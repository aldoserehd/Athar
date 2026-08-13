import type { SalahKey } from '@/features/salah';
import * as Notifications from 'expo-notifications';

import {
  buildReminderPlan,
  calculateScheduleHorizon,
  queueReminderCommit,
  type PlannedNotification,
  type ReminderCommitDependencies,
  type ReminderMessages,
  type ReminderSettings,
} from './scheduler';

const PRAYERS: Record<SalahKey, boolean> = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

function settings(overrides: Partial<ReminderSettings> = {}): ReminderSettings {
  return {
    adhanEnabled: true,
    prayers: PRAYERS,
    reciterId: 'qatami',
    prayerReciters: {
      fajr: 'qatami',
      dhuhr: 'qatami',
      asr: 'qatami',
      maghrib: 'qatami',
      isha: 'qatami',
    },
    athkarEnabled: true,
    athkarHour: 9,
    athkarMinute: 0,
    athkarPerDay: 6,
    athkarRandomize: true,
    athkarMode: 'spread',
    inspiringContent: false,
    lock: { enabled: false, prayers: PRAYERS, snoozeMinutes: 10, graceMinutes: 0 },
    ...overrides,
  };
}

const MESSAGES: ReminderMessages = {
  prayerName: (key) => key,
  adhanTitle: (name, time) => `${name}@${time}`,
  adhanBody: 'Time to pray',
  athkarTitle: 'Dhikr',
  language: 'en',
};

describe('notification horizon', () => {
  it('keeps a fully enabled iOS schedule under the reserved pending budget', () => {
    expect(calculateScheduleHorizon(settings(), 'ios')).toBeLessThanOrEqual(5);
  });

  it('retains a seven-day Android horizon for Adhan-only schedules', () => {
    expect(
      calculateScheduleHorizon(settings({ athkarEnabled: false }), 'android'),
    ).toBe(7);
  });

  it('never creates more than 60 iOS notification requests', () => {
    const calc = {
      latitude: 21.4225,
      longitude: 39.8262,
      timezone: 'Asia/Riyadh',
      profile: {
        method: 'UmmAlQura' as const,
        madhab: 'standard' as const,
        adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      },
    };
    const now = new Date('2026-08-10T21:00:00.000Z');

    expect(buildReminderPlan(settings(), calc, MESSAGES, now, 'ios')).toHaveLength(55);
  });
});

describe('serialized reminder commits', () => {
  it('stops and cleans a stale generation before scheduling its next item', async () => {
    let finishFirst!: (id: string) => void;
    let markFirstStarted!: () => void;
    const firstSchedule = new Promise<string>((resolve) => {
      finishFirst = resolve;
    });
    const firstStarted = new Promise<void>((resolve) => {
      markFirstStarted = resolve;
    });
    let call = 0;
    const scheduledOwners: string[] = [];
    const cancelled: string[] = [];
    const dependencies: ReminderCommitDependencies = {
      loadOwnedIds: async () => [],
      saveOwnedIds: async () => undefined,
      cancel: async (id) => {
        cancelled.push(id);
      },
      schedule: async (request) => {
        scheduledOwners.push(String(request.content.data?.ownerKey));
        call += 1;
        if (call === 1) markFirstStarted();
        return call === 1 ? firstSchedule : `new-${call}`;
      },
    };
    const item = (ownerKey: string): PlannedNotification => ({
      ownerKey,
      request: {
        content: { title: ownerKey, data: { ownerKey } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date('2026-08-11T12:00:00.000Z'),
        },
      },
    });

    const oldCommit = queueReminderCommit([item('toronto-1'), item('toronto-2')], dependencies);
    await firstStarted;
    const newCommit = queueReminderCommit([item('kuwait-1')], dependencies);
    finishFirst('old-1');

    await Promise.all([oldCommit, newCommit]);

    expect(scheduledOwners).toEqual(['toronto-1', 'kuwait-1']);
    expect(cancelled).toContain('old-1');
  });
});
