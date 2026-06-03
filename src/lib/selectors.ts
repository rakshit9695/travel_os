import type { Activity, BudgetCategory, Day, Trip } from '../types';
import { now, ymd, parseISO } from './format';
import { activityById } from '../data/activities';

export const ALPINE_THRESHOLD_M = 1500;

export function budgetTotals(trip: Trip) {
  const { entries, fxRate, liveINR } = trip.budget;
  const liveCHF = liveINR / fxRate;
  const plannedCHF = entries.reduce((s, e) => s + e.plannedCHF, 0);
  const actualCHF = entries.reduce((s, e) => s + e.actualCHF, 0);
  const remainingCHF = liveCHF - actualCHF;
  const projectedCHF = plannedCHF; // projected end-of-trip = sum of planned
  const overBudget = projectedCHF > liveCHF;

  const byCategory: Record<string, { planned: number; actual: number }> = {};
  for (const e of entries) {
    byCategory[e.category] ??= { planned: 0, actual: 0 };
    byCategory[e.category].planned += e.plannedCHF;
    byCategory[e.category].actual += e.actualCHF;
  }

  return {
    liveCHF,
    liveINR,
    plannedCHF,
    actualCHF,
    remainingCHF,
    projectedCHF,
    overBudget,
    pctSpent: liveCHF > 0 ? (actualCHF / liveCHF) * 100 : 0,
    pctProjected: liveCHF > 0 ? (projectedCHF / liveCHF) * 100 : 0,
    byCategory: byCategory as Record<BudgetCategory, { planned: number; actual: number }>,
    fxRate,
  };
}

/** Per-traveler split of actual spend. */
export function splitByTraveler(trip: Trip) {
  const owe: Record<string, number> = {};
  for (const t of trip.travelers) owe[t.id] = 0;
  for (const e of trip.budget.entries) {
    if (!e.actualCHF) continue;
    const share = e.actualCHF / (e.splitAmong.length || 1);
    for (const id of e.splitAmong) owe[id] = (owe[id] ?? 0) + share;
  }
  return owe;
}

export function tripDays(trip: Trip): Day[] {
  return trip.days.filter((d) => d.phase !== 'Travel' || d.blocks);
}

/** The day matching "today" (honours dev override), else the first upcoming day. */
export function currentDay(trip: Trip): Day | null {
  const today = ymd(now());
  const exact = trip.days.find((d) => d.date === today);
  if (exact) return exact;
  // before trip → first real destination day; after → last
  const sorted = [...trip.days].sort((a, b) => a.date.localeCompare(b.date));
  if (today < sorted[0].date) return sorted.find((d) => d.phase !== 'Travel') ?? sorted[0];
  if (today > sorted[sorted.length - 1].date) return sorted[sorted.length - 1];
  return sorted.find((d) => d.date >= today) ?? null;
}

export function isOnTrip(trip: Trip): boolean {
  const today = ymd(now());
  return today >= trip.startDate && today <= trip.endDate;
}

export function dayActivities(day: Day): Activity[] {
  const ids = [
    ...day.blocks.morning.activities,
    ...day.blocks.afternoon.activities,
    ...day.blocks.evening.activities,
    ...day.blocks.night.activities,
  ];
  return ids.map((id) => activityById(id)).filter(Boolean) as Activity[];
}

export function dayHasAlpine(day: Day): boolean {
  return dayActivities(day).some((a) => (a.altitudeM ?? 0) >= ALPINE_THRESHOLD_M);
}

export function dayMaxAltitude(day: Day): number {
  return Math.max(0, ...dayActivities(day).map((a) => a.altitudeM ?? 0));
}

export function dayTransitMinutes(day: Day): number {
  let total = 0;
  for (const key of ['morning', 'afternoon', 'evening', 'night'] as const) {
    total += day.blocks[key].travel.reduce((s, l) => s + l.durationMin, 0);
  }
  return total;
}

export function dayActivityMinutes(day: Day): number {
  return dayActivities(day).reduce((s, a) => s + a.durationMin, 0);
}

/** Realism check: flag tight/over-packed days. */
export interface DayWarning {
  level: 'info' | 'warn';
  message: string;
  fix?: string;
}

export function dayWarnings(day: Day): DayWarning[] {
  const out: DayWarning[] = [];
  const transit = dayTransitMinutes(day);
  const active = dayActivityMinutes(day);
  const acts = dayActivities(day);
  const flightLegs = ['morning', 'afternoon', 'evening', 'night'].flatMap(
    (k) => day.blocks[k as 'morning'].travel
  );

  if (day.phase !== 'Travel') {
    if (transit > 240) {
      out.push({
        level: 'warn',
        message: `Heavy transit day — about ${Math.round(transit / 60)}h on the move.`,
        fix: 'Consider trimming one stop or starting earlier.',
      });
    }
    if (active + transit > 11 * 60) {
      out.push({
        level: 'warn',
        message: 'This day looks tight — over 11 hours of activities + travel.',
        fix: 'Drop the lowest-priority activity (e.g. a “rainy-day fallback” stop) to add breathing room.',
      });
    }
    if (acts.length >= 4) {
      out.push({
        level: 'info',
        message: `${acts.length} activities planned — pace yourselves.`,
        fix: 'Keep one as optional / flexible.',
      });
    }
  }

  if (dayHasAlpine(day)) {
    out.push({
      level: 'info',
      message: `Alpine excursion up to ${dayMaxAltitude(day).toLocaleString()} m — near-freezing at the top.`,
      fix: 'Pack warm layers, gloves & sunglasses (see Packing).',
    });
  }

  // Airport buffer reminder
  const hasIntlDep = flightLegs.some((l) => l.mode === 'flight' && (l.from === 'ZRH' || l.from === 'BOM'));
  if (hasIntlDep) {
    out.push({
      level: 'warn',
      message: 'International departure — be at the airport ~3 hours early.',
      fix: 'Leave the city with a generous buffer.',
    });
  }

  return out;
}

export function daysUntilDeparture(trip: Trip): number {
  const ms = parseISO(trip.startDate + 'T23:03:00').getTime() - now().getTime();
  return Math.ceil(ms / 86400000);
}

export function packingPct(trip: Trip): number {
  if (!trip.packing.length) return 0;
  const packed = trip.packing.filter((p) => p.packed).length;
  return Math.round((packed / trip.packing.length) * 100);
}
