# Hadith data sources — evaluation & recommendation

_Last reviewed: 2026-06-29_

Athar is **offline-first and privacy-first**. The hadith feature must keep working
with **no network and no API key**, and we must not commit secrets or bloat the
bundle. This note compares the candidate APIs against those constraints and
records what we decided to do.

## What we already ship

- `src/features/hadith/data.ts` — ~41 curated, richly detailed bilingual hadiths
  (narrator, isnād, plain-language explanation, grade).
- `src/features/hadith/corpus.json` — ~3,000 narrations across the six books
  (~4.9 MB), generated **at build time** by `scripts/fetch-hadiths.js` from the
  free, no-key **fawazahmed0** CDN. Lazy-loaded so it never slows startup.

So the offline library is already backed by an open dataset. The question is
whether an online API can *extend* it without compromising the offline-first
model.

## The candidates

| Source | Key? | Cost | Languages | Grading | License | Offline-first fit |
|---|---|---|---|---|---|---|
| **fawazahmed0/hadith-api** (jsDelivr CDN) | **No** | Free | ar, en + many | Sunan books carry named gradings; Bukhārī/Muslim ship empty (we assert *sahih* by consensus) | **Unlicense (public domain)** | **Excellent** — static JSON, no key, no rate limits; bundle at build time *and* fetch at runtime |
| **hadithapi.com** | **Yes** | Free tier | ar, ur, en | Yes | Unclear / not redistributable without checking | Poor — key can't be committed; would need an `EXPO_PUBLIC_*` opt-in |
| **sunnah.com/developers** | **Yes** (gated, approval required) | Free, non-commercial | ar, en | Authoritative | Restrictive; redistribution not permitted, attribution required | Poor — key gated + can't ship the data offline |
| **AhmedBaset/hadith-api** | Self-host | Free (you host) | en-focused | Limited | Unspecified | Poor — no official hosted endpoint; we'd run a server (against privacy-first/no-backend goal) |
| **ummah.build Hadith API** | No | Free | Multiple | Yes | Unclear; single-maintainer longevity risk | Fair — usable but less proven/permissively-licensed than fawazahmed0 |

Notes:
- **No source offers a lightweight no-key full-text _search_ endpoint.** Keyed
  APIs (hadithapi.com) have search but require a secret; static CDNs
  (fawazahmed0) have no search server, so "online search" means fetching a
  collection edition and searching it client-side.
- sunnah.com is the gold standard for authenticity but its key is approval-gated
  and its terms don't allow shipping the corpus offline — a non-starter for an
  offline-first app.

## Recommendation

**Stay on fawazahmed0 as the single backing source, for both the bundled offline
corpus and an _optional_ online layer.** It is the only candidate that is
simultaneously: free, **no key**, **public-domain licensed**, bilingual (ar+en),
graded for the Sunan books, and servable as static JSON we can bundle.

We do **not** integrate any key-based API into the runtime. If a maintainer ever
wants richer/searchable data they can wire a keyed source behind an
`EXPO_PUBLIC_*` env var that degrades gracefully when absent (mirroring how
`src/lib/supabase.ts` treats Supabase as optional) — but that is explicitly out
of scope here to keep the app key-free.

## What we changed (conservatively)

The bundled corpus only contains the **first ~500 narrations of each book**
(~3,000 total) to keep the app small, while the full collections hold ~34,000.
So we added one low-risk enhancement, layered strictly **on top of** the offline
library:

- `src/features/hadith/online.ts` — an **optional** online layer over the
  fawazahmed0 CDN (no key, public domain):
  - `fetchHadithById(id)` — a tiny single-hadith fetch used as a **last-resort
    fallback** in the detail screen, so a reference beyond the bundled set (e.g.
    a scanned/deep-linked hadith) can still resolve **when online**.
  - `searchFullCollectionOnline(query, collection)` — downloads the selected
    book's edition once per session (minified JSON, cached in memory) and runs
    the existing search over it, so a user can opt in to searching the *whole*
    book.
- The Hadith search screen shows a **"Search all of {book} online"** button only
  when a single collection is selected and a query is present. It is purely
  additive: results merge under the offline results, de-duplicated by id.

### Why this is safe

- **Offline-first preserved.** Nothing in the default browse/search/detail path
  calls the network. The online button is opt-in; every online call is wrapped
  in try/catch and silently falls back to the offline corpus on failure.
- **No secrets.** fawazahmed0 needs no key; nothing is committed.
- **No bundle bloat.** The online editions are fetched at runtime on demand and
  cached only in memory — they are never added to the shipped bundle.
- **Authenticity.** Online results reuse the same honest grading rules as the
  build script: Bukhārī/Muslim → *sahih* (consensus), Sunan books → first named
  grading, otherwise *Ungraded*. We never assert *sahih* without a basis.

### What we deliberately did NOT do

- No keyed API integration (hadithapi.com / sunnah.com) — would require a
  committed or user-supplied secret and can't be shipped offline.
- No dramatic enlargement of the bundled `corpus.json` — it is already ~4.9 MB;
  multiplying it would bloat the download for marginal offline benefit.
</content>
