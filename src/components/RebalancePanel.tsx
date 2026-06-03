import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, ArrowLeftRight, Sparkles, ChevronDown, Check, Shuffle } from 'lucide-react';
import { useStore, useTrip } from '../lib/store';
import { computeRebalance } from '../lib/rebalance';
import { formatDateLong } from '../lib/format';
import { Chip } from './ui/primitives';

export function RebalancePanel() {
  const trip = useTrip();
  const { swapDayBlocks } = useStore();
  const { risks, swapPairs } = useMemo(() => computeRebalance(trip), [trip]);
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [a, setA] = useState(swapPairs[0]?.a.id ?? '');
  const [b, setB] = useState(swapPairs[0]?.b.id ?? '');
  const [done, setDone] = useState<string | null>(null);

  const flash = (msg: string) => {
    setDone(msg);
    setTimeout(() => setDone(null), 2200);
  };

  // pairs that share the currently-selected city, for the manual picker
  const cityOf = (id: string) => trip.days.find((d) => d.id === id)?.city;
  const manualOptions = swapPairs;

  return (
    <div className="card mb-5 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-glacier-100 text-glacier-600 dark:bg-glacier-500/20 dark:text-glacier-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold">Weather Watch & Rebalance</h3>
            {risks.length > 0 && (
              <Chip tone="warn" className="!py-0.5 !text-[10px]">
                {risks.length} to review
              </Chip>
            )}
          </div>
          <p className="text-xs text-ink-mute">
            {risks.length > 0
              ? `${risks.length} weather-sensitive day${risks.length > 1 ? 's' : ''} worth a look.`
              : 'Forecast looks well-aligned with your plan. ✓'}
          </p>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-mute transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-pine-100/70 p-4 dark:border-pine-700/60">
              {done && (
                <div className="flex items-center gap-2 rounded-2xl bg-glacier-100 px-3 py-2 text-sm font-semibold text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200">
                  <Check className="h-4 w-4" /> {done}
                </div>
              )}

              {risks.length === 0 && (
                <p className="rounded-2xl bg-pine-50/60 px-3 py-3 text-sm text-ink-soft dark:bg-pine-700/30 dark:text-glacier-100/80">
                  Your weather-sensitive excursions already fall on the clearest days — Jungfraujoch sits on the clearest
                  Interlaken morning. Nothing to move.
                </p>
              )}

              {risks.map((r) => (
                <div key={r.day.id} className="rounded-2xl border border-amber-200/60 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <div className="flex items-start gap-2.5">
                    <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
                        Day {r.day.dayNumber} · {formatDateLong(r.day.date)} — {r.icon} {r.label} ({r.precipProb}% rain)
                      </div>
                      <div className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-200/90">{r.day.title}</div>
                      <div className="mt-2 text-xs text-amber-900 dark:text-amber-100">{r.recommendation}</div>
                      {r.swapWith && (
                        <button
                          onClick={() => {
                            swapDayBlocks(r.day.id, r.swapWith!.day.id);
                            flash(`Swapped Day ${r.day.dayNumber} ↔ ${formatDateLong(r.swapWith!.day.date)}`);
                          }}
                          className="btn-primary mt-2.5 !py-1.5 !text-xs"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" /> Apply smart swap
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* manual swap tool */}
              {manualOptions.length > 0 && (
                <div className="rounded-2xl bg-pine-50/60 p-3 dark:bg-pine-700/30">
                  <button
                    onClick={() => setManual((m) => !m)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-mute"
                  >
                    <Shuffle className="h-3.5 w-3.5" /> Rearrange two days manually
                    <ChevronDown className={`h-3.5 w-3.5 transition ${manual ? 'rotate-180' : ''}`} />
                  </button>
                  {manual && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <select
                        className="input !w-auto !py-2 !text-xs"
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                      >
                        {Array.from(new Set(manualOptions.flatMap((p) => [p.a.id, p.b.id]))).map((id) => {
                          const d = trip.days.find((x) => x.id === id)!;
                          return (
                            <option key={id} value={id}>
                              Day {d.dayNumber} · {d.city}
                            </option>
                          );
                        })}
                      </select>
                      <ArrowLeftRight className="mb-2.5 h-4 w-4 text-ink-mute" />
                      <select
                        className="input !w-auto !py-2 !text-xs"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                      >
                        {Array.from(new Set(manualOptions.flatMap((p) => [p.a.id, p.b.id])))
                          .filter((id) => cityOf(id) === cityOf(a) && id !== a)
                          .map((id) => {
                            const d = trip.days.find((x) => x.id === id)!;
                            return (
                              <option key={id} value={id}>
                                Day {d.dayNumber} · {d.city}
                              </option>
                            );
                          })}
                      </select>
                      <button
                        onClick={() => {
                          if (a && b && a !== b && cityOf(a) === cityOf(b)) {
                            swapDayBlocks(a, b);
                            const da = trip.days.find((x) => x.id === a)!;
                            const db = trip.days.find((x) => x.id === b)!;
                            flash(`Swapped Day ${da.dayNumber} ↔ Day ${db.dayNumber}`);
                          }
                        }}
                        className="btn-ghost !py-2 !text-xs"
                      >
                        Swap
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-ink-mute">
                    Only same-city activity days can swap — transfer and flight days stay put.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
