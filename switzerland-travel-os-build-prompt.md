# BUILD PROMPT — "Voyage" : The Mishra Family Switzerland Travel OS

> Paste everything below into a fresh **Claude Opus 4.8** session. It is self-contained.

---

## 0. ROLE & MISSION

You are a senior full-stack product engineer + product designer. Build a **personal, production-grade travel web application** for one specific family's one specific trip. This is not a generic SaaS — it is a bespoke, beautiful, deeply opinionated "Travel Operating System" pre-loaded with this family's real itinerary.

**Emotional bar:** This is the developer's first time showcasing his work to his family. The app must feel like a finished commercial product — confident, calm, premium. "Stunning" is a hard requirement, not a nice-to-have. If a feature can't be made beautiful, cut it rather than ship it half-built.

**Hard rule on robustness:** This will be demoed live, possibly on hotel/airport wifi or offline. **Nothing may ever show a blank screen, a spinner that never resolves, or a raw error.** Every external dependency must degrade gracefully to seeded/cached data. A flawless offline demo beats a fragile live-API demo. Build for the demo first.

---

## 1. THE TRIP (this is real data — seed the app fully populated with it)

**Trip:** Switzerland, first family visit. **16 June 2026 → 25 June 2026** (on-ground 17–24 June).

**Travelers (4):**
| Name | Role | Age | Notes |
|---|---|---|---|
| Nitin Mishra | Father | adult | |
| Rachana Mishra | Mother | adult | |
| Rakshit Mishra | Son (the developer) | 22 | trip coordinator / app owner |
| Ronit Mishra | Son | 17 | minor |

Assume Indian passport holders, Schengen visa obtained, home base Mumbai (BOM). Default dietary preference: include strong vegetarian options (common for Indian families — make veg filtering first-class, not an afterthought). Let each profile be editable.

**Flights — Etihad, routed via Abu Dhabi (AUH). These are CONNECTIONS, not direct. Model layovers.**

- **Outbound:** BOM → AUH → **GVA (Geneva)**. Departs BOM **16 Jun ~23:03**, arrives **GVA 17 Jun ~07:15** (local). After GVA arrival, train to Lausanne (~40–45 min).
- **Return:** **ZRH (Zurich)** → AUH → BOM. Departs **ZRH 24 Jun ~15:55**, arrives **BOM 25 Jun ~07:15**. On 24 Jun the family leaves Lucerne early for Zurich Airport (~1 hr by train); build in airport-arrival buffer (be at ZRH ~3 hrs before international departure).

**Accommodation:**
| # | City | Dates | Property | Type |
|---|---|---|---|---|
| 1 | **Lausanne** | 17 Jun (check-in on arrival day) → 19 Jun | Hôtel de la Paix Lausanne | Hotel |
| 2 | **Interlaken (Matten bei Interlaken)** | 19 Jun → 22 Jun | "apartment2lakes" | Airbnb apartment |
| 3 | **Lucerne** | 22 Jun → 24 Jun (early departure 24th) | Pilatus Apartments | Apartment |

**Budget:**
- Flights + hotels + visa: **₹6L — already spent (locked, display as committed).**
- **₹5L remaining** for activities + food + local transport + misc. This is the *live* budget the app actively manages.
- Currency: spend is in **CHF**; show INR⇄CHF conversion everywhere. Switzerland is expensive — the budget tool should feel genuinely useful, not decorative.

**Phase structure for the itinerary:**
1. **Lausanne (2 days, 17–19 Jun)** — activities + food. **Must include a CERN day-trip** (CERN is in Meyrin near Geneva, ~40–50 min train from Lausanne; free guided tours require advance booking — surface this as a to-do).
2. **Interlaken region (3 days, 19–22 Jun)** — activities + food + **the mountain/alpine experiences belong here** (Jungfraujoch, Grindelwald [user wrote "Griendfield"], Lauterbrunnen, Schilthorn/Piz Gloria, First, Harder Kulm, lakes Thun & Brienz).
3. **Lucerne (2 days, 22–24 Jun)** — activities + food (Mt. Pilatus, Mt. Rigi, Chapel Bridge, Lake Lucerne cruise, Old Town).

