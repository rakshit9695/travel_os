# Voyage — The Mishra Family Switzerland Travel OS 🇨🇭

> A bespoke, offline-first travel app for one family's first trip to Switzerland (16–25 June 2026).
> Built to feel like a finished premium product: calm, confident, and useful on the ground — even with no signal.

![tech](https://img.shields.io/badge/React-18-0F3D3E) ![tech](https://img.shields.io/badge/Vite-5-14524F) ![tech](https://img.shields.io/badge/TypeScript-5-1A726C) ![tech](https://img.shields.io/badge/PWA-installable-2BB6AB)

---

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). **No environment variables required** — the app boots fully seeded with the real trip, the concierge runs on its local engine, and weather uses the no-key Open-Meteo source (falling back to seeded data offline).

```bash
npm run build     # type-check + production build (also generates the PWA service worker)
npm run preview   # serve the production build locally
```

---

## What's inside

| Area | Highlights |
|---|---|
| **Home / Readiness** | Live departure countdown, animated 0–100 **Travel Readiness** ring with an expandable breakdown, at-a-glance cards (next event, weather, budget, packing), and a "Today / Up next" block driven by the real date. |
| **Itinerary** | The centerpiece. All 8 on-ground days pre-built into **Morning / Afternoon / Evening / Night** blocks with activities, travel legs (mode · duration · cost), meals, weather, crowd level, notes, and a **realism engine** that flags tight or over-packed days. One-tap **Maps** + **SBB** deep links. Add/remove activities (persisted). |
| **Bookings** | Both Etihad journeys with the **Abu Dhabi layover modeled explicitly** (BOM→AUH→GVA, ZRH→AUH→BOM), boarding countdown, baggage, terminals, suggested airport-arrival time. Three rich stay cards with maps, call links, travel-from-previous-stop and nearby food/sights. |
| **City Guides** | Lausanne / Interlaken / Lucerne, each with hero, overview, an embedded **Leaflet map**, curated **Activities** and **veg-first Food** (filter is first-class). Interlaken has a dedicated **Alpine Excursions** section with altitudes, weather flags and Swiss Travel Pass economics. |
| **Budget** | Locked ₹6L committed shown as context; the **live ₹5L managed actively**: planned vs actual, category donut + bar charts, daily burn, projected total, over-budget warnings, editable INR⇄CHF rate, **split among the 4 travelers**, and add-expense with a **photo receipt stored in IndexedDB**. |
| **Packing** | **Altitude-and-activity-aware** lists — summer valley basics for everyone, warm layers/gloves flagged **only** for the alpine days (Jungfraujoch, First, Pilatus). Luggage inventory, "which bag has the chargers?" lookup, and leaving-a-location reminders. Feeds the readiness score. |
| **AI Concierge** | Chat grounded in your **live trip snapshot** (today's plan, weather, budget). Hugging Face when a token is configured, **local rules engine otherwise** — answers the canned questions offline. Suggested-question chips. |
| **Documents** | Passports, tickets, hotel & visa confirmations stored **on-device** (IndexedDB), tagged per traveler, "who carries what", attach a scan/photo, view offline. OCR is intentionally manual in v1. |
| **Family & Safety** | Editable profiles (dietary, allergies, meds, emergency contacts), a per-city safety card (112 / 117 / 144 / 1414, nearest hospital, Indian consular help, scams, etiquette, French/German phrases), and a **simulated live location-sharing** tab with a "someone fell behind" alert (clearly labeled demo — no real tracking). |
| **Weather Watch & Rebalance** | On the Itinerary: scans the forecast, flags weather-sensitive days, gives smart recommendations, and offers a safe one-tap **day swap** (same-city activity days only — transfer/flight days stay put). |
| **Memory Book** | A post-trip archive that's pre-generated from the itinerary: route map, trip stats, spend recap, and a day-by-day journal with a **Share** button (native share / clipboard) and per-day photo slots. |

### Theme
"Midnight Alpine" — a **dark-default** scheme of cool slate-navy surfaces with a refined azure accent and a Swiss-red micro-accent. A polished light mode is available via **Settings → theme toggle**.

---

## Offline-first by design (built for the demo)

The hard rule: **nothing ever shows a blank screen, an endless spinner, or a raw error.**

- **Seeded data is the source of truth.** All trip content ships as typed TypeScript fixtures in `src/data/` and is hydrated into **IndexedDB** on first run. Every edit (expenses, packing, itinerary, profiles, documents) persists locally and survives reloads — no backend.
- **External calls degrade gracefully.** Weather renders seeded values **instantly**, then silently upgrades to live Open-Meteo if the network resolves. The concierge tries the serverless proxy, then falls back to the local engine. Map tiles, fonts and images are cached by the service worker.
- **Imagery never breaks.** Hero/scene art is rendered as gorgeous **procedural SVG** keyed per location (mountains, lakes, towns, glaciers) — 100% offline. Real photography can be layered on top (see below) and fades in only when it loads.
- **PWA.** Installable, with an app-shell + runtime cache (Workbox). Fully usable offline after the first load.
- An **ErrorBoundary** turns any unexpected render error into a calm, on-brand recovery card.

### Demo tip — simulate being on the trip
Open **Settings** (gear icon, top-right on mobile / bottom of the sidebar on desktop) → **Simulate date** to jump to e.g. *18 Jun* or the *alpine day (20 Jun)* and see the on-trip state, today's weather and live "now" markers. "Reset to seed data" restores everything.

---

## Optional keys (the app needs none)

Copy `.env.example` → `.env` and fill in only what you want:

| Var | Effect if **set** | Effect if **empty** (default) |
|---|---|---|
| `HF_TOKEN` | The concierge calls the **Hugging Face Inference API** through the serverless proxy. | Concierge uses the **local rules engine** — same canned answers, fully offline. |
| `HF_MODEL` | Override the hosted instruct model. | Defaults to a Llama-3 instruct chat model. |

**The Hugging Face token is never exposed to the client.** The browser talks only to `/api/concierge` (see `api/concierge.ts`), an edge-style serverless function deployable on **Vercel** (drop-in `/api` route) or adaptable to Netlify. `npm run dev` does not run the proxy — the client fetch fails fast and falls back to local, which is the intended local-demo path. The current trip context is injected into the system prompt server-side.

---

## Tech stack

React 18 + Vite + TypeScript · Tailwind (tokenized design system, light + dark) · Framer Motion · lucide-react · React Router · Recharts (budget) · Leaflet + OpenStreetMap (maps) · `idb` (IndexedDB) · `vite-plugin-pwa` (Workbox).

## Project structure

```
src/
  data/        # typed seed fixtures — the real trip (travelers, flights, stays,
               # activities, food, itinerary, budget, packing, docs, safety, weather)
  lib/         # db (IndexedDB), store (context + mutations), selectors, readiness,
               # weather, currency/date format, concierge (context + local engine + hook)
  components/  # SmartImage (scene art), MiniMap, layout/AppShell, ui primitives, Logo…
  pages/       # Dashboard, Itinerary, Bookings, CityGuides, Budget,
               # Packing, Concierge, Documents, Family
api/
  concierge.ts # serverless proxy (keeps HF_TOKEN server-side; falls back to local)
scripts/
  generate-icons.mjs  # zero-dep PNG app-icon generator
```

### Adding real photography (optional)
Scene art is the reliable baseline. To layer real photos, populate the `PHOTO_URLS`
map in `src/components/SmartImage.tsx` with `{ imageKey: 'https://…' }`. They fade in
on successful load and fall back to the SVG art on any error — so the demo stays flawless.

---

## Trip facts encoded (accuracy matters)

- Etihad flights are **connections via Abu Dhabi**, never shown as direct.
- **June is summer** in the valleys (18–26°C); warm-layer packing is generated **only** for high-altitude excursion days, driven by altitude — not the calendar.
- **CERN** is presented as a **Lausanne-phase day-trip to Geneva/Meyrin** (~45-min train), with "book the free guided tour ahead" surfaced as a task.
- Swiss plug type **J**; emergency **112**. Vegetarian filtering is first-class everywhere.

Made with care — *for the Mishra family.* 💚
