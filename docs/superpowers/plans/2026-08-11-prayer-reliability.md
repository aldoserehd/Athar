# Prayer-Time and Athan Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Athar displays and schedules prayer times from a trustworthy location, the location's timezone, the appropriate calculation profile, and a race-free platform-safe notification plan.

**Architecture:** Introduce explicit location provenance and timezone metadata, isolate timezone/calendar conversion from astronomical calculation, and generate a pure reminder plan before committing it through one serialized scheduler. Keep `adhan` as the astronomical engine while making regional method selection, madhab, and adjustments explicit user-controlled inputs.

**Tech Stack:** TypeScript, React Native 0.81, Expo SDK 54, `adhan` 4.4.3, Expo Location, Expo Notifications, AsyncStorage, Jest with `jest-expo`.

## Global Constraints

- Never show or schedule prayer data from an unknown or implicit fallback location.
- Store prayer instants as `Date` values and format them in the selected location's IANA timezone.
- Automatic calculation method selection remains visible and user-overridable.
- Existing stored settings and locations must migrate without crashing.
- Notification rebuilds must be serialized and stale generations must stop scheduling.
- English and Arabic copy must be added together.

---

### Task 1: Test foundation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `jest.config.js`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: `npm test -- --runInBand` for TypeScript unit and component tests.
- Produces: `@/` alias resolution inside tests.

- [x] **Step 1: Add a deliberately failing smoke test**

Create `src/test/smoke.test.ts`:

```ts
describe('test environment', () => {
  it('loads the Athar alias', () => {
    expect(require('@/features/prayer')).toBeDefined();
  });
});
```

- [x] **Step 2: Run it before installing the runner**

Run: `npm test -- --runInBand`

Expected: FAIL because no `test` script exists.

- [x] **Step 3: Install and configure the Expo-matched runner**

Run: `npx expo install jest-expo@~54.0.17 -- --save-dev`

Run: `npm install --save-dev @types/jest`

Add to `package.json`:

```json
"test": "jest"
```

Create `jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/Athar-12-Final-Ads/'],
};
```

Create `src/test/setup.ts` with stable AsyncStorage and native-module mocks used by prayer tests.

- [x] **Step 4: Verify the smoke test passes**

Run: `npm test -- --runInBand src/test/smoke.test.ts`

Expected: PASS with one test.

- [x] **Step 5: Verify typechecking still passes**

Run: `npm run typecheck`

Expected: exit 0.

### Task 2: Location provenance, freshness, and timezone

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/features/prayer/location.ts`
- Create: `src/features/prayer/location.test.ts`
- Create: `src/features/prayer/timezone.ts`
- Create: `src/features/prayer/timezone.test.ts`
- Modify: `src/features/prayer/index.ts`

**Interfaces:**
- Produces: `GeoPlace` with `source`, `timezone`, `capturedAt`, `accuracyMeters`, `countryCode`, and coordinates.
- Produces: `isPlaceTrustworthy(place, now): boolean`.
- Produces: `calendarDateAt(instant, timezone): Date`.
- Produces: `formatZonedTime(instant, timezone, hour12, locale): string`.
- Produces: `resolveLocation(): Promise<LocationResult>` where `place` can be `null`.

- [x] **Step 1: Write failing location trust tests**

Cover a fresh 50-metre current fix, an expired cached fix, a low-quality fix, a manual place, and legacy cached JSON without timezone metadata.

```ts
expect(isPlaceTrustworthy(freshToronto, now)).toBe(true);
expect(isPlaceTrustworthy(expiredToronto, now)).toBe(false);
expect(isPlaceTrustworthy(manualKuwait, now)).toBe(true);
```

- [x] **Step 2: Run the location tests and verify RED**

Run: `npm test -- --runInBand src/features/prayer/location.test.ts`

Expected: FAIL because the new fields and trust function do not exist.

- [x] **Step 3: Write failing timezone tests**

```ts
it('uses the Makkah calendar and clock while the device is in Toronto', () => {
  const instant = new Date('2026-08-11T01:36:00.000Z');
  expect(formatZonedTime(instant, 'Asia/Riyadh', true, 'en')).toBe('4:36 AM');
});
```

Also cover a target timezone whose calendar date is tomorrow relative to the device.

- [x] **Step 4: Run timezone tests and verify RED**

Run: `npm test -- --runInBand src/features/prayer/timezone.test.ts`

Expected: FAIL because `timezone.ts` does not exist.

- [x] **Step 5: Add coordinate-to-timezone lookup**

Install `tz-lookup` and its TypeScript declaration if required. Resolve an IANA zone when constructing every current or manual place. Configure last-known location with a maximum age and required accuracy instead of accepting any available fix.

- [x] **Step 6: Implement location migration and trust rules**

Use a versioned cache key. Legacy records without required metadata are not trusted for scheduling. Return `{ place: null, granted }` when neither a recent fix nor a deliberate manual place exists.

- [x] **Step 7: Implement timezone calendar and formatting helpers**

Use `Intl.DateTimeFormat(..., { timeZone, ... })` and `formatToParts()` so astronomical calculation receives the target location's calendar year, month, and day.

- [x] **Step 8: Verify GREEN**

Run: `npm test -- --runInBand src/features/prayer/location.test.ts src/features/prayer/timezone.test.ts`

Expected: PASS.

### Task 3: Calculation profiles and timezone-correct prayer tables

**Files:**
- Modify: `src/features/prayer/methods.ts`
- Create: `src/features/prayer/methods.test.ts`
- Modify: `src/features/prayer/calc.ts`
- Create: `src/features/prayer/calc.test.ts`
- Modify: `src/features/prayer/PrayerContext.tsx`
- Modify: `src/features/prayer/components/PrayerSettingsSheet.tsx`
- Modify: `src/screens/PrayerScreen.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: `PrayerAdjustments` and `PrayerCalculationProfile`.
- Produces: `recommendMethod(countryCode, latitude): MethodKey`.
- Changes: `computeTimes(latitude, longitude, timezone, profile, now)`.
- Changes: prayer context exposes `place: GeoPlace | null`, `locationStatus`, `resolvedMethod`, `setMadhab`, `setMethodMode`, and `setAdjustment`.

