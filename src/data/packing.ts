import type { Bag, PackingItem } from '../types';

export const bags: Bag[] = [
  { id: 'bag-nitin', label: 'Nitin · Large suitcase', owner: 'nitin', color: '#0F3D3E' },
  { id: 'bag-rachana', label: 'Rachana · Large suitcase', owner: 'rachana', color: '#1A726C' },
  { id: 'bag-cabin', label: 'Shared cabin bag (tech & docs)', owner: 'shared', color: '#2BB6AB' },
  { id: 'bag-day', label: 'Day backpack (mountains)', owner: 'shared', color: '#4FD1C5' },
];

let pid = 0;
const p = (i: Omit<PackingItem, 'id'>): PackingItem => ({ id: `pk-${++pid}`, ...i });

// Altitude-and-activity aware. Summer valley basics + warm layers ONLY for alpine days.
export const packing: PackingItem[] = [
  // ── Documents (shared, in cabin bag) ──
  p({ travelerId: 'shared', label: '4 × Passports (Indian) + Schengen visa', bagId: 'bag-cabin', packed: true, reason: 'Required to travel', category: 'documents' }),
  p({ travelerId: 'shared', label: 'Flight + hotel printouts & QR codes', bagId: 'bag-cabin', packed: true, reason: 'Backup if offline', category: 'documents' }),
  p({ travelerId: 'shared', label: 'Swiss Travel Pass (4 QR codes)', bagId: 'bag-cabin', packed: true, reason: 'Daily transport & discounts', category: 'documents' }),
  p({ travelerId: 'shared', label: 'Travel insurance papers', bagId: 'bag-cabin', packed: false, reason: 'Emergencies', category: 'documents' }),

  // ── Tech (Switzerland = Type J plug) ──
  p({ travelerId: 'shared', label: 'Type J power adapters ×2 (Switzerland)', bagId: 'bag-cabin', packed: false, reason: 'Swiss sockets are Type J — Type C/E may not seat fully', category: 'tech' }),
  p({ travelerId: 'shared', label: 'Power bank (20,000 mAh) — carry-on only', bagId: 'bag-cabin', packed: false, reason: 'Long mountain days; must be in cabin bag for flights', category: 'tech' }),
  p({ travelerId: 'shared', label: 'Phone chargers ×4 + cables', bagId: 'bag-cabin', packed: false, reason: 'Daily', category: 'tech' }),
  p({ travelerId: 'rakshit', label: 'Camera + spare battery', bagId: 'bag-day', packed: false, reason: 'Alpine photography', category: 'tech' }),

  // ── Health ──
  p({ travelerId: 'shared', label: 'Family medical kit (paracetamol, band-aids, ORS)', bagId: 'bag-rachana', packed: false, reason: 'General', category: 'health' }),
  p({ travelerId: 'nitin', label: 'BP medication (Telmisartan) — full trip + buffer', bagId: 'bag-cabin', packed: false, reason: 'Daily medication — keep in cabin bag', category: 'health' }),
  p({ travelerId: 'rachana', label: 'Thyroid medication (Thyronorm)', bagId: 'bag-cabin', packed: false, reason: 'Daily medication', category: 'health' }),
  p({ travelerId: 'ronit', label: 'Antihistamine (peanut allergy) + epi if prescribed', bagId: 'bag-cabin', packed: false, reason: 'Allergy safety', category: 'health' }),
  p({ travelerId: 'shared', label: 'Sunscreen SPF 50 + lip balm', bagId: 'bag-day', packed: false, reason: 'UV is intense at altitude even when cold', category: 'health' }),
  p({ travelerId: 'shared', label: 'Sunglasses ×4', bagId: 'bag-day', packed: false, reason: 'Glacier glare on alpine days', category: 'health' }),

  // ── Summer valley clothing (17–26°C in the valleys) ──
  p({ travelerId: 'nitin', label: 'T-shirts & light shirts (summer)', bagId: 'bag-nitin', packed: false, reason: 'June in the valleys is warm — 18–26°C', category: 'clothing' }),
  p({ travelerId: 'rachana', label: 'Light cottons / kurtis (summer)', bagId: 'bag-rachana', packed: false, reason: 'Warm valley days', category: 'clothing' }),
  p({ travelerId: 'rakshit', label: 'T-shirts, shorts, one light jacket', bagId: 'bag-nitin', packed: false, reason: 'Warm valley days', category: 'clothing' }),
  p({ travelerId: 'ronit', label: 'T-shirts, shorts, hoodie', bagId: 'bag-rachana', packed: false, reason: 'Warm valley days', category: 'clothing' }),
  p({ travelerId: 'shared', label: 'Comfortable walking shoes ×4', bagId: 'bag-nitin', packed: false, reason: 'Lots of walking daily', category: 'clothing' }),
  p({ travelerId: 'shared', label: 'Light rain jacket / compact umbrella ×4', bagId: 'bag-nitin', packed: false, reason: 'Summer afternoon showers possible', category: 'clothing' }),

  // ── Alpine layers — ONLY for high-altitude excursion days (Jungfraujoch 3454m, First 2168m, Pilatus 2128m) ──
  p({ travelerId: 'nitin', label: 'Warm insulated jacket / fleece', bagId: 'bag-day', packed: false, reason: 'ALPINE: Jungfraujoch (3,454 m) is near-freezing & snowy in June', category: 'alpine' }),
  p({ travelerId: 'rachana', label: 'Warm jacket + thermal layer', bagId: 'bag-day', packed: false, reason: 'ALPINE: Jungfraujoch / Pilatus summits are below freezing', category: 'alpine' }),
  p({ travelerId: 'rakshit', label: 'Insulated jacket', bagId: 'bag-day', packed: false, reason: 'ALPINE: First (2,168 m) & Jungfraujoch (3,454 m)', category: 'alpine' }),
  p({ travelerId: 'ronit', label: 'Warm jacket + hoodie', bagId: 'bag-day', packed: false, reason: 'ALPINE: high-altitude excursion days only', category: 'alpine' }),
  p({ travelerId: 'shared', label: 'Gloves, beanies & warm socks ×4', bagId: 'bag-day', packed: false, reason: 'ALPINE: snow & wind at Jungfraujoch / Schilthorn', category: 'alpine' }),

  // ── Essentials / misc ──
  p({ travelerId: 'shared', label: 'Reusable water bottles ×4', bagId: 'bag-day', packed: false, reason: 'Swiss tap water is excellent & free', category: 'essentials' }),
  p({ travelerId: 'shared', label: 'Snacks / ready veg meals from India', bagId: 'bag-rachana', packed: false, reason: 'Comfort food; veg backup at altitude', category: 'essentials' }),
  p({ travelerId: 'shared', label: 'Small daypack for mountains', bagId: 'bag-day', packed: true, reason: 'Carry layers + picnic on excursions', category: 'essentials' }),
];