**Seasonality correction (important):** Mid-June is **summer** in the valleys (pleasant, 18–26°C) — NOT winter. Do **not** generate winter packing advice for valley days. BUT high-altitude excursions (Jungfraujoch ~3,454 m, Schilthorn ~2,970 m, Glacier 3000) are **near-freezing and snowy year-round** — packing logic must be **altitude-and-activity-driven**, generating a warm-layers reminder only on days with an alpine excursion.

---

## 2. TECH STACK (use exactly this unless a swap is clearly better — if so, justify briefly)

- **Frontend:** React (Vite + TypeScript). Tailwind CSS for styling. `framer-motion` for motion. `lucide-react` for icons. `react-router-dom` for routing. A lightweight charting lib (Recharts) for the budget views. Make it a **PWA** (installable, offline-capable via service worker + cached app shell + cached seed data).
- **State/Data:** All trip data ships **seeded in the repo** as typed TypeScript fixtures (see §5 data model). Persist user edits to **IndexedDB** (e.g. via `idb` or Dexie) so the app works fully offline and survives reloads. Do **not** use localStorage for large objects.
- **AI layer — Hugging Face:** The concierge is powered by the **Hugging Face Inference API** (or Inference Endpoints) calling a hosted instruct LLM (e.g. a Llama-3.x-Instruct or Qwen-Instruct chat model available on HF). Calls go through a thin serverless proxy function (so the HF token is never in the client). **Provide the proxy as a Vite-friendly serverless function** (e.g. a `/api` route deployable on Vercel/Netlify) AND a clean client hook (`useConcierge`).
  - **Critical fallback:** if no HF token is configured or the call fails, the concierge must fall back to a **local rules-based engine** that answers the canned questions (see §4.7) from seeded itinerary/weather/budget data, so the demo never breaks. Detect token presence at runtime and pick the path silently.
- **External real-time data (weather, transit, flight status):** integrate where a free/no-auth source exists (e.g. Open-Meteo for weather needs no key). For anything requiring keys, **stub with realistic seeded data and clearly isolate the integration point** behind an interface, with the seed as default. Never let a missing key break a screen.
- **Maps:** use map deep-links (Google Maps / Swiss SBB) via `https://` URLs for one-click navigation and transit, plus an embedded lightweight map (Leaflet + OpenStreetMap tiles, no key) for the itinerary map view.

Deliver a **runnable repo**: `package.json`, `npm install && npm run dev` works out of the box with zero keys (falls to seed + local concierge); a `.env.example` documents optional keys (`HF_TOKEN`, etc.); a `README.md` explains run, the offline-first design, and where to add keys.

---

## 3. DESIGN SYSTEM ("Travique"-grade — this is half the assignment)

Reference vibe: modern premium travel-tech dashboard (clean, card-based, generous whitespace, soft shadows, large rounded corners, big beautiful imagery, calm confident palette, timeline-driven). Aim for the polish of a top Behance/Dribbble travel concept.

**Implement a real design system, tokenized in Tailwind config:**