- [x] **Step 1: Write failing regional-method tests**

```ts
expect(recommendMethod('KW', 29.37)).toBe('Kuwait');
expect(recommendMethod('SA', 24.71)).toBe('UmmAlQura');
expect(recommendMethod('CA', 43.65)).toBe('MoonsightingCommittee');
expect(recommendMethod('MY', 3.14)).toBe('Singapore');
```

- [x] **Step 2: Verify regional-method tests fail**

Run: `npm test -- --runInBand src/features/prayer/methods.test.ts`

Expected: FAIL because `recommendMethod` is missing.

- [x] **Step 3: Write failing prayer calculation regressions**

Assert that Makkah Fajr is formatted near 04:36 in `Asia/Riyadh` even when the test instant/device context is Toronto, that `+2` Fajr adjustment moves only Fajr, and Hanafi Asr is later than standard Asr.

- [x] **Step 4: Verify calculation tests fail**

Run: `npm test -- --runInBand src/features/prayer/calc.test.ts`

Expected: FAIL against the old signature/behavior.

- [x] **Step 5: Implement profiles and parameter adjustments**

Extend `buildParams` to copy all adjustment values into `params.adjustments`. Add automatic country mapping with Muslim World League as the explicit final fallback.

- [x] **Step 6: Make computation timezone-aware**

Use `calendarDateAt(now, timezone)` for today's `PrayerTimes` and add calendar days to that carrier date for tomorrow. Keep prayer instants as absolute dates and attach `timezone` plus a target-zone `dateKey` to `ComputedTimes`.

- [x] **Step 7: Update context hydration and refresh behavior**

Do not set `ready` until a trustworthy place or `needsSetup` state is known. Refresh on app foreground and when the device timezone changes. Never calculate from a null place.

- [x] **Step 8: Expose automatic/manual method, madhab, and adjustments**

Update the settings sheet with localized labels and minute steppers. The Prayer screen displays location, timezone, resolved authority, and adjustment status.

- [x] **Step 9: Verify GREEN**

Run: `npm test -- --runInBand src/features/prayer/methods.test.ts src/features/prayer/calc.test.ts`

Expected: PASS.

### Task 4: Pure reminder plans and serialized scheduling

**Files:**
- Modify: `src/features/reminders/scheduler.ts`
- Create: `src/features/reminders/scheduler.test.ts`
- Modify: `src/features/reminders/ReminderScheduler.tsx`
- Modify: `src/features/reminders/RemindersContext.tsx`

**Interfaces:**
- Produces: `buildReminderPlan(settings, calc, messages, now, platform): PlannedNotification[]`.
- Produces: `calculateScheduleHorizon(settings, platform): number`.
- Produces: `queueReminderCommit(plan, dependencies): Promise<ScheduleResult>`.
- Produces: persisted registry of Athar-owned notification identifiers.

- [x] **Step 1: Write failing horizon tests**

Assert that five Athans plus six Athkar per day fit within a reserved iOS budget and that Android retains the standard seven-day horizon.

```ts
expect(calculateScheduleHorizon(maxSettings, 'ios')).toBeLessThanOrEqual(5);
expect(calculateScheduleHorizon(adhanOnly, 'android')).toBe(7);
```

