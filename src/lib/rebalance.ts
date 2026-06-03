import type { Day, Trip } from '../types';
import { seedWeatherFor, isWet } from './weather';
import { dayActivities } from './selectors';

// ─────────────────────────────────────────────────────────────
// Weather-driven rebalancing (P2)
// Deterministic & offline: uses the seeded forecast so the demo is stable.
// ─────────────────────────────────────────────────────────────

/** How weather-critical a day's plan is (alpine summits + outdoor activities). */
export function weatherSensitivity(day: Day): number {
  return dayActivities(day).reduce((s, a) => {
    let v = 0;
    if ((a.altitudeM ?? 0) >= 2500) v += 4;
    else if ((a.altitudeM ?? 0) >= 1500) v += 2;
    if (a.weatherDependent) v += 1;
    return s + v;
  }, 0);
}

/** 0–100, higher = clearer. */
export function clarity(precipProb: number, code: number): number {
  let c = 100 - precipProb;
  if (code >= 51 && code <= 99) c -= 20;
  return Math.max(0, c);
}

/** A day is safe to swap if it isn't a check-in/out transfer or a flight day. */
export function isSwapSafe(trip: Trip, day: Day): boolean {
  if (day.phase === 'Travel') return false;
  const isTransfer = trip.stays.some((s) => s.checkIn === day.date || s.checkOut === day.date);
  const hasFlight = (['morning', 'afternoon', 'evening', 'night'] as const).some((k) =>
    day.blocks[k].travel.some((l) => l.mode === 'flight')
  );
  return !isTransfer && !hasFlight;
}

export interface WeatherRisk {
  day: Day;
  precipProb: number;
  label: string;
  icon: string;
  sensitivity: number;
  clarity: number;
  recommendation: string;
  /** A safe, beneficial same-city swap, if one exists. */
  swapWith?: { day: Day; clarity: number };
}

export interface SwapPair {
  city: string;
  a: Day;
  b: Day;
}

export interface RebalanceResult {
  risks: WeatherRisk[];
  swapPairs: SwapPair[]; // all valid manual same-city activity-day pairs
}

export function computeRebalance(trip: Trip): RebalanceResult {
  const days = trip.days.filter((d) => d.phase !== 'Travel');
  const wx = (d: Day) => seedWeatherFor(d.date, d.city);

  // valid manual swap pairs: same city, both swap-safe
  const safe = days.filter((d) => isSwapSafe(trip, d));
  const swapPairs: SwapPair[] = [];
  for (let i = 0; i < safe.length; i++) {
    for (let j = i + 1; j < safe.length; j++) {
      if (safe[i].city === safe[j].city) {
        swapPairs.push({ city: safe[i].city, a: safe[i], b: safe[j] });
      }
    }
  }

  const risks: WeatherRisk[] = [];
  for (const d of days) {
    const w = wx(d);
    const sens = weatherSensitivity(d);
    const cl = clarity(w.precipProb, w.code);
    if (sens > 0 && (isWet(w) || cl < 55)) {
      // find a clearer, same-city swap-safe day that this day's heavier plan
      // would be better served by (sensitivity not greater than the target's clarity gain)
      let best: { day: Day; clarity: number } | undefined;
      if (isSwapSafe(trip, d)) {
        for (const c of safe) {
          if (c.id === d.id || c.city !== d.city) continue;
          const cw = wx(c);
          const ccl = clarity(cw.precipProb, cw.code);
          // beneficial: target is clearer AND its current plan is less weather-sensitive
          if (ccl > cl + 15 && weatherSensitivity(c) < sens) {
            if (!best || ccl > best.clarity) best = { day: c, clarity: ccl };
          }
        }
      }

      const hasIndoorFallback = dayActivities(d).some((a) => a.tags?.includes('rainy-day-ok'));
      const recommendation = best
        ? `Swap this plan onto ${shortDate(best.day.date)} (clearer) and move that lighter day here.`
        : hasIndoorFallback
        ? `Lead with the indoor-friendly stop (e.g. Trümmelbach Falls / a museum) and keep the open-air parts flexible for clear spells.`
        : `Keep the morning flexible — go when the sky opens, and have an indoor fallback ready. Mountain summits lose their view in cloud.`;

      risks.push({
        day: d,
        precipProb: w.precipProb,
        label: w.label,
        icon: w.icon,
        sensitivity: sens,
        clarity: cl,
        recommendation,
        swapWith: best,
      });
    }
  }

  return { risks, swapPairs };
}

function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
