# Athar — Deployment Runbook

Two independent tracks. The **landing site** can go live today for ~$10/yr.
The **mobile apps** are gated on developer accounts, not on code.

---

## Track A — Landing site (Cloudflare Pages)

The site is the static `landing/` folder. No build step.

### 1. Buy the domain
- Sign in at <https://dash.cloudflare.com> → **Domain Registration → Register Domain**.
- Search `athar.app` (or a fallback: `athar.app` → `getathar.app`, `athar.co`, `atharapp.com`).
  - `.app` is a Google TLD and **requires HTTPS** (HSTS-preloaded). Cloudflare gives free HTTPS, so this is fine.
- Buy it. Cloudflare sells at-cost (no markup) and auto-manages DNS.

### 2. Deploy the site
Option A — **Git (recommended, auto-deploys on every push):**
1. Cloudflare dash → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `aldoserehd/Athar` repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - **Build output directory: `landing`**
4. Save and Deploy → you get a `*.pages.dev` URL in ~30s.

Option B — **Direct upload (no Git):** Workers & Pages → Create → Pages → Upload assets → drag the `landing/` folder.

### 3. Connect the domain
- In the Pages project → **Custom domains → Set up a domain** → enter `athar.app` and `www.athar.app`.
- Cloudflare wires the DNS automatically (same account). HTTPS issues within minutes.
- Clean URLs work out of the box: `/privacy` serves `privacy.html` (matches the in-app links).

### 4. Verify
- [ ] `https://athar.app` loads, EN/AR toggle works, screenshots show.
- [ ] `https://athar.app/privacy`, `/terms`, `/support` resolve.
- [ ] `mailto:salam@athar.app` — set up email (Cloudflare Email Routing, free: forward `salam@athar.app` → your Gmail).

---

## Track B — Mobile apps (EAS Build → stores)

### Prerequisites (the real blockers — accounts + money)
- **Apple Developer Program** — $99/yr — <https://developer.apple.com/programs/enroll/>
  (enrollment can take 24–48h; needs a D-U-N-S if enrolling as an org — use Individual to skip that).
- **Google Play Console** — $25 once — <https://play.google.com/console/signup>
- Both can be started today in parallel. **Android is cheaper + faster to first release**, so start there.

### Build with EAS
```bash
npm i -g eas-cli
eas login
# Android internal test APK/AAB:
eas build -p android --profile preview      # APK for sideload testing
eas build -p android --profile production    # AAB for Play Store
# iOS (after Apple account approved):
eas build -p ios --profile production
```

### Submit
```bash
eas submit -p android --latest   # uploads AAB to Play (needs a service-account key, one-time)
eas submit -p ios --latest       # uploads to App Store Connect / TestFlight
```

### Store listing checklist (both stores)
- [ ] App name: **Athar** · subtitle: "Prayer, hadith & mosques — ad-free"
- [ ] Description (EN + AR), keywords
- [ ] Screenshots — already in `landing/screenshots/` (need device-frame sizes per store)
- [ ] App icon — `assets/icon.png` ✅
- [ ] **Privacy Policy URL** → `https://athar.app/privacy` ✅
- [ ] Support URL → `https://athar.app/support` ✅
- [ ] Data Safety form (Play) / App Privacy (Apple): declare "no data collected" — Athar stores
      tracker + settings on-device only (see `docs/APP_STORE_COMPLIANCE.md`).
- [ ] Content rating questionnaire (will rate 4+/Everyone).

### Optional backend (only if you enable crowd-sourced Mosque Wiki writes)
- Create a free Supabase project, run `supabase/schema.sql`, set
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` as EAS secrets.
- The app already falls back to OpenStreetMap (Overpass) when Supabase is absent, so this is not required for v1.
- Optional: set `EXPO_PUBLIC_OCR_SPACE_KEY` (free key from ocr.space) to lift the demo OCR rate limit.

---

## Suggested order
1. **Today:** buy domain → deploy landing → set up email routing.
2. **This week:** start Apple + Play enrollments; run first Android `preview` build and test on your phone.
3. **On approval:** production builds → internal testing → store review → release.
