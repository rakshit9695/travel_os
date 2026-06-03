import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  Check,
  Mountain,
  CloudRain,
  Leaf,
  CalendarPlus,
  Snowflake,
  Info,
} from 'lucide-react';
import type { Activity, City, FoodPlace } from '../types';
import { useStore, useTrip } from '../lib/store';
import { currentDay } from '../lib/selectors';
import { formatCHF, minutesToHM } from '../lib/format';
import { PageHeader, Chip } from '../components/ui/primitives';
import { SmartImage } from '../components/SmartImage';
import { MiniMap, type MapPoint } from '../components/MiniMap';
import { cityCoords } from '../data/seedWeather';

const CITIES: { city: City; tag: string; blurb: string; hero: string }[] = [
  {
    city: 'Lausanne',
    tag: 'Lake Geneva · Days 1–2',
    blurb:
      'An elegant lakeside city on Lac Léman — Olympic capital, medieval Old Town, and the launchpad for a CERN day-trip to Geneva.',
    hero: 'hero-lausanne',
  },
  {
    city: 'Interlaken',
    tag: 'Jungfrau Region · Days 3–5',
    blurb:
      'Between two turquoise lakes beneath the Eiger, Mönch and Jungfrau — your base for the trip\'s big alpine excursions.',
    hero: 'hero-interlaken',
  },
  {
    city: 'Lucerne',
    tag: 'Central Switzerland · Days 6–7',
    blurb:
      'A postcard of covered bridges, painted facades and a mountain-ringed lake — Pilatus, Rigi and the Old Town await.',
    hero: 'hero-lucerne',
  },
];

