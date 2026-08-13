# Arabic, Navigation, Onboarding, and Focus Experience Plan

**Goal:** Make Athar feel sharp and calm in English and Arabic, reduce navigation clutter, teach permissions clearly, and present prayer focus features honestly on each platform.

**Architecture:** Keep shared design primitives and route structure, but centralize locale-aware typography/direction. Replace long first-run tours with four outcome-based steps. Keep the working in-app commitment gate cross-platform while exposing native iOS shielding only when the native module and entitlement are actually available.

## Task 1: Arabic typography and RTL

- [ ] Install and register IBM Plex Sans Arabic regular/medium/semibold/bold.
- [ ] Map every shared UI text weight to the Arabic family; keep Amiri for scripture.
- [ ] Remove screen-level Tajawal/Inter overrides that defeat shared typography.
- [ ] Make navigation labels/titles use Arabic fonts and logical RTL direction.
- [ ] Replace high-risk physical left/right spacing in shared rows with start/end or horizontal spacing.
- [ ] Verify English/Arabic renders at phone widths without clipped text.

## Task 2: Simplify More and Notifications

- [ ] Remove duplicated worship shortcuts from More.
- [ ] Group More into Preferences, Help, and About with concise rows.
- [ ] Show only complete English and Arabic locales.
- [ ] Read the displayed version from Expo config instead of hardcoding it.
- [ ] Turn Notifications into an overview with clear states and progressively disclosed controls.
- [ ] Add recovery links for denied notification access and explain what each switch changes.

## Task 3: Four-step onboarding

- [ ] Replace the nine-step wizard plus five-step tour with Language, Location, Notifications, and optional Focus.
- [ ] Explain each permission before the OS prompt and show denial recovery.
- [ ] Add a test-notification action after access is granted.
- [ ] Let users skip optional steps without hiding how to return later.
- [ ] Remove the automatic five-tab coach tour.

## Task 4: Prayer Focus lock

- [ ] Keep the in-app commitment gate working on iOS and Android.
- [ ] Add a platform capability state: iOS native shielding, in-app fallback, or unavailable.
- [ ] Wire authorization/app-selection actions only when the iOS native module is present.
- [ ] Stop a native shield immediately when the user records “I prayed” or a valid reason.
- [ ] Enable the Family Controls config only after entitlement readiness is explicitly confirmed; do not claim native blocking in ordinary builds.

## Task 5: Exhaustive QA and bug fixes

- [ ] Build an inventory of every screen, button, search, link, toggle, permission branch, empty state, and error state.
- [ ] Exercise English and Arabic at compact phone width.
- [ ] Capture browser evidence for reproducible UI issues.
- [ ] Add regression tests for every logic/interaction bug fixed.
- [ ] Run full tests, strict typecheck, web export, and diff checks.
