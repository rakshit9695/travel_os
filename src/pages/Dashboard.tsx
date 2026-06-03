import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Wallet,
  Backpack,
  CloudSun,
  ChevronRight,
  Plane,
  MapPin,
  Sparkles,
  TriangleAlert,
  Check,
} from 'lucide-react';
import { useTrip } from '../lib/store';
import { useWeather } from '../lib/useWeather';
import {
  budgetTotals,
  currentDay,
  dayActivities,
  daysUntilDeparture,
  dayWarnings,
  isOnTrip,
  packingPct,
} from '../lib/selectors';
import { computeReadiness } from '../lib/readiness';
import { countdownTo, formatCHF, formatINR, now, parseISO, formatDateFull } from '../lib/format';
import { CountUp, Ring, AvatarStack, Chip, FadeIn } from '../components/ui/primitives';
import { SmartImage } from '../components/SmartImage';
import { activityById } from '../data/activities';

function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function CountdownChips({ target }: { target: Date }) {
  useTick(1000);
  const c = countdownTo(target, now());
  const items = c.past
    ? null
    : [
        { v: c.days, l: 'days' },
        { v: c.hours, l: 'hrs' },
        { v: c.minutes, l: 'min' },
        { v: c.seconds, l: 'sec' },
      ];
  if (!items)
    return <div className="font-display text-xl font-bold text-glacier-200">You're on the ground 🇨🇭</div>;
  return (
    <div className="flex gap-2">
      {items.map((it) => (
        <div key={it.l} className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
          <div className="font-display text-2xl font-extrabold tabular-nums text-white">
            {String(it.v).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-glacier-200">{it.l}</div>
        </div>
      ))}
    </div>
  );
}

function ReadinessCard() {
  const trip = useTrip();
  const readiness = useMemo(() => computeReadiness(trip), [trip]);
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setOpen((o) => !o)} className="shrink-0">
          <Ring value={readiness.score} size={132}>
            <div className="text-center">
              <div className="font-display text-3xl font-extrabold leading-none">
                <CountUp value={readiness.score} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">ready</div>
            </div>
          </Ring>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-glacier-500" />
            <h2 className="font-display text-lg font-bold">Travel Readiness</h2>
          </div>
          <p className="mt-1 text-sm text-ink-mute">
            {readiness.score >= 80
              ? 'Looking great — a few small things left.'
              : readiness.score >= 60
              ? 'Solid progress. Tap the ring for the breakdown.'
              : 'Getting there — tap the ring to see what needs attention.'}
          </p>
          <button onClick={() => setOpen((o) => !o)} className="mt-2 text-sm font-semibold text-pine-600 dark:text-glacier-300">
            {open ? 'Hide breakdown' : 'Show breakdown'} →
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="mt-4 grid gap-2 border-t border-pine-100/70 pt-4 dark:border-pine-700/50">
          {readiness.components.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <div className="w-32 shrink-0 text-sm font-semibold">{c.label}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-pine-100 dark:bg-pine-700">
                <motion.div
                  className={`h-full rounded-full ${c.score >= 80 ? 'bg-glacier-500' : c.score >= 50 ? 'bg-amber-400' : 'bg-swiss'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="w-28 shrink-0 text-right text-xs text-ink-mute">{c.detail}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function GlanceCard({
  to,
  icon,
  label,
  value,
  sub,
  tone = 'pine',
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'pine' | 'mint' | 'amber' | 'swiss';
}) {
  const tones = {
    pine: 'text-pine-600 bg-pine-50 dark:bg-pine-700/50 dark:text-glacier-200',
    mint: 'text-glacier-600 bg-glacier-100 dark:bg-glacier-500/20 dark:text-glacier-200',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-200',
    swiss: 'text-swiss bg-swiss/10',
  };
  return (
    <Link to={to} className="card group p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div>
        <ChevronRight className="h-4 w-4 text-ink-mute opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-3 label">{label}</div>
      <div className="mt-0.5 font-display text-xl font-bold leading-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-mute">{sub}</div>}
    </Link>
  );
}

function TodayBlock() {
  const trip = useTrip();
  const day = currentDay(trip);
  const onTrip = isOnTrip(trip);
  const weather = useWeather(day?.date ?? trip.startDate, (day?.city ?? 'Lausanne') as any);
  if (!day) return null;
  const acts = dayActivities(day);
  const warnings = dayWarnings(day);

  return (
    <div className="card overflow-hidden">
      <div className="relative h-36">
        <SmartImage imageKey={`hero-${day.city.toLowerCase()}`} rounded="rounded-none" className="h-full w-full" overlay />
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-glacier-200">
            {onTrip ? 'Today' : 'Up next'} · Day {day.dayNumber} · {day.city}
          </div>
          <h2 className="font-display text-xl font-extrabold drop-shadow">{day.title}</h2>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
          {weather.icon} {weather.tMax}° / {weather.tMin}°
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-ink-soft dark:text-glacier-100/80">{day.summary}</p>
        {acts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {acts.slice(0, 4).map((a) => (
              <Chip key={a.id} tone="mint">
                {a.title}
              </Chip>
            ))}
            {acts.length > 4 && <Chip tone="mute">+{acts.length - 4} more</Chip>}
          </div>
        )}
        {warnings.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold">{warnings[0].message}</span>
              {warnings[0].fix && <span className="opacity-80"> {warnings[0].fix}</span>}
            </div>
          </div>
        )}
        <Link to="/itinerary" className="btn-ghost mt-4 w-full">
          Open today's plan <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const trip = useTrip();
  const bt = useMemo(() => budgetTotals(trip), [trip]);
  const pack = packingPct(trip);
  const dUntil = daysUntilDeparture(trip);
  const onTrip = isOnTrip(trip);
  const departure = parseISO('2026-06-16T23:03:00');
  const day = currentDay(trip);
  const weather = useWeather(day?.date ?? trip.startDate, (day?.city ?? 'Lausanne') as any);
  const nextFlightLeg = trip.flights[0].legs[0];
  useTick(1000);
  const flightCd = countdownTo(parseISO(nextFlightLeg.depart), now());

  return (
    <div className="space-y-5">
      {/* Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-pine-gradient p-6 text-white shadow-lift sm:p-8">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-glacier-400/20 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-glacier-200">
                Voyage · Switzerland 2026
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                {onTrip ? 'Welcome to Switzerland,' : 'Welcome, Mishra family.'}
              </h1>
              <p className="mt-1 max-w-md text-sm text-glacier-100">
                {onTrip
                  ? `Day ${day?.dayNumber} of your first family trip together — let's make it count.`
                  : `Your first family trip together. ${dUntil > 0 ? `${dUntil} days to go` : 'It begins!'} · 16–25 June.`}
              </p>
              <div className="mt-4">
                <AvatarStack travelers={trip.travelers} size={38} />
              </div>
            </div>
            <div className="shrink-0">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-glacier-200">
                Countdown to departure
              </div>
              <CountdownChips target={departure} />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Readiness */}
      <FadeIn delay={0.05}>
        <ReadinessCard />
      </FadeIn>

      {/* Glance grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FadeIn delay={0.08}>
          <GlanceCard
            to="/itinerary"
            icon={<CalendarDays className="h-5 w-5" />}
            label={onTrip ? 'Today' : 'Next event'}
            value={onTrip ? day?.city : `Day ${day?.dayNumber}`}
            sub={day?.title}
            tone="pine"
          />
        </FadeIn>
        <FadeIn delay={0.11}>
          <GlanceCard
            to="/cities"
            icon={<CloudSun className="h-5 w-5" />}
            label={`Weather · ${day?.city ?? 'Lausanne'}`}
            value={`${weather.icon} ${weather.tMax}°`}
            sub={`${weather.label} · ${weather.precipProb}% rain`}
            tone="mint"
          />
        </FadeIn>
        <FadeIn delay={0.14}>
          <GlanceCard
            to="/budget"
            icon={<Wallet className="h-5 w-5" />}
            label="Budget remaining"
            value={formatCHF(bt.remainingCHF)}
            sub={`${formatINR(bt.remainingCHF * bt.fxRate)} · live`}
            tone={bt.overBudget ? 'swiss' : 'amber'}
          />
        </FadeIn>
        <FadeIn delay={0.17}>
          <GlanceCard
            to="/packing"
            icon={<Backpack className="h-5 w-5" />}
            label="Packing"
            value={`${pack}%`}
            sub={pack === 100 ? 'All packed ✓' : 'tap to continue'}
            tone="pine"
          />
        </FadeIn>
      </div>

      {/* Today + flight */}
      <div className="grid gap-5 lg:grid-cols-2">
        <FadeIn delay={0.2}>
          <TodayBlock />
        </FadeIn>
        <FadeIn delay={0.23}>
          <div className="card flex h-full flex-col p-5">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <div className="label">Outbound flight · Etihad</div>
                <div className="font-display text-lg font-bold">BOM → AUH → GVA</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { v: flightCd.days, l: 'days' },
                { v: flightCd.hours, l: 'hrs' },
                { v: flightCd.minutes, l: 'min' },
              ].map((it) => (
                <div key={it.l} className="rounded-2xl bg-pine-50 py-3 dark:bg-pine-700/40">
                  <div className="font-display text-2xl font-extrabold tabular-nums">{String(it.v).padStart(2, '0')}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{it.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
                <MapPin className="h-4 w-4 text-glacier-500" /> Connects via Abu Dhabi (AUH) — not direct
              </div>
              <div className="flex items-center gap-2 text-ink-soft dark:text-glacier-100/80">
                <Check className="h-4 w-4 text-glacier-500" /> Then GVA → Lausanne by train (~45 min)
              </div>
            </div>
            <Link to="/bookings" className="btn-ghost mt-auto w-full">
              View all bookings <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
