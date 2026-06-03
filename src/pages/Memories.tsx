import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookHeart,
  MapPin,
  Share2,
  Copy,
  Check,
  Camera,
  Sparkles,
  Mountain,
  Wallet,
  CalendarDays,
} from 'lucide-react';
import { useTrip } from '../lib/store';
import { budgetTotals, dayActivities } from '../lib/selectors';
import { formatCHF, formatINR, formatDateLong } from '../lib/format';
import { PageHeader, Chip, CountUp, AvatarStack } from '../components/ui/primitives';
import { SmartImage } from '../components/SmartImage';
import { MiniMap, type MapPoint } from '../components/MiniMap';
import { cityCoords } from '../data/seedWeather';

export default function Memories() {
  const trip = useTrip();
  const bt = useMemo(() => budgetTotals(trip), [trip]);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const visited = useMemo(
    () => trip.activities.filter((a) => a.onItinerary),
    [trip.activities]
  );
  const alpineCount = visited.filter((a) => (a.altitudeM ?? 0) >= 1500).length;
  const topAlt = Math.max(0, ...visited.map((a) => a.altitudeM ?? 0));

  const points: MapPoint[] = useMemo(() => {
    const stays = trip.stays.map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      title: s.name,
      sub: s.city,
      kind: 'stay' as const,
    }));
    const acts = visited
      .filter((a) => a.lat && a.lng)
      .map((a) => ({ id: a.id, lat: a.lat!, lng: a.lng!, title: a.title, sub: a.city, kind: 'activity' as const }));
    return [...stays, ...acts];
  }, [trip.stays, visited]);

  const journal = useMemo(
    () => trip.days.filter((d) => d.phase !== 'Travel'),
    [trip.days]
  );

  const shareText = useMemo(() => {
    const lines = [
      `🇨🇭 ${trip.title} — ${trip.subtitle}`,
      `${formatDateLong(trip.onGroundStart)} → ${formatDateLong(trip.onGroundEnd)}`,
      ``,
      `${visited.length} places · 3 cities · ${alpineCount} alpine excursions · top of Europe at ${topAlt.toLocaleString()} m`,
      ``,
      ...journal.map((d) => `Day ${d.dayNumber} · ${d.city}: ${d.title}`),
      ``,
      `Planned & managed with Voyage 💚`,
    ];
    return lines.join('\n');
  }, [trip, visited, alpineCount, topAlt, journal]);

  const onShare = async () => {
    try {
      if (canShare) {
        await navigator.share({ title: trip.title, text: shareText });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <PageHeader
        title="Memory Book"
        subtitle="A living journal of the trip — ready to fill with photos."
        right={
          <button onClick={onShare} className="btn-primary">
            {copied ? <Check className="h-4 w-4" /> : canShare ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        }
      />

      {/* hero */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative h-44">
          <SmartImage imageKey="hero-interlaken" rounded="rounded-none" className="h-full w-full" overlay />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-glacier-200">
                <BookHeart className="h-4 w-4" /> The Mishra Family · Switzerland 2026
              </div>
              <h2 className="mt-1 font-display text-2xl font-extrabold drop-shadow">A first journey, together.</h2>
              <p className="mt-1 text-sm text-glacier-100">
                {formatDateLong(trip.onGroundStart)} → {formatDateLong(trip.onGroundEnd)}
              </p>
            </div>
            <AvatarStack travelers={trip.travelers} size={36} />
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: MapPin, label: 'Places', value: <CountUp value={visited.length} />, tone: 'glacier' },
          { icon: CalendarDays, label: 'Days on ground', value: <CountUp value={8} />, tone: 'pine' },
          { icon: Mountain, label: 'Highest point', value: <span>{topAlt.toLocaleString()} m</span>, tone: 'glacier' },
          { icon: Wallet, label: 'Planned spend', value: formatCHF(bt.projectedCHF), tone: 'pine' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-glacier-100 text-glacier-600 dark:bg-glacier-500/20 dark:text-glacier-200">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2.5 label">{s.label}</div>
              <div className="font-display text-xl font-extrabold">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* route map */}
      <h3 className="section-title mb-3">The route</h3>
      <div className="mb-6">
        <MiniMap points={points} center={[46.8, 7.6]} height={300} />
      </div>

      {/* expense recap */}
      <h3 className="section-title mb-3">Spend recap</h3>
      <div className="card mb-6 p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="label">Committed</div>
            <div className="font-display text-lg font-bold">{formatINR(trip.budget.committedINR)}</div>
          </div>
          <div>
            <div className="label">Live spent</div>
            <div className="font-display text-lg font-bold">{formatCHF(bt.actualCHF)}</div>
          </div>
          <div>
            <div className="label">Projected</div>
            <div className="font-display text-lg font-bold">{formatCHF(bt.projectedCHF)}</div>
          </div>
          <div>
            <div className="label">Per person</div>
            <div className="font-display text-lg font-bold">{formatCHF(bt.projectedCHF / 4)}</div>
          </div>
        </div>
      </div>

      {/* journal timeline */}
      <h3 className="section-title mb-3">Day-by-day journal</h3>
      <div className="relative space-y-3 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-pine-100 dark:before:bg-pine-700">
        {journal.map((d, i) => {
          const acts = dayActivities(d);
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.03 }}
              className="relative flex gap-3"
            >
              <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-600 font-display text-sm font-bold text-white dark:bg-glacier-500">
                {d.dayNumber}
              </div>
              <div className="card flex-1 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    {formatDateLong(d.date)} · {d.city}
                  </div>
                  <button className="grid h-7 w-7 place-items-center rounded-lg bg-pine-50 text-ink-mute dark:bg-pine-700/50" title="Add photos (post-trip)">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h4 className="mt-1 font-display text-sm font-bold">{d.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft dark:text-glacier-100/80">{d.summary}</p>
                {acts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {acts.map((a) => (
                      <Chip key={a.id} tone="mute" className="!text-[10px]">
                        {(a.altitudeM ?? 0) >= 1500 ? '🏔 ' : ''}
                        {a.title}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-pine-50 p-4 text-xs text-ink-soft dark:bg-pine-700/40 dark:text-glacier-100/80">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-glacier-500" />
        <span>
          This journal is generated from your itinerary so it's ready before you even leave. On the trip, tap the camera on any
          day to attach photos (stored privately on-device), and hit <b>Share</b> to send the whole recap to family.
        </span>
      </div>
    </div>
  );
}