function ActivityCard({ activity }: { activity: Activity }) {
  const trip = useTrip();
  const { addActivityToDay } = useStore();
  const [added, setAdded] = useState(false);
  const alpine = (activity.altitudeM ?? 0) >= 1500;

  const addToPlan = () => {
    // add to the first day in this city's phase, afternoon block
    const day =
      trip.days.find((d) => d.city === activity.city && d.phase !== 'Travel') ??
      trip.days.find((d) => d.phase === activity.city);
    if (day) {
      addActivityToDay(day.id, 'afternoon', activity.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="relative h-32">
        <SmartImage imageKey={activity.image} rounded="rounded-none" className="h-full w-full" overlay />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {activity.onItinerary && (
            <Chip className="!bg-glacier-500/90 !text-white !text-[10px]">
              <Check className="h-3 w-3" /> On plan
            </Chip>
          )}
          {alpine && (
            <Chip className="!bg-white/85 !text-pine-700 !text-[10px]">
              <Snowflake className="h-3 w-3" /> {activity.altitudeM?.toLocaleString()} m
            </Chip>
          )}
        </div>
        {activity.weatherDependent && (
          <div className="absolute right-3 top-3" title="Weather dependent">
            <CloudRain className="h-4 w-4 text-white/90 drop-shadow" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <h3 className="font-display text-base font-extrabold leading-tight drop-shadow">{activity.title}</h3>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-xs leading-relaxed text-ink-soft dark:text-glacier-100/80">{activity.why}</p>
        {activity.bookingNote && (
          <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <Info className="mt-0.5 h-3 w-3 shrink-0" /> {activity.bookingNote}
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-mute">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {minutesToHM(activity.durationMin)}
          </span>
          <span className="font-semibold text-ink-soft dark:text-glacier-100">
            {activity.costCHF > 0 ? formatCHF(activity.costCHF) : 'Free'}
          </span>
          {alpine && (
            <span className="inline-flex items-center gap-1 text-glacier-600">
              <Mountain className="h-3 w-3" /> alpine
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={addToPlan} className="btn-ghost flex-1 !py-2 !text-xs">
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <CalendarPlus className="h-3.5 w-3.5" /> Add to plan
              </>
            )}
          </button>
          {activity.mapUrl && (
            <a href={activity.mapUrl} target="_blank" rel="noreferrer" className="btn-soft !px-3 !py-2 !text-xs">
              <MapPin className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function FoodCard({ place }: { place: FoodPlace }) {
  return (
    <div className="card flex gap-3 p-3">
      <SmartImage imageKey={place.image} className="h-20 w-20 shrink-0" rounded="rounded-2xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight">{place.name}</h4>
          <span className="shrink-0 text-xs font-semibold text-ink-mute">{place.priceBand}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-mute">{place.cuisine}</span>
          {place.pureVeg ? (
            <Chip tone="mint" className="!py-0.5 !text-[10px]">
              <Leaf className="h-3 w-3" /> Pure veg
            </Chip>
          ) : place.vegFriendly ? (
            <Chip tone="mint" className="!py-0.5 !text-[10px]">
              <Leaf className="h-3 w-3" /> Veg-friendly
            </Chip>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-soft dark:text-glacier-100/80">{place.note}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11px] text-ink-mute">📍 {place.area}</span>
          <a href={place.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-pine-600 dark:text-glacier-300">
            Map <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CityGuides() {
  const trip = useTrip();
  const here = currentDay(trip)?.city;
  const initial = CITIES.find((c) => c.city === here)?.city ?? 'Lausanne';
  const [city, setCity] = useState<City>(initial);
  const [tab, setTab] = useState<'activities' | 'food'>('activities');
  const [vegOnly, setVegOnly] = useState(true);

  const meta = CITIES.find((c) => c.city === city)!;

  const activities = useMemo(() => {
    let list = trip.activities.filter((a) => a.city === city || (city === 'Lausanne' && a.city === 'Geneva'));
    return list;
  }, [trip.activities, city]);

  const alpine = activities.filter((a) => (a.altitudeM ?? 0) >= 1500);
  const regular = activities.filter((a) => (a.altitudeM ?? 0) < 1500);

  const foods = useMemo(() => {
    let list = trip.food.filter((f) => f.city === city);
    if (vegOnly) list = list.filter((f) => f.vegFriendly);
    return list;
  }, [trip.food, city, vegOnly]);

  const points: MapPoint[] = useMemo(() => {
    const pts: MapPoint[] = activities
      .filter((a) => a.lat && a.lng)
      .map((a) => ({ id: a.id, lat: a.lat!, lng: a.lng!, title: a.title, sub: a.category, kind: 'activity' }));
    const stay = trip.stays.find((s) => s.city === city);
    if (stay) pts.push({ id: stay.id, lat: stay.lat, lng: stay.lng, title: stay.name, sub: 'Your stay', kind: 'stay' });
    return pts;
  }, [activities, trip.stays, city]);

  return (
    <div>
      <PageHeader title="City Guides" subtitle="Curated, veg-forward — add anything to your plan in a tap." />

      {/* city switcher */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        {CITIES.map((c) => {
          const active = c.city === city;
          return (
            <button
              key={c.city}
              onClick={() => setCity(c.city)}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-transparent bg-pine-600 text-white shadow-soft dark:bg-glacier-500 dark:text-pine-900'
                  : 'border-pine-100 bg-white text-ink-soft hover:border-glacier-300 dark:border-pine-700/50 dark:bg-pine-800/50 dark:text-glacier-100/80'
              }`}
            >
              <div className="font-display text-sm font-extrabold">{c.city}</div>
              <div className={`text-[10px] ${active ? 'text-glacier-100 dark:text-pine-800' : 'text-ink-mute'}`}>
                {c.tag.split('·')[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* hero */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative h-44">
          <SmartImage imageKey={meta.hero} rounded="rounded-none" className="h-full w-full" overlay />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-glacier-200">{meta.tag}</div>
            <h2 className="font-display text-2xl font-extrabold drop-shadow">{meta.city}</h2>
            <p className="mt-1 max-w-xl text-sm text-glacier-100">{meta.blurb}</p>
          </div>
        </div>
      </div>

      {/* map */}
      <div className="mb-5">
        <MiniMap points={points} center={[cityCoords[city].lat, cityCoords[city].lng]} />
      </div>

      {/* tabs */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-pine-50 p-1 dark:bg-pine-700/40">
          {(['activities', 'food'] as const).map((t) => (
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
        {tab === 'food' && (
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`chip ${vegOnly ? 'bg-glacier-100 text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200' : 'bg-pine-50 text-ink-mute dark:bg-pine-700/40'}`}
          >
            <Leaf className="h-3.5 w-3.5" /> {vegOnly ? 'Veg only' : 'All food'}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + city}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'activities' ? (
            <div className="space-y-6">
              {city === 'Interlaken' && alpine.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-glacier-500" />
                    <h3 className="section-title !text-glacier-600 dark:!text-glacier-300">Alpine Excursions</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {alpine.map((a) => (
                      <ActivityCard key={a.id} activity={a} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-pine-50 p-3 text-xs text-ink-soft dark:bg-pine-700/40 dark:text-glacier-100/80">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-glacier-500" />
                    <span>
                      <b>Pass economics:</b> the Swiss Travel Pass covers most trains, boats & buses and discounts the big
                      mountains (≈25% Jungfraujoch, 50% Pilatus cogwheel, free Rigi & lake boats). For multiple Jungfrau-area
                      lifts, compare a <b>Jungfrau Travel Pass</b>. Heights are near-freezing — pack warm layers.
                    </span>
                  </div>
                </div>
              )}
              <div>
                {city === 'Interlaken' && (
                  <h3 className="section-title mb-3">More to see</h3>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(city === 'Interlaken' ? regular : activities).map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {foods.length === 0 ? (
                <p className="col-span-full py-8 text-center text-sm text-ink-mute">No spots match — toggle "All food".</p>
              ) : (
                foods.map((f) => <FoodCard key={f.id} place={f} />)
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
