# Mosque Wiki — backend & map setup

The Mosques tab works offline against bundled sample data. To go **live** (real
community listings + interactive map) you need a Supabase project and a
**development build** — the map and (later) auth use native modules that aren't
in Expo Go.

## 1. Supabase (community data + moderation)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste and run [`supabase/schema.sql`](../supabase/schema.sql).
   It creates the `mosques` table with Row-Level Security so only **approved**
   rows are public, submissions land as **pending**, and `report_mosque()` lets
   anyone flag a listing (auto-hides at 3 reports for re-review) — this satisfies
   Apple's UGC rules (Guideline 1.2: filter, report, moderate).
3. Copy `.env.example` → `.env` and fill in from **Settings → API**:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
   ```
4. Restart the bundler (`npx expo start -c`). The Mosques list now reads live
   approved rows; the "Sample/Live" badge reflects the source. With no `.env`,
   it transparently falls back to the bundled data.

**Still to build for full UGC:** email auth (Sign in with Apple **only if** you
add social login), an in-app **add/edit mosque** form (inserts a `pending` row),
**account deletion**, and a small admin view to approve/reject. See
[`docs/APP_STORE_COMPLIANCE.md`](APP_STORE_COMPLIANCE.md).

## 2. The map (react-native-maps + OpenStreetMap)

The list renders everywhere; the **map only mounts in a dev/standalone build**
(`Constants.executionEnvironment !== storeClient`). In Expo Go you'll see the
list with a note.

Make a development build:
```bash
npx expo install expo-dev-client
npx expo run:ios      # or: npx expo run:android   (needs Xcode / Android SDK)
# or cloud:           eas build --profile development
```

Tiles come from OpenStreetMap via `<UrlTile>`:
- **iOS** uses Apple Maps as the base + OSM tiles on top — no API key needed.
- **Android**'s base layer is Google Maps; add a key in `app.json`
  (`expo.android.config.googleMaps.apiKey`), **or** switch to
  `@maplibre/maplibre-react-native` for a fully Google-free OSM/vector map.
- **Production:** don't hit `openstreetmap.org` tiles at scale — use a proper
  host (MapTiler, Stadia Maps, Thunderforest) per the OSM tile usage policy.
