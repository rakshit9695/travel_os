import type { Day, TravelLeg } from '../types';

const sbb = (from: string, to: string) =>
  `https://www.sbb.ch/en/buying/pages/fahrplan/fahrplan.xhtml?von=${encodeURIComponent(
    from
  )}&nach=${encodeURIComponent(to)}`;

let legId = 0;
const leg = (l: Omit<TravelLeg, 'id'>): TravelLeg => ({ id: `leg-${++legId}`, ...l });

// Full journey: 16 Jun departure → 25 Jun home. Core on-ground days 17–24 (Day 1–8).
export const days: Day[] = [
  {
    id: 'd-16',
    dayNumber: 0,
    date: '2026-06-16',
    city: 'Zurich', // placeholder; this is the Mumbai departure day
    phase: 'Travel',
    title: 'Departure from Mumbai',
    summary: 'Evening departure — Etihad EY 203 to Abu Dhabi, connecting to Geneva overnight.',
    blocks: {
      morning: { activities: [], travel: [], meals: [], notes: 'Final packing check. Confirm all 4 passports, visas, Swiss Travel Pass QR codes.' },
      afternoon: { activities: [], travel: [], meals: [{ id: 'm-16a', label: 'Light dinner at home before airport' }], notes: 'Reach BOM T2 by ~20:00 (3 hrs before international departure).' },
      evening: {
        activities: [],
        travel: [
          leg({ mode: 'car', from: 'Home (Mumbai)', to: 'BOM Terminal 2', durationMin: 60, costCHF: 0, note: 'Cab / drop-off' }),
        ],
        meals: [],
        notes: 'Check-in, immigration, security.',
      },
      night: {
        activities: [],
        travel: [
          leg({ mode: 'flight', from: 'BOM', to: 'AUH', durationMin: 202, costCHF: 0, note: 'EY 203 · dep 23:03' }),
        ],
        meals: [],
        notes: 'Overnight flight. Try to sleep after the AUH connection to beat jet lag.',
      },
    },
  },
  {
    id: 'd-17',
    dayNumber: 1,
    date: '2026-06-17',
    city: 'Lausanne',
    phase: 'Lausanne',
    title: 'Arrival — Geneva → Lausanne, lakeside Ouchy',
    summary: 'Land at Geneva, train to Lausanne, settle in, and ease into the trip with the lakefront, the Olympic Museum and the Old Town at golden hour.',
    blocks: {
      morning: {
        activities: [],
        travel: [
          leg({ mode: 'flight', from: 'AUH', to: 'GVA', durationMin: 400, costCHF: 0, note: 'EY 51 · arrive 07:15' }),
          leg({ mode: 'train', from: 'Genève-Aéroport', to: 'Lausanne', durationMin: 45, costCHF: 27, sbbUrl: sbb('Geneve-Aeroport', 'Lausanne'), note: 'Direct IR/IC, ~3–4/hr' }),
        ],
        meals: [{ id: 'm17a', label: 'Coffee & croissant at Lausanne station' }],
        notes: 'Drop bags at Hôtel de la Paix (early check-in if available; else store luggage).',
      },
      afternoon: {
        activities: ['a-olympic', 'a-ouchy'],
        travel: [leg({ mode: 'tram', from: 'Lausanne-Flon', to: 'Ouchy', durationMin: 8, costCHF: 4, note: 'Métro M2 downhill to the lake' })],
        meals: [{ id: 'm17b', label: 'Relaxed lunch by the lake', placeId: 'f-laus-ouchy' }],
        notes: 'Gentle first afternoon — jet lag is real. Lakefront + museum, no rush.',
      },
      evening: {
        activities: ['a-cathedral'],
        travel: [],
        meals: [{ id: 'm17c', label: 'First-night dinner', placeId: 'f-laus-holyveg' }],
        notes: 'Cathedral & Old Town at sunset; listen for the 22:00 night-watch call.',
      },
      night: { activities: [], travel: [], meals: [], notes: 'Early night to reset the body clock.' },
    },
  },
  {
    id: 'd-18',
    dayNumber: 2,
    date: '2026-06-18',
    city: 'Geneva',
    phase: 'Lausanne',
    title: 'CERN day-trip via Geneva',
    summary: 'Train to Meyrin for CERN, then Geneva\'s Jet d\'Eau and Old Town, back to Lausanne for a fondue dinner.',
    blocks: {
      morning: {
        activities: ['a-cern'],
        travel: [
          leg({ mode: 'train', from: 'Lausanne', to: 'Genève', durationMin: 40, costCHF: 27, sbbUrl: sbb('Lausanne', 'Geneve'), note: 'Then tram 18 to CERN / Meyrin' }),
          leg({ mode: 'tram', from: 'Genève Cornavin', to: 'CERN (Meyrin)', durationMin: 22, costCHF: 3, note: 'Tram 18, terminus CERN' }),
        ],
        meals: [{ id: 'm18a', label: 'Breakfast at hotel' }],
        notes: '⚠ Book the FREE CERN guided tour well in advance — they fill weeks ahead. Science Gateway exhibits are walk-in.',
      },
      afternoon: {
        activities: ['a-geneva-jetdeau'],
        travel: [leg({ mode: 'tram', from: 'CERN', to: 'Genève centre', durationMin: 22, costCHF: 3 })],
        meals: [{ id: 'm18b', label: 'Lunch in Geneva' }],
        notes: 'Jet d\'Eau, lakefront, and the cobbled Vieille Ville.',
      },
      evening: {
        activities: [],
        travel: [leg({ mode: 'train', from: 'Genève', to: 'Lausanne', durationMin: 40, costCHF: 27, sbbUrl: sbb('Geneve', 'Lausanne') })],
        meals: [{ id: 'm18c', label: 'Traditional fondue dinner (veg)', placeId: 'f-laus-fondue' }],
        notes: 'Cheese fondue is naturally vegetarian — a classic Swiss evening.',
      },
      night: { activities: [], travel: [], meals: [], notes: 'Pack tonight — checkout & move to Interlaken tomorrow.' },
    },
  },
  {
    id: 'd-19',
    dayNumber: 3,
    date: '2026-06-19',
    city: 'Interlaken',
    phase: 'Interlaken',
    title: 'Lausanne → Interlaken, Harder Kulm sunset',
    summary: 'Scenic train to the Jungfrau region, settle into apartment2lakes, and ride up to Harder Kulm for the two-lakes sunset.',
    blocks: {
      morning: {
        activities: [],
        travel: [
          leg({ mode: 'train', from: 'Lausanne', to: 'Interlaken Ost', durationMin: 125, costCHF: 68, sbbUrl: sbb('Lausanne', 'Interlaken Ost'), note: 'Via Bern, 1 change — beautiful ride' }),
        ],
        meals: [{ id: 'm19a', label: 'Checkout + station breakfast' }],
        notes: 'Checkout of Hôtel de la Paix by 11:00.',
      },
      afternoon: {
        activities: ['a-hoheweg'],
        travel: [],
        meals: [{ id: 'm19b', label: 'Stock the apartment from Coop', placeId: 'f-int-coop' }],
        notes: 'Self check-in at apartment2lakes (Matten). Stock the kitchen — big budget saver for the next 3 days.',
      },
      evening: {
        activities: ['a-harderkulm'],
        travel: [],
        meals: [{ id: 'm19c', label: 'Dinner cooked at the apartment', placeId: 'f-int-coop' }],
        notes: 'Harder Kulm funicular for sunset over Interlaken (weather permitting — otherwise tomorrow).',
      },
      night: { activities: [], travel: [], meals: [], notes: 'Early night — Jungfraujoch is a big, early day tomorrow.' },
    },
  },
  {
    id: 'd-20',
    dayNumber: 4,
    date: '2026-06-20',
    city: 'Interlaken',
    phase: 'Interlaken',
    title: 'Jungfraujoch — Top of Europe',
    summary: 'The headline alpine day: railway to 3,454 m, the Aletsch Glacier, Ice Palace and snow in June. Dress for near-freezing.',
    blocks: {
      morning: {
        activities: ['a-jungfraujoch'],
        travel: [
          leg({ mode: 'train', from: 'Interlaken Ost', to: 'Grindelwald Terminal', durationMin: 30, costCHF: 0, sbbUrl: sbb('Interlaken Ost', 'Grindelwald Terminal'), note: 'Then Eiger Express + cog railway' }),
        ],
        meals: [{ id: 'm20a', label: 'Early breakfast + pack a Coop picnic', placeId: 'f-int-coop' }],
        notes: '❄ ALPINE DAY (3,454 m): warm layers, gloves, hat, sunglasses, sunscreen. Go on a clear morning — check the live summit webcam first.',
      },
      afternoon: {
        activities: [],
        travel: [],
        meals: [{ id: 'm20b', label: 'Lunch at the summit (or picnic)', placeId: 'f-int-mountain' }],
        notes: 'Ice Palace, Sphinx terrace, Snow Fun park. Take it slow — the altitude is real.',
      },
      evening: {
        activities: [],
        travel: [leg({ mode: 'train', from: 'Grindelwald', to: 'Interlaken Ost', durationMin: 40, costCHF: 0, sbbUrl: sbb('Grindelwald', 'Interlaken Ost') })],
        meals: [{ id: 'm20c', label: 'Warm Indian dinner in town', placeId: 'f-int-indian' }],
        notes: 'Rest the legs after a long day at altitude.',
      },
      night: { activities: [], travel: [], meals: [], notes: '' },
    },
  },
  {
    id: 'd-21',
    dayNumber: 5,
    date: '2026-06-21',
    city: 'Interlaken',
    phase: 'Interlaken',
    title: 'Grindelwald-First + Lauterbrunnen valley',
    summary: 'Adventure morning at First (Cliff Walk, First Flyer) then the waterfalls of Lauterbrunnen and the Trümmelbach Falls inside the mountain.',
    blocks: {
      morning: {
        activities: ['a-grindelwald-first'],
        travel: [leg({ mode: 'train', from: 'Interlaken Ost', to: 'Grindelwald', durationMin: 35, costCHF: 0, sbbUrl: sbb('Interlaken Ost', 'Grindelwald') })],
        meals: [{ id: 'm21a', label: 'Breakfast at apartment' }],
        notes: '❄ First is 2,168 m — bring a warm layer even if Interlaken is sunny.',
      },
      afternoon: {
        activities: ['a-lauterbrunnen', 'a-trummelbach'],
        travel: [leg({ mode: 'train', from: 'Grindelwald', to: 'Lauterbrunnen', durationMin: 55, costCHF: 0, sbbUrl: sbb('Grindelwald', 'Lauterbrunnen'), note: 'Via Interlaken Ost or Zweilütschinen' })],
        meals: [{ id: 'm21b', label: 'Picnic lunch in Lauterbrunnen', placeId: 'f-int-coop' }],
        notes: 'Staubbach + Trümmelbach. Trümmelbach is indoors-ish — a good rainy-day fallback.',
      },
      evening: {
        activities: [],
        travel: [leg({ mode: 'train', from: 'Lauterbrunnen', to: 'Interlaken Ost', durationMin: 25, costCHF: 0, sbbUrl: sbb('Lauterbrunnen', 'Interlaken Ost') })],
        meals: [{ id: 'm21c', label: 'Veg pizza & pasta', placeId: 'f-int-veg' }],
        notes: 'Tight day — keep the afternoon flexible; drop Trümmelbach if running late.',
      },
      night: { activities: [], travel: [], meals: [], notes: 'Pack tonight — move to Lucerne tomorrow.' },
    },
  },
  {
    id: 'd-22',
    dayNumber: 6,
    date: '2026-06-22',
    city: 'Lucerne',
    phase: 'Lucerne',
    title: 'Interlaken → Lucerne, Old Town & Chapel Bridge',
    summary: 'The scenic Luzern–Interlaken Express, then Lucerne\'s Old Town, the Chapel Bridge and the Lion Monument.',
    blocks: {
      morning: {
        activities: [],
        travel: [leg({ mode: 'train', from: 'Interlaken Ost', to: 'Luzern', durationMin: 110, costCHF: 32, sbbUrl: sbb('Interlaken Ost', 'Luzern'), note: 'Luzern–Interlaken Express — one of Switzerland\'s loveliest rides' })],
        meals: [{ id: 'm22a', label: 'Checkout + breakfast' }],
        notes: 'Self check-in at Pilatus Apartments, near the Old Town.',
      },
      afternoon: {
        activities: ['a-chapelbridge', 'a-oldtown-luc'],
        travel: [],
        meals: [{ id: 'm22b', label: 'Lunch by the Reuss', placeId: 'f-luc-oldtown' }],
        notes: 'Wander the painted Old Town; climb a Musegg wall tower (free).',
      },
      evening: {
        activities: ['a-lionmonument'],
        travel: [],
        meals: [{ id: 'm22c', label: 'All-veg buffet dinner', placeId: 'f-luc-veg' }],
        notes: '',
      },
      night: { activities: [], travel: [], meals: [], notes: '' },
    },
  },
  {
    id: 'd-23',
    dayNumber: 7,
    date: '2026-06-23',
    city: 'Lucerne',
    phase: 'Lucerne',
    title: 'Mt. Pilatus & Lake Lucerne cruise',
    summary: 'The Golden Round Trip up Pilatus by boat, cogwheel and cable car, then a calm paddle-steamer cruise on the lake.',
    blocks: {
      morning: {
        activities: ['a-pilatus'],
        travel: [leg({ mode: 'ferry', from: 'Luzern', to: 'Alpnachstad', durationMin: 90, costCHF: 0, note: 'Boat leg of the Golden Round Trip (free with STP)' })],
        meals: [{ id: 'm23a', label: 'Breakfast + Coop picnic for the summit', placeId: 'f-int-coop' }],
        notes: '❄ Pilatus is 2,128 m — pack a warm layer. Steepest cogwheel railway in the world.',
      },
      afternoon: {
        activities: ['a-lakecruise-luc'],
        travel: [leg({ mode: 'cable-car', from: 'Pilatus Kulm', to: 'Kriens', durationMin: 40, costCHF: 0, note: 'Panorama gondola + cable car down' })],
        meals: [{ id: 'm23b', label: 'Late lunch in the Old Town' }],
        notes: 'Optional lake cruise in the late afternoon if energy allows.',
      },
      evening: {
        activities: [],
        travel: [],
        meals: [{ id: 'm23c', label: 'Farewell Indian dinner', placeId: 'f-luc-indian' }],
        notes: 'Repack and pre-pack tonight — VERY early departure tomorrow.',
      },
      night: { activities: [], travel: [], meals: [], notes: '✈ Set alarms: early train to Zurich Airport tomorrow.' },
    },
  },
  {
    id: 'd-24',
    dayNumber: 8,
    date: '2026-06-24',
    city: 'Zurich',
    phase: 'Travel',
    title: 'Lucerne → Zurich Airport, fly home',
    summary: 'Early train to ZRH with a generous airport buffer, then Etihad EY 74 to Abu Dhabi and onward to Mumbai.',
    blocks: {
      morning: {
        activities: [],
        travel: [
          leg({ mode: 'train', from: 'Luzern', to: 'Zürich Flughafen', durationMin: 70, costCHF: 30, sbbUrl: sbb('Luzern', 'Zurich Flughafen'), note: 'Direct ~1h; leave Lucerne by ~11:30 latest' }),
        ],
        meals: [{ id: 'm24a', label: 'Checkout + breakfast' }],
        notes: '✈ Be at ZRH ~3 hrs before the 15:55 international departure. Aim to depart Lucerne by ~11:00–11:30.',
      },
      afternoon: {
        activities: [],
        travel: [leg({ mode: 'flight', from: 'ZRH', to: 'AUH', durationMin: 415, costCHF: 0, note: 'EY 74 · dep 15:55' })],
        meals: [{ id: 'm24b', label: 'Lunch at Zurich Airport' }],
        notes: 'Tax refund (Global Blue) at the airport if you shopped. Last Swiss chocolate run!',
      },
      evening: { activities: [], travel: [], meals: [], notes: 'In transit.' },
      night: {
        activities: [],
        travel: [leg({ mode: 'flight', from: 'AUH', to: 'BOM', durationMin: 180, costCHF: 0, note: 'EY 202 · dep 02:15 (25 Jun)' })],
        meals: [],
        notes: 'Connection at AUH.',
      },
    },
  },
  {
    id: 'd-25',
    dayNumber: 9,
    date: '2026-06-25',
    city: 'Zurich',
    phase: 'Travel',
    title: 'Home — arrive Mumbai',
    summary: 'Land at BOM ~07:15. Welcome home.',
    blocks: {
      morning: {
        activities: [],
        travel: [leg({ mode: 'flight', from: 'AUH', to: 'BOM', durationMin: 180, costCHF: 0, note: 'Arrive 07:15' })],
        meals: [],
        notes: 'Immigration, baggage, cab home. 💚',
      },
      afternoon: { activities: [], travel: [], meals: [], notes: '' },
      evening: { activities: [], travel: [], meals: [], notes: '' },
      night: { activities: [], travel: [], meals: [], notes: '' },
    },
  },
];
