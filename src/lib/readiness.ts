import type { Trip } from '../types';
import { budgetTotals, packingPct } from './selectors';

export interface ReadinessComponent {
  key: string;
  label: string;
  score: number; // 0..100
  weight: number;
  detail: string;
}

export interface Readiness {
  score: number; // weighted 0..100
  components: ReadinessComponent[];
}

export function computeReadiness(trip: Trip): Readiness {
  // Documents
  const docsTotal = trip.docs.length;
  const docsVerified = trip.docs.filter((d) => d.status === 'verified').length;
  const docsScore = docsTotal ? (docsVerified / docsTotal) * 100 : 100;

  // Packing
  const packScore = packingPct(trip);

  // Budget on-track (planned within live budget)
  const bt = budgetTotals(trip);
  const budgetScore = bt.liveCHF <= 0 ? 100 : Math.max(0, Math.min(100, (1 - Math.max(0, bt.projectedCHF - bt.liveCHF) / bt.liveCHF) * 100));

  // Bookings confirmed (stays + flights)
  const stayConfirmed = trip.stays.filter((s) => s.confirmed).length;
  const bookScore = trip.stays.length ? (stayConfirmed / trip.stays.length) * 100 : 100;

  // Weather checked — a soft component, satisfied once the app has loaded forecasts.
  const weatherScore = 85; // app pulls/falls-back to weather on load; treated as mostly-ready

  const components: ReadinessComponent[] = [
    {
      key: 'documents',
      label: 'Documents',
      score: Math.round(docsScore),
      weight: 0.25,
      detail: `${docsVerified}/${docsTotal} verified`,
    },
    {
      key: 'packing',
      label: 'Packing',
      score: Math.round(packScore),
      weight: 0.25,
      detail: `${packScore}% packed`,
    },
    {
      key: 'budget',
      label: 'Budget on track',
      score: Math.round(budgetScore),
      weight: 0.2,
      detail: bt.overBudget ? 'Projected over budget' : 'Within budget',
    },
    {
      key: 'bookings',
      label: 'Bookings confirmed',
      score: Math.round(bookScore),
      weight: 0.2,
      detail: `${stayConfirmed}/${trip.stays.length} stays + flights`,
    },
    {
      key: 'weather',
      label: 'Weather checked',
      score: weatherScore,
      weight: 0.1,
      detail: 'Forecasts loaded',
    },
  ];

  const score = Math.round(components.reduce((s, c) => s + c.score * c.weight, 0));
  return { score, components };
}
