import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  BlockKey,
  BudgetEntry,
  PackingItem,
  Traveler,
  Trip,
  TravelDoc,
} from '../types';
import { loadTrip, resetTrip as dbReset, saveTrip } from './db';

interface StoreValue {
  trip: Trip | null;
  ready: boolean;
  // budget
  addExpense: (e: Omit<BudgetEntry, 'id'>) => void;
  updateExpense: (id: string, patch: Partial<BudgetEntry>) => void;
  deleteExpense: (id: string) => void;
  setFxRate: (rate: number) => void;
  // packing
  togglePacked: (id: string) => void;
  setPackingBag: (id: string, bagId: string) => void;
  addPackingItem: (item: Omit<PackingItem, 'id'>) => void;
  // itinerary
  addActivityToDay: (dayId: string, block: BlockKey, activityId: string) => void;
  removeActivityFromDay: (dayId: string, block: BlockKey, activityId: string) => void;
  swapDayBlocks: (aId: string, bId: string) => void;
  // travelers
  updateTraveler: (id: string, patch: Partial<Traveler>) => void;
  // docs
  updateDoc: (id: string, patch: Partial<TravelDoc>) => void;
  // misc
  reset: () => Promise<void>;
  bump: number; // increments on any change (for memo busting)
}

const StoreCtx = createContext<StoreValue | null>(null);

let uid = 0;
const newId = (p: string) => `${p}-${Date.now()}-${++uid}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [ready, setReady] = useState(false);
  const [bump, setBump] = useState(0);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    loadTrip().then((t) => {
      if (mounted) {
        setTrip(t);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Debounced persistence on every change.
  const persist = useCallback((next: Trip) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveTrip(next), 300);
  }, []);

  const mutate = useCallback(
    (fn: (t: Trip) => Trip) => {
      setTrip((prev) => {
        if (!prev) return prev;
        const next = fn(structuredClone(prev));
        persist(next);
        return next;
      });
      setBump((b) => b + 1);
    },
    [persist]
  );

  const value = useMemo<StoreValue>(
    () => ({
      trip,
      ready,
      bump,
      addExpense: (e) =>
        mutate((t) => {
          t.budget.entries.push({ ...e, id: newId('b') });
          return t;
        }),
      updateExpense: (id, patch) =>
        mutate((t) => {
          const i = t.budget.entries.findIndex((x) => x.id === id);
          if (i >= 0) t.budget.entries[i] = { ...t.budget.entries[i], ...patch };
          return t;
        }),
      deleteExpense: (id) =>
        mutate((t) => {
          t.budget.entries = t.budget.entries.filter((x) => x.id !== id);
          return t;
        }),
      setFxRate: (rate) =>
        mutate((t) => {
          t.budget.fxRate = rate;
          return t;
        }),
      togglePacked: (id) =>
        mutate((t) => {
          const it = t.packing.find((p) => p.id === id);
          if (it) it.packed = !it.packed;
          return t;
        }),
      setPackingBag: (id, bagId) =>
        mutate((t) => {
          const it = t.packing.find((p) => p.id === id);
          if (it) it.bagId = bagId;
          return t;
        }),
      addPackingItem: (item) =>
        mutate((t) => {
          t.packing.push({ ...item, id: newId('pk') });
          return t;
        }),
      addActivityToDay: (dayId, block, activityId) =>
        mutate((t) => {
          const d = t.days.find((x) => x.id === dayId);
          if (d && !d.blocks[block].activities.includes(activityId)) {
            d.blocks[block].activities.push(activityId);
          }
          return t;
        }),
      removeActivityFromDay: (dayId, block, activityId) =>
        mutate((t) => {
          const d = t.days.find((x) => x.id === dayId);
          if (d) d.blocks[block].activities = d.blocks[block].activities.filter((a) => a !== activityId);
          return t;
        }),
      swapDayBlocks: (aId, bId) =>
        mutate((t) => {
          const a = t.days.find((x) => x.id === aId);
          const b = t.days.find((x) => x.id === bId);
          if (a && b) {
            // swap the plan (blocks + headline) but keep date / dayNumber / city.
            [a.blocks, b.blocks] = [b.blocks, a.blocks];
            [a.title, b.title] = [b.title, a.title];
            [a.summary, b.summary] = [b.summary, a.summary];
          }
          return t;
        }),
      updateTraveler: (id, patch) =>
        mutate((t) => {
          const i = t.travelers.findIndex((x) => x.id === id);
          if (i >= 0) t.travelers[i] = { ...t.travelers[i], ...patch };
          return t;
        }),
      updateDoc: (id, patch) =>
        mutate((t) => {
          const i = t.docs.findIndex((x) => x.id === id);
          if (i >= 0) t.docs[i] = { ...t.docs[i], ...patch };
          return t;
        }),
      reset: async () => {
        const fresh = await dbReset();
        setTrip(fresh);
        setBump((b) => b + 1);
      },
    }),
    [trip, ready, bump, mutate]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}

/** Convenience: assert trip is loaded (screens render under <AppReady/>). */
export function useTrip(): Trip {
  const { trip } = useStore();
  if (!trip) throw new Error('Trip not loaded');
  return trip;
}
