# 🎬 StreamVerse

A sleek, Netflix-style movie & TV streaming front-end. Browse, search, and watch
thousands of titles using **four interchangeable embed providers**, with a
customizable theme, continue-watching history, and a fully responsive UI.

> ⚠️ **Disclaimer:** StreamVerse hosts **no media files**. It is a static front-end
> that links to third-party, non-affiliated embed players (CineSrc, VidLink, VidSrc,
> VidKing). It is intended as a demonstration interface. Ensure you have the right to
> view any content you stream.

---

## ✅ Completed Features

- **Dynamic homepage** with a randomized trending hero banner and 9 content rows
  (Trending, Popular Movies/TV, Now Playing, Top Rated, plus genre rows).
- **Browse & Search** page with infinite scroll, genre filter chips, and a multi-search.
- **Watch page** with a 16:9 embedded player and **4 switchable servers**.
- **Multi-provider engine** — each provider has its own URL builder so the same
  title plays across all four sources:
  - **CineSrc** (`cinesrc.st`)
  - **VidLink** (`vidlink.pro`)
  - **VidSrc** (`vidsrc-embed.ru`)
  - **VidKing** (`vidking.net`)
- **TV support** — season selector + episode grid (with episode stills & overviews).
- **Customization drawer** (⚙️ icon):
  - 9 preset accent colors **+ custom color picker** (applies to site theme *and* is
    passed to every player as its accent/primary color).
  - Default server selection.
  - Autoplay & start-muted toggles (forwarded to players).
  - Optional personal **TMDB API key**.
  - Clear watch history.
- **Continue Watching** — playback progress is captured from player `postMessage`
  events (multiple protocols supported) and stored in `localStorage`; resumes via the
  player's start-time parameter.
- **Keyboard shortcuts** — press **1–4** on the watch page to switch servers instantly.
- **Cast & "More Like This"** recommendation rows on the watch page.
- Fully **responsive** with skeleton loaders, smooth animations, and a custom dark theme.

---

## 🗂️ Functional Entry Points (URIs & Parameters)

| Path | Parameters | Description |
|------|------------|-------------|
| `index.html` | — | Homepage: hero, rows, continue-watching |
| `browse.html` | `q={query}` | Search results (movies + TV) |
| `browse.html` | `type=movie\|tv` | Popular movies / TV |
| `browse.html` | `type=movie\|tv&genre={id}` | Genre-filtered grid |
| `browse.html` | `trending=1` | Trending grid |
| `watch.html` | `type=movie&id={tmdbId}` | Watch a movie |
| `watch.html` | `type=tv&id={tmdbId}&s={season}&e={episode}` | Watch a TV episode |
| `watch.html` | `…&provider={cinesrc\|vidlink\|vidsrc\|vidking}` | Force a specific server |

All content is identified by **TMDB IDs**.

---

## 🧱 Data Models & Storage

No server database is used. State lives in the browser:

- **`localStorage.streamsettings`** — `{ color, autoplay, muted, defaultProvider }`
- **`localStorage.watchhistory`** — array of `{ id, type, title, poster, year, season, episode, progress, duration, updated }`
- **`localStorage.tmdb_key`** — optional user-supplied TMDB API key.

Metadata (titles, posters, cast, seasons, search) is fetched live from the
**TMDB API** (`api.themoviedb.org/3`). A public demo key is bundled; users can supply
their own in Settings.

---

## 📁 Project Structure

```
index.html        Homepage
browse.html       Browse / search grid
watch.html        Player + details + episodes
css/
  style.css       Global theme, header, cards, drawer
  watch.css       Player page styling
js/
  tmdb.js         TMDB API wrapper
  providers.js    The 4 embed-provider URL builders
  settings.js     Settings drawer, theme, watch-history store
  app.js          Homepage rendering + shared card helpers
  watch.js        Player, server switching, episodes, events
  browse.js       Search / browse / infinite scroll
```

---

## 🚧 Not Yet Implemented / Ideas

- Server-side user accounts & cross-device sync (requires a backend — out of scope for a static site).
- Watchlist / favorites (could be added with the same localStorage pattern).
- Anime browsing (VidLink supports MyAnimeList IDs; would need a MAL data source).
- Subtitle URL passthrough UI (VidSrc/VidLink accept `sub_url`).

## ▶️ Recommended Next Steps

1. Add a **Watchlist** ("My List") using `localStorage`, surfaced as a homepage row.
2. Add **filter sorting** (by rating / release date) to the browse page.
3. Add a **subtitle uploader** field on the watch page for providers that support it.

---

## 🚀 Deployment

To make the site live, open the **Publish tab** and publish with one click — it handles
deployment automatically and gives you the live URL.
