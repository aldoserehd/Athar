# iOS App-Lock (Screen Time / Family Controls) — status & checklist

Prayer Lock ships in **two layers**. Read this before assuming app-blocking works.

## What works today (every platform, including Expo Go)

The **cross-platform commitment gate** — `src/features/lock/PrayerLockOverlay.tsx`.
When the user enables Prayer Lock (Settings → Notifications → *Prayer Lock*),
a full-screen, encouraging overlay appears shortly after a lock-enabled prayer
time **if that prayer hasn't been logged yet**. It shows the prayer name, a
bilingual inspiring hadith/ayah from `@/features/inspiration`, and a gentle
nudge. The user always has three ways out, so it can never trap them:

- **I prayed** → marks the prayer in `SalahContext` and dismisses.
- **Remind me in X min** → snoozes for the user-chosen minutes (per prayer).
- **I can't right now** → opens the existing salah *reasons* sheet (sick /
  menstruating / travel / …); picking any reason logs it and dismisses.

This gate is the working feature and the **fallback** the native layer degrades to.

## What is only SCAFFOLDED (not working — do not claim otherwise)

True OS-level **app blocking** (greying out Instagram/TikTok/etc. during a
prayer window) is **not implemented and cannot run in Expo Go**. The JS surface
exists at `src/features/lock/screenTime.ts` (`isSupported`, `requestAuthorization`,
`pickAppsToBlock`, `startShield`, `stopShield`) and currently returns a clear
*"not available on this build/platform"* result, so nothing crashes.

To make it real, ALL of the following are required:

### 1. The Family Controls entitlement (Apple approval required)
- Capability: `com.apple.developer.family-controls`.
- Added to the build by the Expo config plugin `plugins/withFamilyControls.js`
  (referenced from `app.json` → `expo.plugins`). It writes the entitlement +
  an Info.plist note; it is iOS-only and a no-op elsewhere.
- **You must request this entitlement from Apple** (Developer portal →
  Account → request Family Controls / "Distribution" access). Apple manually
  reviews and approves it. **The feature can only ship after approval.** Until
  then, builds that include the entitlement will fail App Store distribution.

### 2. Apple frameworks (Swift, in a native module / extension)
- `FamilyControls` — `AuthorizationCenter.requestAuthorization(.individual)`
  and the `FamilyActivityPicker` (the system UI where the user selects which
  apps/categories to block — we cannot read or choose their apps ourselves).
- `ManagedSettings` — `ManagedSettingsStore().shield.applications = …` to apply
  the shield.
- `DeviceActivity` — schedule the shield to a time window (the prayer window)
  via `DeviceActivityCenter` + a `DeviceActivitySchedule`.

### 3. A DeviceActivityMonitor app-extension target
- A separate extension target (e.g. `AtharDeviceActivityMonitor`) subclassing
  `DeviceActivityMonitor`, with `intervalDidStart` / `intervalDidEnd` applying
  and removing the shield. This is added in Xcode (or via a dedicated native
  module / additional config-plugin mod) — it is **not** something Expo
  generates automatically.
- The app and extension share an App Group so the selected `FamilyActivitySelection`
  (the user's app choices) is readable by both.

### 4. A custom build (NOT Expo Go)
- All of the above only link in a **custom dev client / production build** via
  `eas build`. `expo start` / Expo Go will never load the native module, which
  is exactly why `screenTime.ts` degrades gracefully there.

## Intended user flow once the native layer lands
1. User enables Prayer Lock and toggles "Block distracting apps" (iOS only).
2. `requestAuthorization()` → user grants Family Controls.
3. `pickAppsToBlock()` → system `FamilyActivityPicker` → user selects apps.
4. At each lock-enabled prayer time, `startShield({ startMs, endMs })` schedules
   the shield for that prayer's window; `stopShield()` (or the window ending,
   or the user marking the prayer prayed) lifts it.
5. If any of this is unavailable, the app silently falls back to the
   cross-platform commitment gate above.

## Honesty note
This repo currently ships **only** the cross-platform gate and the entitlement
scaffold. The native Swift module + extension are intentionally **not** included
and the blocking does **not** function in this build.
