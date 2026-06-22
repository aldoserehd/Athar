# Athar — App Store Review Compliance

A working checklist mapping Apple's App Review Guidelines to Athar's features so
each submission clears review the first time. Phase numbers refer to the build
roadmap; items are marked **now** (Phase 1) or the phase where they become
mandatory.

---

## 1. Required URLs (App Store Connect metadata)

Apple requires these for every app listing. They are served by the landing site
in `/landing` and must be live before submission.

| Field            | URL                          | Phase |
| ---------------- | ---------------------------- | ----- |
| Privacy Policy   | https://try-athar.com/privacy    | now   |
| Support URL      | https://try-athar.com/support    | now   |
| Marketing URL    | https://try-athar.com            | now   |
| Terms of Use     | https://try-athar.com/terms      | now   |

> Update the in-app links in `src/screens/MoreScreen.tsx` and the domain in the
> landing pages if the final domain differs.

---

## 2. Privacy (Guideline 5.1)

- **App Privacy "nutrition label"** must be filled in App Store Connect.
  - **Phase 1 (now):** Athar collects **no data**. Qadha data and theme
    preference are stored only on-device via AsyncStorage. Declare *"Data Not
    Collected."*
  - **Phase 3 (Mosque Wiki / Supabase auth):** declare account email, and any
    coarse location used to find nearby mosques. Map them as *not linked to
    identity* where possible; *not used for tracking*.
- **Permission purpose strings** — Apple rejects apps that access a system
  resource without a clear, specific `NSUsageDescription`. Add these to
  `app.json` (`expo.ios.infoPlist`) **in the phase the feature ships**, never
  earlier (requesting a permission with no visible feature is itself a rejection
  reason 5.1.1):
  - `NSLocationWhenInUseUsageDescription` — qibla + nearby mosques (Phase 3/4).
  - Notifications permission for adhan (Phase 4) — request **in context**, after
    explaining why, not on first launch.
- **No tracking / no IDFA.** Athar shows no ads and runs no analytics SDKs. Do
  not link `AppTrackingTransparency`. Keep it that way to stay in the simplest
  privacy tier.

## 3. Accounts & Sign-In (Guideline 4.8, 5.1.1(v))

- **Phase 1:** No account required — core value (Qadha) works fully offline and
  anonymous. This satisfies "let users use the app without forcing a login."
- **Phase 3 (when auth is added):**
  - If we offer **any** third-party/social login (Google, etc.), we **must** also
    offer **Sign in with Apple** (4.8) — or use only email login with no social
    options, which avoids the requirement entirely. Recommended: email-only via
    Supabase to keep it simple.
  - Provide **in-app account deletion** (5.1.1(v)) — not just deactivation. A
    "Delete account" action that removes the Supabase user and their data.
  - Account creation must collect only data strictly needed (email).

## 4. User-Generated Content — Mosque Wiki (Guideline 1.2)

This is the **highest-risk** area for review and **must** ship with all of the
following the day the Mosque Wiki goes live (Phase 3):

1. A **method to filter objectionable content** before it appears (moderation
   queue or automated checks on submissions).
2. A **mechanism for users to flag/report** objectionable content.
3. A **mechanism to block abusive users**.
4. **Published contact** so users can reach us (the `salam@try-athar.com` support
   address + Support URL).
5. Act on reports and **remove content within 24 hours**, removing the offending
   user if needed.
6. An **EULA** stating there is zero tolerance for objectionable content or
   abusive users (linked from the submission UI). Apple's standard EULA + our
   Terms cover this.

> Practical: gate first-time mosque edits behind a short community-guidelines
> screen, store a `reported` flag in Postgres, and keep an admin review view.

## 5. Religious Content (Guideline 1.1)

- Quran/Hadith text and explanations are presented respectfully and from
  reputable open sources (sunnah.com / hadithapi datasets). Cite collection and
  grading. Apple permits religious apps; avoid editorializing that could read as
  hateful toward any group.

## 6. Minimum Functionality & Design (Guideline 4.2)

- Athar is a **native React Native (Expo)** app, not a repackaged website, and
  delivers offline utility on day one (Qadha tracker). This clears the
  "minimum functionality" bar that rejects thin apps.

## 7. Maps & Data Attribution

- Using **OpenStreetMap** tiles requires visible **"© OpenStreetMap
  contributors"** attribution on the map screen (ODbL). Add it to the Mosques
  screen in Phase 3.

## 8. Performance (Guideline 2.1)

- App must launch without crashes and not reference placeholder content in a way
  that looks unfinished. The "Coming soon" tabs are acceptable as a roadmap, but
  before submission consider hiding not-yet-functional tabs or clearly framing
  them as upcoming (they currently are).

## 9. Pre-submission checklist

- [ ] Replace placeholder `assets/*.png` with final 1024² icon (no alpha for
      iOS icon) and splash art.
- [ ] Privacy, Terms, Support pages live at the URLs above (HTTPS).
- [ ] App Privacy questionnaire completed in App Store Connect.
- [ ] Permission strings present **only** for shipped features.
- [ ] Sign in with Apple present **iff** any social login exists (Phase 3).
- [ ] In-app account deletion present **iff** accounts exist (Phase 3).
- [ ] UGC moderation + report + block + EULA live (Phase 3).
- [ ] OSM attribution visible on map (Phase 3).
- [ ] Test on a physical device; no crashes, no broken links.
- [ ] Demo account / notes in App Review information if login is required.
