# Athar Reliability, Arabic UX, and Prayer Focus Design

**Date:** 2026-08-11

## Objective

Make Athar trustworthy and easy to use: prayer times and Athan notifications must use the correct location, timezone, calculation authority, and user adjustments; Arabic must feel native; crowded settings must be simplified; permissions must be explained; and Prayer Focus must honestly reflect what each platform can enforce.

## Delivery order

This program is split into four independently testable releases:

1. Prayer-time and notification reliability.
2. Arabic/RTL design system and navigation cleanup.
3. More, Notifications, Salah, and onboarding redesign.
4. Native iOS app shielding after Apple grants the Family Controls distribution entitlement.

Android retains the existing in-app Prayer Focus gate in these releases. External Android app blocking is deferred until its AccessibilityService implementation and Google Play declaration are separately approved.

## 1. Prayer-time reliability

### Location model

Replace the current implicit Makkah fallback with an explicit location state:

- `resolving`: no prayer table or notifications are published yet.
- `current`: a recent device fix with coordinates, accuracy, timestamp, city, country code, and coordinate-derived IANA timezone.
- `manual`: a location deliberately selected by the user, including its coordinates and timezone.
- `needsSetup`: no trustworthy current or manual location exists.

A cached device fix is usable only when it has a recorded timestamp, acceptable accuracy, and has not expired. Returning to the foreground triggers a lightweight location refresh. A meaningful movement or timezone change rebuilds the prayer table and notification schedule.

If permission is denied, Athar shows a location setup card and offers system Settings or manual location. It does not silently show Makkah prayer times or Makkah mosques.

### Calculation profile

Prayer settings gain an `Automatic` calculation mode. Automatic mode recommends a regional authority from the resolved country while preserving a visible user override. The profile contains:

- calculation method;
- Asr madhab (`standard` or `hanafi`);
- high-latitude rule;
- per-prayer minute adjustments;
- 12/24-hour display preference.

Times are computed for the calendar date in the location's timezone, stored as absolute `Date` instants, and formatted in that same timezone. The screen always shows the active location, timezone, authority, and any manual adjustment.

### Notification scheduler

Scheduling becomes a serialized, generation-based operation so stale rebuilds cannot append notifications after a newer rebuild. Athar-owned identifiers are used instead of cancelling unrelated scheduled notifications.

The schedule respects the iOS pending-notification limit by applying a calculated horizon based on enabled Athan and Athkar counts. Settings show permission status, the next scheduled Athan, its location/method, and a clear recovery action when scheduling fails.

## 2. Arabic and RTL system

Use three explicit typography roles:

- Inter for English and Latin UI.
- IBM Plex Sans Arabic for Arabic UI, navigation, controls, and numbers.
- Amiri for Qur'an, Hadith, duas, and other scriptural passages.

Shared text and navigation primitives select the correct family by language. Screen-specific styles may change size or weight but may not force a language-inappropriate font.

Replace physical left/right spacing with start/end-aware layout primitives. Localize stack titles, back labels, method names, regions, permission copy, and location labels. Arabic numerals and mixed Arabic/Latin time strings must remain readable without reversed punctuation.

Only English and Arabic remain selectable until another locale has full screen and notification coverage. Existing partial translations remain in source but are not presented as complete languages.

## 3. Information architecture and onboarding

### More

Remove the duplicated worship-tools list. The screen becomes three compact groups:

- **Preferences:** Prayer times, Athan and notifications, appearance, language.
- **Help:** Permissions and setup, replay walkthrough, support and feedback.
- **About:** Privacy, terms, and the version read dynamically from the app manifest.

### Notifications

The overview shows three concise feature rows: Athan, Athkar, and Prayer Focus. Each opens a focused subpage. Advanced reciter-per-prayer settings remain available inside Athan settings but are collapsed behind an `Advanced` row.

### Salah and Prayer Focus

Salah emphasizes the current actionable prayer. Future prayers remain visibly locked, completed prayers become compact, and make-up tracking is secondary. Prayer Focus configuration explains exactly what happens on the current platform.

When iOS native shielding is available, the user:

1. enables Prayer Focus;
2. grants Family Controls authorization;
3. selects distracting apps through Apple's private system picker;
4. chooses prayers and a grace period;
5. has the selected apps shielded after prayer time;
6. opens Athar and taps `I prayed` to record the prayer and clear the shield.

Authorization denial or native-module failure falls back to the in-app gate without claiming external apps are blocked.

### Onboarding and permissions

Replace the 14-step wizard/tour with four setup steps:

1. language and visual preview;
2. location explanation, permission request, and accuracy confirmation;
3. Athan notification explanation, permission request, and test notification;
4. optional Prayer Focus explanation and platform capability summary.

Feature education becomes contextual and dismissible. A reusable Permissions and Setup screen shows Location, Notifications, Precise Location, and Prayer Focus as `Ready`, `Needs attention`, or `Unavailable`, with direct recovery actions.

## 4. Native iOS shielding

The native implementation requires:

- Family Controls authorization for an individual user;
- Family Activity Picker integration;
- an App Group shared by the app and extensions;
- persisted opaque application/category tokens;
- Managed Settings shielding;
- Device Activity Monitor, Shield Configuration, and Shield Action extensions;
- an Expo config plugin that creates/configures the required targets and entitlements;
- a custom development/production build.

The entitlement is enabled for distribution only after Apple approval. Until then, production builds keep native shielding disabled and show the cross-platform gate.

## Error handling

- Never display or schedule prayer data whose location state is `resolving` or `needsSetup`.
- Preserve the last trustworthy manual/current location when a refresh fails, and disclose its age.
- Keep the previous valid notification schedule if building a replacement fails before commit.
- Permission denial always produces an explanation and system-settings action; toggles never fail silently.
- Prayer Focus always provides an exit through `I prayed`, a reason, or the documented fallback behavior.

## Testing and verification

Add an automated TypeScript test runner before production changes. Required coverage includes:

- Makkah coordinates displayed in `Asia/Riyadh` while the device is in Toronto;
- target-location calendar dates across timezone boundaries and DST;
- automatic method mapping, madhab selection, and per-prayer adjustments;
- expired/low-quality location rejection and manual-location persistence;
- scheduler race cancellation and iOS horizon sizing;
- RTL font selection, navigation localization, and logical spacing primitives;
- onboarding permission states and denied-permission recovery;
- Prayer Focus fallback and native bridge result mapping.

Final verification requires a clean typecheck, full unit suite, Expo export for supported platforms, English and Arabic screenshot review, and physical-device notification checks. Native shielding additionally requires an entitled iOS development build and on-device Family Controls testing.

## Acceptance criteria

- Prayer times never silently use Makkah or the device timezone for a different location.
- Users can see and correct location, calculation method, madhab, and minute adjustments.
- Stale notification rebuilds cannot survive a newer schedule.
- Arabic navigation and UI consistently use the Arabic UI family and correct RTL geometry.
- More and Notifications are scan-friendly overview screens rather than long mixed lists.
- Permission denial is recoverable from inside Athar.
- The app never claims to block external apps when the native capability is unavailable.
- iOS shielding clears when the user records the prayer as prayed.
