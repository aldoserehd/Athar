# Athar · أثر

A free, ad-free mobile app for Muslims. **Athar** ("a trace; a transmitted
tradition") brings together a hadith library, a Qadha (missed-prayer) tracker,
a community mosque wiki, prayer times, qibla and duas — quiet, scholarly, and
private by default.

> **Phase 1 (this build):** project scaffold, tab navigation, light/dark theme
> system, and a fully working **Qadha tracker** with local storage. Hadith,
> Mosques, and Prayer screens are roadmap placeholders.

## Tech stack

- **React Native 0.81 + Expo** (SDK 54, React 19), **TypeScript**
- **@react-navigation** bottom tabs
- **AsyncStorage** for local persistence
- **react-native-svg** for the progress ring
- Fonts: **Inter** (UI) + **Amiri** (Arabic) via `@expo-google-fonts`

## Getting started

```bash
npm install
npm start          # then press i (iOS), a (Android), or w (web)
```

Other scripts:

```bash
npm run ios        # open in iOS simulator
npm run android    # open on Android device/emulator
npm run typecheck  # tsc --noEmit
```

> Placeholder app icon/splash live in `assets/` (solid teal). Regenerate with
> `node scripts/make-placeholder-assets.js`, or drop in final art before
> submitting to the stores.

## Project structure

```
Athar/
├── App.tsx                     # Root: loads fonts, wires providers
├── index.ts                    # Expo entry point
├── app.json                    # Expo config (icons, splash, bundle ids)
├── babel.config.js             # '@/…' path alias
├── assets/                     # App icon / splash (placeholders)
├── scripts/
│   └── make-placeholder-assets.js
├── docs/
│   └── APP_STORE_COMPLIANCE.md # Apple review checklist by phase
├── landing/                    # Marketing + legal site (App Store URLs)
│   ├── index.html              # Marketing landing page
│   ├── privacy.html            # Privacy Policy  (required by Apple)
│   ├── terms.html              # Terms of Use
│   ├── support.html            # Support URL     (required by Apple)
│   └── styles.css
└── src/
    ├── theme/                  # Design system
    │   ├── palette.ts          #   light/dark color tokens
    │   ├── tokens.ts           #   spacing, radius, type scale, fonts
    │   └── ThemeProvider.tsx   #   useTheme(), preference persistence
    ├── components/             # Shared UI primitives
    │   ├── Text, Screen, Card, Button, IconButton, ProgressRing
    ├── navigation/
    │   ├── RootNavigator.tsx   # Tab bar: Prayer · Qadha · Hadith · Mosques · More
    │   └── types.ts
    ├── screens/
    │   ├── QadhaScreen.tsx     # ← the working feature
    │   ├── MoreScreen.tsx      # theme switch + legal links
    │   ├── ComingSoonScreen.tsx
    │   └── Hadith / Mosques / Prayer (placeholders)
    └── features/
        └── qadha/              # Self-contained Qadha feature
            ├── types.ts        #   prayer model, state shape
            ├── storage.ts      #   AsyncStorage load/save
            ├── QadhaContext.tsx#   reducer, stats, actions
            └── components/      #   PrayerCounterRow, BacklogSheet
```

## The Qadha tracker

- **First run** shows an empty state; tap **Set up backlog**.
- Estimate **by time period** (years / months / days → one prayer per day) or
  enter counts **per prayer**. Optional **Witr** counter (wajib in the Hanafi
  school).
- The summary card shows a **progress ring** (% complete), total **remaining**
  and **made up**.
- On each prayer row, tap **−** when you make a prayer up, **+** to add to the
  backlog. State is debounced to AsyncStorage and restored on launch.
- Everything is **on-device** — no account, works offline.

## Design system

Material 3 palette (Stitch redesign):

| Token      | Light     | Dark      |
| ---------- | --------- | --------- |
| Primary    | `#0F4C5C` | `#90D0E3` |
| Background | `#FCF9F8` | `#051424` |
| Accent     | `#B5793A` | `#D4C5A4` |
| Text       | `#1C1B1B` | `#D5E4FA` |

Always read colors via `useTheme().colors.*` — never hardcode hex in components.

## App Store readiness

See [`docs/APP_STORE_COMPLIANCE.md`](docs/APP_STORE_COMPLIANCE.md) for a
phase-by-phase Apple review checklist. The `landing/` site provides the
**Privacy Policy**, **Terms**, and **Support** URLs Apple requires for every
listing. Deploy it (e.g. to `athar.app`) and point App Store Connect at the
matching URLs.

## Roadmap

- **Done** — Prayer tab (worldwide `adhan` times, location, methods), interactive Qibla compass, Salah tracker + reminders
- **Done (v1)** — Hadith library: bundled narrations, search + browse, detail screen
- **Done (v1)** — Mosque finder: list + search, detail sheet (jamāʿah times, facilities, directions)
- **Phase 2 next** — Full hadith corpus + on-device semantic search; Quran cross-refs
- **Phase 3 next** — Live OpenStreetMap map + Supabase backend + community moderation (needs a dev build)
- **Later** — Duas, onboarding flow