- **Palette:** an alpine-inspired calm scheme. Suggested: deep evergreen / pine as primary (e.g. `#0F3D3E`–`#14524F`), a warm glacier-mint or teal accent (e.g. `#4FD1C5`/`#7BDCB5`), soft off-white canvas (`#F7F8F5`), charcoal ink for text (`#1A1F1C`), with a Swiss-red micro-accent (`#E4322B`) used *sparingly* (alerts, the readiness ring, flag motifs). Provide a polished **dark mode** too.
- **Typography:** a confident geometric/grotesque sans for headings (e.g. "Plus Jakarta Sans", "Satoshi", or "General Sans") and a clean readable body sans (e.g. "Inter"). Big type scale, tight headings, airy body.
- **Surfaces:** cards with `rounded-2xl`/`rounded-3xl`, layered soft shadows, subtle borders, glassy headers. Consistent 4/8px spacing grid.
- **Imagery:** use high-quality Swiss photography (Lausanne lakefront, Jungfrau, Grindelwald, Lucerne Chapel Bridge, etc.). Pull from a free source (Unsplash source URLs / Pexels) with graceful fallbacks to gradient placeholders if offline. Each city and major attraction gets a hero image.
- **Motion:** tasteful `framer-motion` — page transitions, card hover lift, number count-ups on the dashboard, the readiness ring animating on load, smooth timeline expand/collapse. Never gratuitous; everything should feel like it has weight and ease.
- **Layout:** responsive, but **mobile-first** (the family will use phones on the ground) with a clean desktop dashboard layout. Persistent bottom tab bar on mobile / sidebar on desktop.
- **Personalization touch:** branded splash / header — "Voyage · Mishra Family · Switzerland 2026" with the trip countdown. Small delightful family touches (the four avatars, a personalized welcome). Make it feel *theirs*.

Name the app something elegant (suggest **"Voyage"** or **"Alpana"** — let it have a logo mark, even a simple SVG).

---

## 4. FEATURES — build in priority order. Ship P0 fully and beautifully before P1.

### P0 — The core demo (must be flawless)

**4.1 Home / Readiness Dashboard**
- Countdown to departure (live ticking).
- **Travel Readiness Score** (animated ring, 0–100) composed of: documents complete, packing %, budget on-track, all bookings confirmed, weather checked. Tapping it expands the breakdown.
- At-a-glance cards: next event (with live countdown), today's weather for current city, days remaining, budget remaining (₹ and CHF), packing %.
- "Today" / "Up next" hero block driven by current date vs itinerary (for the demo, allow a hidden dev toggle to simulate "current date = 18 Jun" so you can show on-trip state).

**4.2 Smart Itinerary Timeline (the centerpiece)**
- Day-by-day, each day split into **Morning / Afternoon / Evening / Night** blocks.
- Each block shows: activities, travel legs (mode + duration + cost), reservations, meal suggestions, weather for that day, expected crowd level, and notes.
- **Pre-populate the full 8-day itinerary** with the seed content in §6 — it must look like a thoughtfully hand-built plan, not empty scaffolding.
- Realism engine: flag rushed/over-packed days (too little transfer time, >X hours of transit), and show a gentle "this day looks tight" hint with a suggested fix.
- Each location: one-click **Maps** (navigation) + **SBB** (Swiss rail) deep links, with walking/train/bus/ferry options where relevant.
- Editable: add/remove/reorder activities; changes persist to IndexedDB.

**4.3 Bookings (Flights + Stays)**
- **Flights:** both Etihad journeys with **layover legs through AUH** modeled explicitly (BOM→AUH, AUH→GVA; ZRH→AUH, AUH→BOM). Show times, terminals (placeholder where unknown), baggage allowance, airline contact, and a boarding countdown on the day. Include "suggested airport arrival time."
- **Stays:** the 3 properties as rich cards — dates, check-in/out, address, map link, call link, "travel time from previous stop," and nearby food/attractions pulled from seed.

**4.4 City Guides (Lausanne / Interlaken / Lucerne)**
- Per city: hero, overview, curated **Activities** and **Food (veg-forward)** from §6, each as a card (image, why-go, cost estimate CHF, time needed, map link, "add to itinerary" button).
- Interlaken city guide must include a dedicated **Alpine Excursions** section (Jungfraujoch, Grindelwald-First, Lauterbrunnen, Schilthorn, Harder Kulm) with altitude, cost, weather-dependency flag, and Swiss Travel Pass / Jungfrau pass notes.

