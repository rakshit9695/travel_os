import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Plus,
  X,
  Lock,
  TrendingUp,
  TriangleAlert,
  Receipt,
  Camera,
  Trash2,
  Users,
  ArrowLeftRight,
} from 'lucide-react';
import type { BudgetCategory, BudgetEntry } from '../types';
import { useStore, useTrip } from '../lib/store';
import { budgetTotals, splitByTraveler } from '../lib/selectors';
import { formatCHF, formatINR, formatDayMonth, now, ymd } from '../lib/format';
import { PageHeader, Chip, CountUp } from '../components/ui/primitives';
import { saveBlob } from '../lib/db';

const CATEGORIES: BudgetCategory[] = ['Activities', 'Food', 'Local transport', 'Shopping', 'Misc'];
const CAT_COLOR: Record<BudgetCategory, string> = {
  Activities: '#0F3D3E',
  Food: '#2BB6AB',
  'Local transport': '#7BDCB5',
  Shopping: '#E4322B',
  Misc: '#A9C5BF',
};

function AddExpense({ onClose }: { onClose: () => void }) {
  const trip = useTrip();
  const { addExpense } = useStore();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Food');
  const [actualCHF, setActual] = useState('');
  const [paidBy, setPaidBy] = useState(trip.travelers[2].id);
  const [split, setSplit] = useState<string[]>(trip.travelers.map((t) => t.id));
  const [receiptId, setReceiptId] = useState<string | undefined>();

  const toggleSplit = (id: string) =>
    setSplit((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = `rcpt-${Date.now()}`;
    await saveBlob(id, file);
    setReceiptId(id);
  };

  const submit = () => {
    const amt = parseFloat(actualCHF);
    if (!label.trim() || isNaN(amt)) return;
    addExpense({
      date: ymd(now()),
      category,
      label: label.trim(),
      plannedCHF: amt,
      actualCHF: amt,
      paidBy,
      splitAmong: split.length ? split : trip.travelers.map((t) => t.id),
      receiptImageId: receiptId,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-end bg-pine-900/40 backdrop-blur-sm sm:place-items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        className="card max-h-[88vh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Add expense</h3>
          <button onClick={onClose} className="text-ink-mute">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="label">What for?</label>
        <input className="input mt-1" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Lunch at Tibits" autoFocus />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (CHF)</label>
            <input
              className="input mt-1"
              inputMode="decimal"
              value={actualCHF}
              onChange={(e) => setActual(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {actualCHF && !isNaN(parseFloat(actualCHF)) && (
          <p className="mt-1.5 text-xs text-ink-mute">≈ {formatINR(parseFloat(actualCHF) * trip.budget.fxRate)}</p>
        )}

        <label className="label mt-3 block">Paid by</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {trip.travelers.map((t) => (
            <button
              key={t.id}
              onClick={() => setPaidBy(t.id)}
              className={`chip ${paidBy === t.id ? 'bg-pine-600 text-white' : 'bg-pine-50 text-ink-soft dark:bg-pine-700/40'}`}
            >
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <label className="label mt-3 block">Split among</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {trip.travelers.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleSplit(t.id)}
              className={`chip ${split.includes(t.id) ? 'bg-glacier-100 text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200' : 'bg-pine-50 text-ink-mute dark:bg-pine-700/40'}`}
            >
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <label className="btn-soft mt-3 w-full cursor-pointer">
          <Camera className="h-4 w-4" /> {receiptId ? 'Receipt attached ✓' : 'Attach receipt photo'}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>

        <button onClick={submit} className="btn-primary mt-4 w-full">
          Add expense
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Budget() {
  const trip = useTrip();
  const { deleteExpense, setFxRate } = useStore();
  const bt = useMemo(() => budgetTotals(trip), [trip]);
  const split = useMemo(() => splitByTraveler(trip), [trip]);
  const [adding, setAdding] = useState(false);
  const [editFx, setEditFx] = useState(false);

  const tripDayCount = 8;
  const burn = bt.actualCHF / tripDayCount;

  const pieData = CATEGORIES.map((c) => ({
    name: c,
    value: bt.byCategory[c]?.planned ?? 0,
  })).filter((d) => d.value > 0);

  const barData = CATEGORIES.map((c) => ({
    name: c.replace('Local transport', 'Transport'),
    Planned: Math.round(bt.byCategory[c]?.planned ?? 0),
    Actual: Math.round(bt.byCategory[c]?.actual ?? 0),
  }));

  const entries = [...trip.budget.entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        title="Budget"
        subtitle="The live ₹5L you're managing on the ground."
        right={
          <button onClick={() => setAdding(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add
          </button>
        }
      />

      {/* committed vs live */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-ink-mute">
            <Lock className="h-4 w-4" />
            <span className="label">Committed (locked)</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            <CountUp value={trip.budget.committedINR} prefix="₹" />
          </div>
          <div className="text-xs text-ink-mute">Flights · hotels · visa — already paid</div>
        </div>
        <div className="card p-4">
          <div className="label">Live budget</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-pine-600 dark:text-glacier-300">
            <CountUp value={trip.budget.liveINR} prefix="₹" />
          </div>
          <div className="text-xs text-ink-mute">{formatCHF(bt.liveCHF)} to spend</div>
        </div>
        <div className="card p-4">
          <div className="label">Remaining</div>
          <div className={`mt-1 font-display text-2xl font-extrabold ${bt.remainingCHF < 0 ? 'text-swiss' : 'text-glacier-600'}`}>
            {formatCHF(bt.remainingCHF)}
          </div>
          <div className="text-xs text-ink-mute">{formatINR(bt.remainingCHF * bt.fxRate)} left</div>
        </div>
      </div>

      {/* progress bar + projection */}
      <div className="card mb-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="label">Spent so far</div>
            <div className="font-display text-2xl font-extrabold">{formatCHF(bt.actualCHF)}</div>
          </div>
          <div className="text-right">
            <div className="label">of {formatCHF(bt.liveCHF)}</div>
            <div className="text-xs text-ink-mute">{Math.round(bt.pctSpent)}% used</div>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-pine-100 dark:bg-pine-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, bt.pctSpent)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-glacier-gradient"
          />
          {/* projected marker */}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="label">Daily burn</div>
            <div className="font-display font-bold">{formatCHF(burn)}/day</div>
          </div>
          <div>
            <div className="label">Projected total</div>
            <div className="font-display font-bold">{formatCHF(bt.projectedCHF)}</div>
          </div>
          <div>
            <div className="label flex items-center gap-1">
              FX rate
              <button onClick={() => setEditFx((e) => !e)} className="text-glacier-500">
                <ArrowLeftRight className="h-3 w-3" />
              </button>
            </div>
            {editFx ? (
              <input
                className="input mt-0.5 !py-1 !text-sm"
                type="number"
                defaultValue={bt.fxRate}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > 0) setFxRate(v);
                  setEditFx(false);
                }}
                autoFocus
              />
            ) : (
              <div className="font-display font-bold">1 CHF = ₹{bt.fxRate}</div>
            )}
          </div>
          <div>
            <div className="label">Status</div>
            <div className={`font-display font-bold ${bt.overBudget ? 'text-swiss' : 'text-glacier-600'}`}>
              {bt.overBudget ? 'Over' : 'On track'}
            </div>
          </div>
        </div>
        {bt.overBudget && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-swiss/10 p-3 text-xs text-swiss">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Projected spend exceeds the live budget by {formatCHF(bt.projectedCHF - bt.liveCHF)}. Biggest levers: cook at the
            apartments, pack Coop picnics for mountain days, and lean on Swiss-Travel-Pass-free boats & Rigi.
          </div>
        )}
      </div>

      {/* charts */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="section-title mb-2">Planned by category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={CAT_COLOR[d.name as BudgetCategory]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCHF(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-ink-mute">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_COLOR[d.name as BudgetCategory] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-2">Planned vs actual</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: -18, right: 6, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={42} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatCHF(v)} />
                <Bar dataKey="Planned" fill="#7BDCB5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#0F3D3E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* split */}
      <div className="card mb-4 p-5">
        <h3 className="section-title mb-3 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Split so far (per traveler)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trip.travelers.map((t) => (
            <div key={t.id} className="rounded-2xl bg-pine-50 p-3 dark:bg-pine-700/40">
              <div className="text-xs font-semibold text-ink-soft dark:text-glacier-100">{t.name.split(' ')[0]}</div>
              <div className="mt-1 font-display text-lg font-bold">{formatCHF(split[t.id] ?? 0)}</div>
              <div className="text-[11px] text-ink-mute">{formatINR((split[t.id] ?? 0) * bt.fxRate)}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-mute">Each person's share of all spend split among them. Equal shares per expense.</p>
      </div>

      {/* entries */}
      <h3 className="section-title mb-3 flex items-center gap-1.5">
        <Receipt className="h-3.5 w-3.5" /> Expenses
      </h3>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="card flex items-center gap-3 p-3">
            <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: CAT_COLOR[e.category] }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{e.label}</div>
              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-ink-mute">
                <span>{e.category}</span>
                <span>·</span>
                <span>{formatDayMonth(e.date)}</span>
                <span>·</span>
                <span>paid by {trip.travelers.find((t) => t.id === e.paidBy)?.name.split(' ')[0] ?? '—'}</span>
                {e.receiptImageId && <Chip tone="mint" className="!py-0 !text-[9px]">receipt</Chip>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold">{formatCHF(e.actualCHF || e.plannedCHF)}</div>
              {e.actualCHF === 0 && <div className="text-[10px] font-semibold text-amber-600">planned</div>}
            </div>
            <button onClick={() => deleteExpense(e.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-swiss/10 hover:text-swiss">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>{adding && <AddExpense onClose={() => setAdding(false)} />}</AnimatePresence>
    </div>
  );
}
