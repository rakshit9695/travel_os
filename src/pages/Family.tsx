import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Leaf,
  AlertTriangle,
  Pill,
  Pencil,
  Check,
  X,
  ShieldAlert,
  Hospital,
  Building2,
  Languages,
  HandHeart,
  Ambulance,
} from 'lucide-react';
import {
  Navigation,
  Radio,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import type { City, Traveler } from '../types';
import { useStore, useTrip } from '../lib/store';
import { currentDay } from '../lib/selectors';
import { PageHeader, Avatar, Chip } from '../components/ui/primitives';
import { MiniMap, type MapPoint } from '../components/MiniMap';
import { cityCoords } from '../data/seedWeather';

function TravelerCard({ traveler }: { traveler: Traveler }) {
  const { updateTraveler } = useStore();
  const [editing, setEditing] = useState(false);
  const [dietary, setDietary] = useState(traveler.dietary);
  const [allergies, setAllergies] = useState(traveler.allergies);

  const save = () => {
    updateTraveler(traveler.id, { dietary, allergies });
    setEditing(false);
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <Avatar traveler={traveler} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">{traveler.name}</h3>
              <div className="text-[11px] text-ink-mute">
                {traveler.role} · {traveler.isMinor ? `minor (${traveler.age})` : 'adult'}
              </div>
            </div>
            <button
              onClick={() => (editing ? save() : setEditing(true))}
              className="grid h-7 w-7 place-items-center rounded-lg bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200"
            >
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-glacier-500" />
              {editing ? (
                <input className="input !py-1 !text-xs" value={dietary} onChange={(e) => setDietary(e.target.value)} />
              ) : (
                <span className="text-ink-soft dark:text-glacier-100/80">{traveler.dietary}</span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              {editing ? (
                <input className="input !py-1 !text-xs" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              ) : (
                <span className="text-ink-soft dark:text-glacier-100/80">Allergies: {traveler.allergies}</span>
              )}
            </div>
            {traveler.meds.length > 0 && (
              <div className="flex items-start gap-2">
                <Pill className="mt-0.5 h-4 w-4 shrink-0 text-pine-500" />
                <span className="text-ink-soft dark:text-glacier-100/80">{traveler.meds.join('; ')}</span>
              </div>
            )}
            {traveler.emergencyContacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-glacier-500" />
                <span className="text-ink-soft dark:text-glacier-100/80">
                  {c.name} ({c.relation}) · {c.phone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SafetySection() {
  const trip = useTrip();
  const [city, setCity] = useState<City>('Lausanne');
  const card = trip.safety.find((s) => s.city === city)!;
  const cities = trip.safety.map((s) => s.city);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`chip ${city === c ? 'bg-pine-600 text-white' : 'bg-pine-50 text-ink-soft dark:bg-pine-700/40 dark:text-glacier-100/80'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={city}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* emergency numbers */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 bg-swiss px-4 py-2.5 text-white">
              <ShieldAlert className="h-4 w-4" />
              <span className="font-display font-bold">Emergency · {city}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {card.emergency.map((e) => (
                <a
                  key={e.number}
                  href={`tel:${e.number}`}
                  className="flex items-center justify-between rounded-2xl bg-pine-50 px-3 py-2.5 transition hover:bg-pine-100 dark:bg-pine-700/40"
                >
                  <span className="text-xs font-semibold text-ink-soft dark:text-glacier-100/80">{e.label}</span>
                  <span className="font-display text-lg font-extrabold text-swiss">{e.number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* hospitals + consular */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <h4 className="section-title mb-2 flex items-center gap-1.5">
                <Hospital className="h-3.5 w-3.5" /> Nearest hospital
              </h4>
              {card.hospitals.map((h) => (
                <div key={h.name} className="text-sm">
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-ink-mute">{h.address}</div>
                  {h.phone && (
                    <a href={`tel:${h.phone.replace(/[^+\d]/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-pine-600 dark:text-glacier-300">
                      <Phone className="h-3 w-3" /> {h.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="card p-4">
              <h4 className="section-title mb-2 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Indian consular help
              </h4>
              <p className="text-sm text-ink-soft dark:text-glacier-100/80">{card.consular}</p>
            </div>
          </div>

          {/* scams + etiquette */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <h4 className="section-title mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Stay aware
              </h4>
              <ul className="space-y-1.5 text-sm">
                {card.scams.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-soft dark:text-glacier-100/80">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h4 className="section-title mb-2 flex items-center gap-1.5">
                <HandHeart className="h-3.5 w-3.5" /> Etiquette & tipping
              </h4>
              <ul className="space-y-1.5 text-sm">
                {card.etiquette.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-soft dark:text-glacier-100/80">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-glacier-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* phrases */}
          <div className="card p-4">
            <h4 className="section-title mb-3 flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5" /> Useful phrases ({city === 'Lausanne' ? 'French' : 'German'})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {card.phrases.map((p) => (
                <div key={p.phrase} className="flex items-center justify-between rounded-2xl bg-pine-50/60 px-3 py-2 dark:bg-pine-700/30">
                  <span className="font-display font-bold text-pine-700 dark:text-glacier-200">{p.phrase}</span>
                  <span className="text-xs text-ink-mute">{p.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LocationsSection() {
  const trip = useTrip();
  const city = currentDay(trip)?.city ?? 'Lausanne';
  const base = cityCoords[(city in cityCoords ? city : 'Lausanne') as City];
  const [seed, setSeed] = useState(1);

  // Deterministic-ish simulated positions jittered around the current city.
  const offsets = (i: number) => {
    const t = (i + 1) * 1.7 + seed * 0.9;
    return {
      dlat: (Math.sin(t) * 0.004 + Math.cos(t * 1.3) * 0.0025),
      dlng: (Math.cos(t) * 0.005 + Math.sin(t * 0.7) * 0.003),
    };
  };

  const points: MapPoint[] = trip.travelers.map((tr, i) => {
    const o = offsets(i);
    return {
      id: tr.id,
      lat: base.lat + o.dlat,
      lng: base.lng + o.dlng,
      title: tr.name,
      sub: 'Simulated position',
      kind: 'person',
      color: tr.color,
      radius: 9,
    };
  });

  // Pick the "furthest" traveler from the group centroid as a simulated straggler.
  const cLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const cLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  let straggler = points[0];
  let maxd = -1;
  for (const p of points) {
    const d = Math.hypot(p.lat - cLat, p.lng - cLng);
    if (d > maxd) {
      maxd = d;
      straggler = p;
    }
  }
  const stragglerM = Math.round(maxd * 111000); // rough deg→m
  const behind = stragglerM > 220;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
        <Radio className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <b>Demo · simulated.</b> No real location is tracked or sent anywhere. This shows how live family location-sharing
          would look — positions are generated locally for the demo.
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Navigation className="h-4 w-4 text-glacier-500" /> The group in {city}
            </h3>
            <p className="text-xs text-ink-mute">Live view (simulated)</p>
          </div>
          <button onClick={() => setSeed((s) => s + 1)} className="btn-soft !py-2 !text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Ping all
          </button>
        </div>
        <div className="px-4 pb-4">
          <MiniMap points={points} center={[base.lat, base.lng]} height={260} />
        </div>
      </div>

      {/* straggler alert */}
      {behind && (
        <div className="card flex items-start gap-3 border-l-4 border-swiss p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-swiss/10 text-swiss">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-swiss">Someone's fallen behind</div>
            <p className="text-xs text-ink-soft dark:text-glacier-100/80">
              {straggler.title} is about {stragglerM} m from the rest of the group in {city}. Tap "Ping all" to refresh, or call
              to regroup.
            </p>
          </div>
        </div>
      )}

      {/* roster */}
      <div className="card p-4">
        <h3 className="section-title mb-3">Family roster</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {trip.travelers.map((tr) => (
            <div key={tr.id} className="flex items-center gap-2.5 rounded-2xl bg-pine-50/60 px-3 py-2 dark:bg-pine-700/30">
              <Avatar traveler={tr} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{tr.name}</div>
                <div className="text-[11px] text-ink-mute">📍 near {city} centre · just now</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-glacier-500" title="online (simulated)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Family() {
  const trip = useTrip();
  const [tab, setTab] = useState<'profiles' | 'safety' | 'locations'>('profiles');

  return (
    <div>
      <PageHeader title="Family & Safety" subtitle="Profiles, dietary needs, and a safety card for every city." />

      <div className="mb-5 inline-flex rounded-2xl bg-pine-50 p-1 dark:bg-pine-700/40">
        {(['profiles', 'safety', 'locations'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-1.5 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-white text-pine-700 shadow-soft dark:bg-pine-800 dark:text-glacier-200' : 'text-ink-mute'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profiles' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {trip.travelers.map((t) => (
            <TravelerCard key={t.id} traveler={t} />
          ))}
        </div>
      ) : tab === 'safety' ? (
        <SafetySection />
      ) : (
        <LocationsSection />
      )}
    </div>
  );
}