**4.5 Budget Manager**
- Locked committed spend (₹6L) shown as context; **live ₹5L** managed actively.
- Categories: Activities, Food, Local transport, Shopping, Misc. Planned vs Actual. Add expenses (with optional photo receipt → store image in IndexedDB). Auto INR⇄CHF conversion (seed a sensible rate, editable). Per-day burn rate, projected end-of-trip total, over-budget warnings. **Split among the 4 travelers.** Clean charts.

### P1 — Depth (build after P0 is polished)

**4.6 Packing Intelligence**
- Generate per-traveler, **altitude-and-activity-aware** packing lists from the itinerary (summer valley basics + warm layers/gloves only for alpine-excursion days; adapters [Switzerland = Type J], power banks, meds, documents). Checklists feed the readiness %.
- **Luggage inventory:** assign items to bags; "which bag has the chargers?" lookup. "Leaving-a-location" reminders (e.g. "Left Lausanne — confirm all 4 passports + chargers packed").

**4.7 AI Concierge (Hugging Face)**
- Chat UI. Must answer, grounded in seeded trip data: *"What should we carry today?"*, *"Can we fit another attraction before dinner?"*, *"Which train should we take next?"*, *"Where can we eat veg nearby?"*, *"What if it rains tomorrow?"*, *"How much have we spent so far?"*, *"Fastest route back to the hotel?"*
- Architecture: client → serverless proxy → HF Inference API, with the **current trip context (today's itinerary, weather, budget snapshot) injected into the system prompt**. Local rules-based fallback answers the same canned set offline. Suggested-question chips so the demo flows.

**4.8 Documents Vault**
- Store passports, tickets, hotel confirmations, visa, insurance (image/PDF in IndexedDB), tagged per traveler, viewable offline. Track "who carries what." (Real OCR auto-extraction is out of scope for v1 — provide manual entry with the *interface* designed as if OCR could be added; do not fake extraction.)

**4.9 Family & Safety**
- Family profiles (dietary, allergies, meds, emergency contacts, doc assignments).
- Safety card per city: local emergency number (**112** in CH; **117** police, **144** ambulance), nearest hospitals (seed), Indian embassy/consulate (Bern / consular contacts), common scam notes, etiquette/tipping (CH tipping is modest), key German/French phrases.

### P2 — Delight (only if time remains, must not destabilize P0/P1)

- **Weather-driven rebalancing** suggestions (swap an outdoor alpine day with an indoor Lucerne/museum day if forecast is bad).
- **Post-trip archive / memory book**: visited places, route map, expense summary, a shareable journal page.
- Family location-sharing / "someone fell behind" alerts — **stub/simulate only** (no real geolocation backend); present the UI honestly as a demo.

---

## 5. DATA MODEL (TypeScript — define cleanly, seed fully)

Define typed interfaces and ship populated fixtures:

```ts
Trip { id, title, startDate, endDate, baseCurrency:'CHF', homeCurrency:'INR', fxRate, travelers[], flights[], stays[], days[], budget }
Traveler { id, name, role, age, isMinor, dietary, allergies, meds[], emergencyContacts[], docAssignments[], avatar }
Flight { id, carrier:'Etihad', legs: FlightLeg[], baggageAllowance, contact }   // legs model the AUH layover
FlightLeg { from, to, depart, arrive, flightNo?, terminal? }
Stay { id, city, name, type:'hotel'|'airbnb'|'apartment', checkIn, checkOut, address, lat, lng, phone?, mapUrl, amenities[] }
Day { date, city, blocks: { morning, afternoon, evening, night } }      // each block: Activity[] + TravelLeg[] + meals[] + weatherRef
Activity { id, title, category, image, why, costCHF, durationMin, lat, lng, mapUrl, weatherDependent, altitudeM? }
TravelLeg { mode:'walk'|'train'|'tram'|'bus'|'ferry'|'cable-car'|'car', from, to, durationMin, costCHF, sbbUrl? }
Place(Food) { id, name, cuisine, vegFriendly:boolean, priceBand, area, mapUrl, note }
BudgetEntry { id, category, plannedCHF, actualCHF, paidBy, splitAmong[], receiptImageId? }
PackingItem { id, travelerId, label, bagId?, packed:boolean, reason }  // reason links to activity/altitude/weather
Doc { id, type, travelerId, fileBlobId, carriedBy }
```

---

## 6. SEED CONTENT (pre-populate — research-grade, accurate, family + veg friendly)

Generate a rich, realistic, *correct* set. Use your knowledge of Switzerland; keep costs as honest CHF estimates. Minimums:

**Lausanne (2 days) — activities:** Ouchy lakefront & Lake Geneva promenade; Olympic Museum; Lausanne Cathedral & Old Town; Lavaux vineyard terraces (UNESCO); **CERN day-trip via Geneva** (flag: book free guided tour in advance; Microcosm/Science Gateway exhibits); optional Chillon Castle (Montreux) or Geneva Jet d'Eau. **Food:** veg-forward cafés/restaurants in Ouchy & Flon, an Indian/veg option, a fondue spot (note veg fondue), lakeside casual eats.

**Interlaken region (3 days) — alpine excursions:** Jungfraujoch "Top of Europe" (~3,454 m, full day, premium cost, warm layers); Grindelwald–First (cliff walk, First Flyer); Lauterbrunnen valley & Trümmelbach Falls; Schilthorn / Piz Gloria; Harder Kulm (sunset over Interlaken); Lake Thun / Lake Brienz boat. Note Swiss Travel Pass & Jungfrau Travel Pass economics. **Food:** veg-friendly spots in Interlaken & Matten, Indian restaurant option, mountain-station eateries, picnic-from-Coop tip (budget lever).

**Lucerne (2 days) — activities:** Chapel Bridge & Water Tower; Old Town (Altstadt); Lion Monument; **Mt. Pilatus** (golden round-trip: cogwheel + cable car) or **Mt. Rigi**; Lake Lucerne cruise; KKL waterfront. **Food:** veg-friendly Old Town restaurants, an Indian/veg option, lakeside cafés.

For each: image, one-line "why," CHF cost estimate, time needed, map link, weather-dependency flag, and whether it's already on the itinerary.

---

## 7. BUILD APPROACH & DELIVERABLES

1. Start with architecture + design tokens + seed data + the data layer (IndexedDB hydrated from fixtures).
2. Build P0 screens fully and beautifully (Dashboard → Itinerary → Bookings → City Guides → Budget). Get these *stunning* before moving on.
3. Then P1 (Packing, Concierge, Documents, Family/Safety). Then P2 only if stable.
4. After each phase, give me: what's done, how to run it, and the next phase plan.

**Acceptance criteria:**
- `npm install && npm run dev` runs with **zero env vars** and shows the fully seeded app (concierge in local-fallback mode, weather via no-key source or seed).
- Fully usable **offline** after first load (PWA).
- Looks like a finished premium product on a phone and on desktop, light and dark.
- All trip facts above are correct in the app (flights via AUH, correct dates/properties, summer-not-winter packing, CERN as a Lausanne-day Geneva trip).
- No blank states, no infinite spinners, no raw errors anywhere.

**Quality bar reminder:** this is a son showing his family what he can build. Sweat the details — copy, spacing, imagery, motion, empty-state-that-isn't-empty. Make them proud.

---

## 8. THINGS TO GET RIGHT (common traps)

- Etihad flights are **connections via Abu Dhabi**, not direct — model layovers.
- **June = summer**; warm-layer packing only for **alpine-excursion days**, driven by altitude, not the calendar.
- Swiss plug type is **J**; emergency number **112**.
- CERN is by **Geneva (Meyrin)**, reachable from Lausanne by ~45-min train — present it as a Lausanne-phase day-trip, and surface "book the free guided tour ahead of time" as a task.
- Make **vegetarian filtering first-class** in every food list.
- Keep all secrets server-side; client never sees `HF_TOKEN`.
- Degrade gracefully **everywhere** — seed beats live for this demo.

Build it. Show your plan, then ship P0.
