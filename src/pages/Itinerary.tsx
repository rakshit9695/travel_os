import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Train,
  Bus,
  Footprints,
  Ship,
  CableCar,
  Car,
  Plane,
  TramFront,
  MapPin,
  ExternalLink,
  Plus,
  X,
  Clock,
  Users,
  TriangleAlert,
  Utensils,
  Mountain,
} from 'lucide-react';
import type { BlockKey, Day, TravelLeg, TravelMode } from '../types';
import { useStore, useTrip } from '../lib/store';
import { activityById } from '../data/activities';
import { foodById } from '../data/food';
import { useWeather } from '../lib/useWeather';
import { currentDay, dayWarnings, dayActivities, dayMaxAltitude } from '../lib/selectors';
import { formatCHF, formatDateLong, minutesToHM } from '../lib/format';
import { PageHeader, Chip } from '../components/ui/primitives';
import { SmartImage } from '../components/SmartImage';
import { RebalancePanel } from '../components/RebalancePanel';

const BLOCKS: { key: BlockKey; label: string; icon: typeof Sun }[] = [
  { key: 'morning', label: 'Morning', icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon', icon: Sun },
  { key: 'evening', label: 'Evening', icon: Sunset },
  { key: 'night', label: 'Night', icon: Moon },
];

const MODE_ICON: Record<TravelMode, typeof Train> = {
  walk: Footprints,
  train: Train,
  tram: TramFront,
  bus: Bus,
  ferry: Ship,
  'cable-car': CableCar,
  'cog-railway': Train,
  car: Car,
  flight: Plane,
};

function crowdLevel(day: Day, key: BlockKey): 'Quiet' | 'Moderate' | 'Busy' {
  const acts = day.blocks[key].activities.map((id) => activityById(id)).filter(Boolean);
  const hasIcon = acts.some((a) => a?.tags?.includes('icon') || a?.tags?.includes('bucket-list'));
  if (key === 'morning' && hasIcon) return 'Busy';
  if (acts.length >= 2) return 'Moderate';
  if (acts.length === 0) return 'Quiet';
  return 'Moderate';
}

function TravelLegRow({ leg }: { leg: TravelLeg }) {
  const Icon = MODE_ICON[leg.mode] ?? Train;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-pine-50/70 px-3 py-2.5 dark:bg-pine-700/30">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-pine-600 shadow-soft dark:bg-pine-800 dark:text-glacier-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {leg.from} → {leg.to}
        </div>
        <div className="text-xs text-ink-mute">
          {minutesToHM(leg.durationMin)}
          {leg.costCHF > 0 ? ` · ${formatCHF(leg.costCHF)}` : leg.mode !== 'flight' ? ' · covered by pass' : ''}
          {leg.note ? ` · ${leg.note}` : ''}
        </div>
      </div>
      {leg.sbbUrl && (
        <a href={leg.sbbUrl} target="_blank" rel="noreferrer" className="btn-soft px-2.5 py-1.5 text-xs">
          SBB <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function ActivityRow({
  activityId,
  onRemove,
}: {
  activityId: string;
  onRemove?: () => void;
}) {
  const a = activityById(activityId);
  if (!a) return null;
  const alpine = (a.altitudeM ?? 0) >= 1500;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-pine-100/70 bg-white p-2.5 dark:border-pine-700/50 dark:bg-pine-800/50">
      <SmartImage imageKey={a.image} className="h-14 w-16 shrink-0" rounded="rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate text-sm font-bold">{a.title}</h4>
          {alpine && <Mountain className="h-3.5 w-3.5 shrink-0 text-glacier-500" />}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-mute">{a.why}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {minutesToHM(a.durationMin)}
          </span>
          <span>·</span>
          <span>{a.costCHF > 0 ? formatCHF(a.costCHF) : 'Free'}</span>
          {a.altitudeM && (
            <>
              <span>·</span>
              <span>{a.altitudeM.toLocaleString()} m</span>
            </>
          )}
          {a.bookingNote && <Chip tone="warn" className="ml-1 !py-0.5 !text-[10px]">book ahead</Chip>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        {a.mapUrl && (
          <a href={a.mapUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-lg bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200">
            <MapPin className="h-4 w-4" />
          </a>
        )}
        {onRemove && (
          <button onClick={onRemove} className="grid h-9 w-9 place-items-center rounded-lg bg-swiss/10 text-swiss">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddActivitySheet({
  day,
  block,
  onClose,
}: {
  day: Day;
  block: BlockKey;
  onClose: () => void;
}) {
  const trip = useTrip();
  const { addActivityToDay } = useStore();
  const present = new Set(
    BLOCKS.flatMap((b) => day.blocks[b.key].activities)
  );
  const options = trip.activities.filter(
    (a) => (a.city === day.city || (day.city === 'Geneva' && a.city === 'Lausanne')) && !present.has(a.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-end bg-pine-900/40 backdrop-blur-sm sm:place-items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="card sheet-safe max-h-[82vh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Add to {BLOCKS.find((b) => b.key === block)?.label}</h3>
          <button onClick={onClose} className="text-ink-mute">
            <X className="h-5 w-5" />
          </button>
        </div>
        {options.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-mute">
            Everything for {day.city} is already on the plan. ✨
          </p>
        ) : (
          <div className="grid gap-2">
            {options.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  addActivityToDay(day.id, block, a.id);
                  onClose();
                }}
                className="flex items-center gap-3 rounded-2xl border border-pine-100/70 bg-white p-2.5 text-left transition hover:border-glacier-300 hover:shadow-soft dark:border-pine-700/50 dark:bg-pine-800/50"
              >
                <SmartImage imageKey={a.image} className="h-12 w-14 shrink-0" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{a.title}</div>
                  <div className="truncate text-xs text-ink-mute">
                    {minutesToHM(a.durationMin)} · {a.costCHF > 0 ? formatCHF(a.costCHF) : 'Free'}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-glacier-500" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function DayPanel({ day }: { day: Day }) {
  const { removeActivityFromDay } = useStore();
  const weather = useWeather(day.date, day.city);
  const warnings = dayWarnings(day);
  const [adding, setAdding] = useState<BlockKey | null>(null);
  const isTravel = day.phase === 'Travel';

  return (
    <div className="space-y-4">
      {/* Day hero */}
      <div className="card overflow-hidden">
        <div className="relative h-32">
          <SmartImage imageKey={`hero-${day.city.toLowerCase()}`} rounded="rounded-none" className="h-full w-full" overlay />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-glacier-200">
              Day {day.dayNumber} · {formatDateLong(day.date)} · {day.city}
            </div>
            <h2 className="font-display text-xl font-extrabold drop-shadow">{day.title}</h2>
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
            {weather.icon} {weather.tMax}° / {weather.tMin}° · {weather.precipProb}% rain
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-ink-soft dark:text-glacier-100/80">{day.summary}</p>
          {warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-2xl p-3 text-xs ${
                    w.level === 'warn'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'
                      : 'bg-glacier-50 text-glacier-700 dark:bg-glacier-500/10 dark:text-glacier-200'
                  }`}
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold">{w.message}</span>
                    {w.fix && <span className="opacity-80"> {w.fix}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blocks */}
      {BLOCKS.map(({ key, label, icon: Icon }) => {
        const block = day.blocks[key];
        const empty =
          block.activities.length === 0 && block.travel.length === 0 && block.meals.length === 0 && !block.notes;
        if (empty) return null;
        const crowd = crowdLevel(day, key);
        return (
          <div key={key} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold">{label}</h3>
              </div>
              {block.activities.length > 0 && (
                <Chip tone={crowd === 'Busy' ? 'warn' : crowd === 'Quiet' ? 'mint' : 'mute'}>
                  <Users className="h-3 w-3" /> {crowd}
                </Chip>
              )}
            </div>

            <div className="space-y-2">
              {block.travel.map((leg) => (
                <TravelLegRow key={leg.id} leg={leg} />
              ))}
              {block.activities.map((id) => (
                <ActivityRow
                  key={id}
                  activityId={id}
                  onRemove={() => removeActivityFromDay(day.id, key, id)}
                />
              ))}
              {block.meals.map((m) => {
                const place = m.placeId ? foodById(m.placeId) : null;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-glacier-50/60 px-3 py-2.5 dark:bg-glacier-500/10">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-glacier-600 shadow-soft dark:bg-pine-800 dark:text-glacier-200">
                      <Utensils className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{m.label}</div>
                      {place && (
                        <div className="truncate text-xs text-ink-mute">
                          {place.name} · {place.cuisine} {place.vegFriendly && '· 🌱 veg'}
                        </div>
                      )}
                    </div>
                    {place && (
                      <a href={place.mapUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-glacier-600 dark:bg-pine-800 dark:text-glacier-200">
                        <MapPin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
              {block.notes && (
                <p className="rounded-2xl bg-pine-50/50 px-3 py-2 text-xs leading-relaxed text-ink-soft dark:bg-pine-700/30 dark:text-glacier-100/80">
                  {block.notes}
                </p>
              )}
            </div>

            {!isTravel && (
              <button
                onClick={() => setAdding(key)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-pine-200 py-2 text-xs font-semibold text-pine-600 transition hover:border-glacier-400 hover:text-glacier-600 dark:border-pine-600 dark:text-glacier-200"
              >
                <Plus className="h-3.5 w-3.5" /> Add activity
              </button>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {adding && <AddActivitySheet day={day} block={adding} onClose={() => setAdding(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default function Itinerary() {
  const trip = useTrip();
  const today = currentDay(trip);
  const [selectedId, setSelectedId] = useState(today?.id ?? trip.days[1].id);
  const selected = trip.days.find((d) => d.id === selectedId) ?? trip.days[0];

  const phaseColor: Record<string, string> = {
    Lausanne: 'bg-glacier-400',
    Interlaken: 'bg-pine-500',
    Lucerne: 'bg-amber-400',
    Travel: 'bg-ink-mute',
  };

  return (
    <div>
      <PageHeader title="Itinerary" subtitle="Eight days, thoughtfully planned — tap any day." />

      <RebalancePanel />

      {/* Day rail */}
      <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {trip.days.map((d) => {
            const active = d.id === selectedId;
            const isToday = today?.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`relative flex w-[78px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition-all ${
                  active
                    ? 'border-transparent bg-pine-600 text-white shadow-lift dark:bg-glacier-500 dark:text-pine-900'
                    : 'border-pine-100 bg-white text-ink-soft hover:border-glacier-300 dark:border-pine-700/50 dark:bg-pine-800/50 dark:text-glacier-100/80'
                }`}
              >
                <span className={`mb-1 h-1.5 w-1.5 rounded-full ${active ? 'bg-white dark:bg-pine-900' : phaseColor[d.phase]}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {d.dayNumber === 0 ? 'Dep' : d.dayNumber === 9 ? 'Home' : `Day ${d.dayNumber}`}
                </span>
                <span className="font-display text-base font-extrabold leading-tight">
                  {new Date(d.date + 'T00:00:00').getDate()}
                </span>
                <span className="text-[10px] opacity-80">{d.phase === 'Travel' ? '✈ Travel' : d.city.slice(0, 4)}</span>
                {isToday && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-swiss px-1.5 py-0.5 text-[8px] font-bold text-white">
                    NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <DayPanel day={selected} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