- [x] **Step 2: Write a failing stale-generation test**

Use deferred fake scheduling calls: start a Toronto plan, enqueue a Kuwait plan before Toronto completes, then assert no Toronto item is scheduled after the Kuwait generation becomes current.

- [x] **Step 3: Verify scheduler tests fail**

Run: `npm test -- --runInBand src/features/reminders/scheduler.test.ts`

Expected: FAIL because planning and queue interfaces do not exist.

- [x] **Step 4: Extract a pure plan builder**

The plan builder computes every fire date, localized title/body, reciter sound, channel, and Athar ownership metadata without calling Expo APIs.

- [x] **Step 5: Add platform-aware horizon sizing**

Reserve headroom under iOS's pending limit, count enabled daily events, and calculate a safe whole-day horizon. Keep Android at seven days.

- [x] **Step 6: Serialize commits and cancel only Athar-owned identifiers**

Persist returned identifiers after a successful generation. A newer generation invalidates older loops before each native scheduling call. Replace `cancelAllScheduledNotificationsAsync()` with cancellation of the stored Athar registry.

- [x] **Step 7: Update ReminderScheduler inputs**

Schedule only when prayer context has a trustworthy place and resolved profile. Include timezone and profile changes in the signature. Catch and publish schedule errors instead of allowing unhandled promises.

- [x] **Step 8: Verify GREEN**

Run: `npm test -- --runInBand src/features/reminders/scheduler.test.ts`

Expected: PASS.

### Task 5: Accuracy and permission recovery UI

**Files:**
- Create: `src/screens/LocationSetupScreen.tsx`
- Create: `src/features/prayer/geocoding.ts`
- Create: `src/features/prayer/geocoding.test.ts`
- Modify: `src/navigation/types.ts`
- Modify: `src/navigation/RootNavigator.tsx`
- Modify: `src/screens/PrayerScreen.tsx`
- Modify: `src/screens/MosquesScreen.tsx`
- Modify: `src/i18n/translations.ts`
- Create: `src/screens/LocationSetupScreen.test.tsx`

**Interfaces:**
- Produces: `LocationSetup` stack route.
- Consumes: prayer context `locationStatus`, `refreshLocation`, and manual-place action.
- Produces: `searchManualPlaces(query, locale)` using a configurable Nominatim-compatible endpoint.
- Produces: truthful location-required states for Prayer and Mosques.

- [x] **Step 1: Write failing recovery-state component tests**

Cover denied permission with `Open Settings`, unresolved location with `Try again`, and a trustworthy manual/current location summary.

- [x] **Step 2: Verify UI tests fail**

Run: `npm test -- --runInBand src/screens/LocationSetupScreen.test.tsx`

Expected: FAIL because the screen does not exist.

- [x] **Step 3: Write and run failing manual-place search tests**

Test a successful JSONv2 response, an empty query that makes no request, malformed coordinates, a network failure, Arabic `accept-language`, and selection into a trusted manual `GeoPlace` with an IANA timezone.

Run: `npm test -- --runInBand src/features/prayer/geocoding.test.ts`

Expected: FAIL because `geocoding.ts` does not exist.

- [x] **Step 4: Implement policy-safe manual city search**

Use `EXPO_PUBLIC_GEOCODING_BASE_URL`, defaulting to `https://nominatim.openstreetmap.org`, so the service can be switched without changing application code. Send one request only after explicit form submission, never on keystrokes. Use `format=jsonv2`, `addressdetails=1`, `limit=8`, localized `accept-language`, an Athar-identifying header, local query-result caching, and visible OpenStreetMap attribution. Reject blank queries and invalid coordinates. Resolve the selected result's timezone with `tz-lookup` before saving it as a trusted manual place.

- [x] **Step 5: Implement the focused setup screen**

Explain why location affects times, show permission and accuracy status, request a fresh fix, and deep-link to system settings when `canAskAgain` is false. Add a submit-only manual city search with result selection, error/empty/loading states, and OpenStreetMap attribution.

- [x] **Step 6: Remove misleading fallbacks from Prayer and Mosques**

Prayer renders setup instead of times when location is untrustworthy. Mosques renders a location-required state instead of querying around Makkah.

- [ ] **Step 7: Verify the component and complete suite**

Run: `npm test -- --runInBand`

Expected: all tests PASS.

- [ ] **Step 8: Run release checks**

Run: `npm run typecheck`

Run: `npx expo export --platform web`

Expected: both exit 0.

Run an English and Arabic manual check of Prayer settings, denied location, fresh location, and the next scheduled Athan on a development build.
