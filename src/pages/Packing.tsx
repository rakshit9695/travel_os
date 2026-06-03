import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Search,
  Backpack,
  Snowflake,
  Shirt,
  Plug,
  FileText,
  HeartPulse,
  Package,
  Luggage,
  Plus,
  MapPinned,
  Sparkles,
} from 'lucide-react';
import type { PackingItem } from '../types';
import { useStore, useTrip } from '../lib/store';
import { packingPct } from '../lib/selectors';
import { PageHeader, Chip } from '../components/ui/primitives';

const CAT_ICON: Record<PackingItem['category'], typeof Shirt> = {
  essentials: Package,
  clothing: Shirt,
  alpine: Snowflake,
  tech: Plug,
  documents: FileText,
  health: HeartPulse,
  misc: Package,
};

export default function Packing() {
  const trip = useTrip();
  const { togglePacked, setPackingBag, addPackingItem } = useStore();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'traveler' | 'bag'>('traveler');
  const [newLabel, setNewLabel] = useState('');
  const pct = packingPct(trip);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return trip.packing.filter((p) => p.label.toLowerCase().includes(q));
  }, [query, trip.packing]);

  const ownerName = (id: string) =>
    id === 'shared' ? 'Shared' : trip.travelers.find((t) => t.id === id)?.name.split(' ')[0] ?? id;
  const bagName = (id?: string) => trip.bags.find((b) => b.id === id)?.label ?? 'Unassigned';

  const groups = useMemo(() => {
    if (view === 'traveler') {
      const ids = ['shared', ...trip.travelers.map((t) => t.id)];
      return ids.map((id) => ({
        id,
        label: ownerName(id),
        items: trip.packing.filter((p) => p.travelerId === id),
      }));
    }
    return trip.bags.map((b) => ({
      id: b.id,
      label: b.label,
      items: trip.packing.filter((p) => p.bagId === b.id),
    }));
  }, [view, trip.packing, trip.bags, trip.travelers]);

  const alpineCount = trip.packing.filter((p) => p.category === 'alpine').length;

  const ItemRow = ({ item }: { item: PackingItem }) => {
    const Icon = CAT_ICON[item.category];
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-pine-100/70 bg-white p-2.5 dark:border-pine-700/50 dark:bg-pine-800/50">
        <button
          onClick={() => togglePacked(item.id)}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${
            item.packed
              ? 'border-glacier-500 bg-glacier-500 text-white'
              : 'border-pine-200 text-transparent hover:border-glacier-400 dark:border-pine-600'
          }`}
        >
          <Check className="h-4 w-4" />
        </button>
        <Icon className={`h-4 w-4 shrink-0 ${item.category === 'alpine' ? 'text-glacier-500' : 'text-ink-mute'}`} />
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold ${item.packed ? 'text-ink-mute line-through' : ''}`}>{item.label}</div>
          <div className="text-[11px] text-ink-mute">{item.reason}</div>
        </div>
        <select
          value={item.bagId ?? ''}
          onChange={(e) => setPackingBag(item.id, e.target.value)}
          className="shrink-0 rounded-lg border border-pine-100 bg-pine-50 px-2 py-1 text-[11px] font-semibold text-ink-soft dark:border-pine-600 dark:bg-pine-700/50 dark:text-glacier-100"
        >
          <option value="">No bag</option>
          {trip.bags.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label.split('·')[0].trim()}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Packing Intelligence" subtitle="Altitude-aware lists — warm layers only for alpine days." />

      {/* progress */}
      <div className="card mb-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Packed</div>
            <div className="font-display text-3xl font-extrabold">{pct}%</div>
          </div>
          <div className="text-right text-xs text-ink-mute">
            {trip.packing.filter((p) => p.packed).length} of {trip.packing.length} items
            <div className="mt-1 flex items-center justify-end gap-1 text-glacier-600">
              <Snowflake className="h-3 w-3" /> {alpineCount} alpine-only items
            </div>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-pine-100 dark:bg-pine-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-glacier-gradient"
          />
        </div>
      </div>

      {/* smart insight */}
      <div className="card mb-4 flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-glacier-100 text-glacier-600 dark:bg-glacier-500/20 dark:text-glacier-200">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="min-w-0 text-sm text-ink-soft dark:text-glacier-100/80">
          June is <b>summer in the valleys</b> (18–26°C) — light clothing is enough most days. Warm layers, gloves and a beanie are
          flagged <b>only</b> for the three high-altitude excursions: <b>Jungfraujoch (3,454 m)</b>, <b>Grindelwald-First (2,168 m)</b> and{' '}
          <b>Mt. Pilatus (2,128 m)</b>, where it's near-freezing year-round. Swiss sockets are <b>Type J</b>.
        </p>
      </div>

      {/* lookup */}
      <div className="card mb-4 p-4">
        <div className="flex items-center gap-2 rounded-xl bg-pine-50 px-3 py-2 dark:bg-pine-700/40">
          <Search className="h-4 w-4 text-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='"Which bag has the chargers?"'
            className="w-full bg-transparent text-base sm:text-sm outline-none"
          />
        </div>
        {filtered && (
          <div className="mt-3 space-y-1.5">
            {filtered.length === 0 ? (
              <p className="py-2 text-center text-sm text-ink-mute">Nothing matches "{query}".</p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-glacier-50/60 px-3 py-2 text-sm dark:bg-glacier-500/10">
                  <span className="font-semibold">{item.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-glacier-700 dark:text-glacier-200">
                    <Luggage className="h-3.5 w-3.5" /> {bagName(item.bagId)} · {ownerName(item.travelerId)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* leaving-location reminders */}
      <div className="card mb-4 p-4">
        <h3 className="section-title mb-2 flex items-center gap-1.5">
          <MapPinned className="h-3.5 w-3.5" /> Leaving-a-location checks
        </h3>
        <div className="space-y-1.5 text-sm">
          {[
            'Leaving Lausanne (19 Jun): all 4 passports, chargers, Type-J adapters, hotel-room safe emptied.',
            'Leaving Interlaken (22 Jun): kitchen cleared, day-pack layers repacked, nothing left charging at apartment2lakes.',
            'Leaving Lucerne (24 Jun): EARLY start — pre-pack the night before; confirm passports + Swiss Travel Pass QR codes before the ZRH train.',
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl bg-pine-50/60 px-3 py-2 dark:bg-pine-700/30">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-glacier-500" />
              <span className="text-ink-soft dark:text-glacier-100/80">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* view toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-pine-50 p-1 dark:bg-pine-700/40">
          {(['traveler', 'bag'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold capitalize transition ${
                view === v ? 'bg-white text-pine-700 shadow-soft dark:bg-pine-800 dark:text-glacier-200' : 'text-ink-mute'
              }`}
            >
              By {v}
            </button>
          ))}
        </div>
      </div>

      {/* groups */}
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold">
                {view === 'bag' ? <Luggage className="h-4 w-4 text-glacier-500" /> : <Backpack className="h-4 w-4 text-glacier-500" />}
                {g.label}
              </h3>
              <Chip tone="mute">
                {g.items.filter((i) => i.packed).length}/{g.items.length}
              </Chip>
            </div>
            <div className="space-y-2">
              {g.items.length === 0 ? (
                <p className="py-2 text-center text-xs text-ink-mute">Nothing here yet.</p>
              ) : (
                g.items.map((item) => <ItemRow key={item.id} item={item} />)
              )}
            </div>
          </div>
        ))}
      </div>

      {/* add item */}
      <div className="card mt-4 flex gap-2 p-3">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Add a custom item…"
          className="input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newLabel.trim()) {
              addPackingItem({ travelerId: 'shared', label: newLabel.trim(), packed: false, reason: 'Added manually', category: 'misc' });
              setNewLabel('');
            }
          }}
        />
        <button
          onClick={() => {
            if (!newLabel.trim()) return;
            addPackingItem({ travelerId: 'shared', label: newLabel.trim(), packed: false, reason: 'Added manually', category: 'misc' });
            setNewLabel('');
          }}
          className="btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
