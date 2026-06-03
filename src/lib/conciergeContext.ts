import type { Trip } from '../types';
import { currentDay, dayActivities, dayHasAlpine, dayMaxAltitude, budgetTotals } from './selectors';
import { seedWeatherFor } from './weather';
import { formatCHF, formatINR } from './format';
import { foodById } from '../data/food';

/** A compact, grounded snapshot of "right now" — injected into the LLM system
 *  prompt AND consumed by the local rules engine. Single source of truth. */
export interface TripSnapshot {
  today: string;
  city: string;
  dayTitle: string;
  weather: string;
  alpine: boolean;
  maxAltitude: number;
  activitiesToday: string[];
  nextDayCity: string | null;
  budgetLine: string;
  vegFoodNearby: string[];
  text: string; // human-readable block for the system prompt
}

export function buildSnapshot(trip: Trip): TripSnapshot {
  const day = currentDay(trip);
  const city = day?.city ?? trip.stays[0].city;
  const w = day ? seedWeatherFor(day.date, day.city) : seedWeatherFor(trip.startDate, city as any);
  const acts = day ? dayActivities(day).map((a) => a.title) : [];
  const alpine = day ? dayHasAlpine(day) : false;
  const maxAlt = day ? dayMaxAltitude(day) : 0;
  const bt = budgetTotals(trip);
  const idx = day ? trip.days.findIndex((d) => d.id === day.id) : -1;
  const nextDay = idx >= 0 && idx < trip.days.length - 1 ? trip.days[idx + 1] : null;

  const veg = trip.food
    .filter((f) => f.city === city && f.vegFriendly)
    .slice(0, 4)
    .map((f) => `${f.name} (${f.cuisine}, ${f.priceBand}, ${f.area})`);

  const budgetLine = `${formatCHF(bt.remainingCHF)} left of ${formatCHF(bt.liveCHF)} live budget (spent ${formatCHF(
    bt.actualCHF
  )} ≈ ${formatINR(bt.actualCHF * bt.fxRate)}). Projected total ${formatCHF(bt.projectedCHF)}${
    bt.overBudget ? ' — slightly over, watch activity costs.' : ' — on track.'
  }`;

  const text = [
    `Trip: ${trip.title} — ${trip.subtitle}.`,
    `Today (${day?.date ?? '—'}): Day ${day?.dayNumber ?? '?'} in ${city}. "${day?.title ?? ''}".`,
    `Weather in ${city}: ${w.icon} ${w.label}, ${w.tMin}–${w.tMax}°C, ${w.precipProb}% chance of rain.`,
    alpine
      ? `ALPINE EXCURSION today up to ${maxAlt.toLocaleString()} m — near-freezing & snowy at the top; warm layers, gloves, sunglasses required.`
      : `No high-altitude excursion today — valley temps are summery; light clothing is fine.`,
    acts.length ? `Planned today: ${acts.join('; ')}.` : `No fixed activities locked today.`,
    nextDay ? `Tomorrow: ${nextDay.city} — ${nextDay.title}.` : `No further days.`,
    `Budget: ${budgetLine}`,
    veg.length ? `Veg-friendly nearby: ${veg.join(' | ')}.` : '',
    `Travelers: all 4 are vegetarian (Rachana prefers pure/Jain-friendly veg; Ronit, 17, has a peanut allergy).`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    today: day?.date ?? trip.startDate,
    city,
    dayTitle: day?.title ?? '',
    weather: `${w.icon} ${w.label}, ${w.tMin}–${w.tMax}°C`,
    alpine,
    maxAltitude: maxAlt,
    activitiesToday: acts,
    nextDayCity: nextDay?.city ?? null,
    budgetLine,
    vegFoodNearby: veg,
    text,
  };
}

export const SUGGESTED_QUESTIONS = [
  'What should we carry today?',
  'Where can we eat veg nearby?',
  'What if it rains tomorrow?',
  'How much have we spent so far?',
  'Can we fit another attraction before dinner?',
  'Which train should we take next?',
];

/** Local rules-based engine — answers the canned set from the snapshot.
 *  Used offline or when no HF token is configured. Never throws. */
export function localConciergeAnswer(question: string, trip: Trip): string {
  const q = question.toLowerCase();
  const s = buildSnapshot(trip);
  const day = currentDay(trip);
  const bt = budgetTotals(trip);

  // What to carry / pack
  if (/(carry|wear|pack|bring|clothes|cold|warm|layers)/.test(q)) {
    if (s.alpine) {
      return `Today is an alpine day in ${s.city} — up to ${s.maxAltitude.toLocaleString()} m, where it's near-freezing and snowy even in June. Carry: warm insulated jackets, gloves, beanies, sunglasses (glacier glare) and SPF 50. Down in the valley it's ${s.weather}, so dress in layers you can peel off. Don't forget water bottles and a packed Coop lunch — mountain-top food is pricey.`;
    }
    return `No high-altitude excursion today, so it's a summer-valley day: ${s.weather} in ${s.city}. Light clothing, comfortable walking shoes, sunglasses and SPF are enough. Toss a light rain jacket in the bag — afternoon showers are possible (${s.activitiesToday.length ? s.activitiesToday[0] : 'sightseeing'} is the plan). No need for heavy winter gear today.`;
  }

  // Veg food nearby
  if (/(eat|food|restaurant|veg|vegetarian|dinner|lunch|hungry)/.test(q)) {
    if (s.vegFoodNearby.length) {
      const picks = trip.food.filter((f) => f.city === s.city && f.vegFriendly).slice(0, 4);
      const lines = picks.map((f) => `• ${f.name} — ${f.cuisine} (${f.priceBand}, ${f.area}). ${f.note}`).join('\n');
      return `Veg-friendly spots in ${s.city} (all 4 of you are vegetarian):\n${lines}\n\nTip: the apartment kitchens (Interlaken & Lucerne) + a Coop run are the biggest budget lever.`;
    }
    return `You're vegetarian-friendly everywhere on this trip — Switzerland handles veg well. Cheese fondue and rösti are naturally meat-free, and there's an Indian or pure-veg option seeded in every city. Check the City Guide → Food tab for ${s.city}.`;
  }

  // Rain tomorrow / weather contingency
  if (/(rain|weather|forecast|cloud|storm|wet)/.test(q)) {
    const idx = day ? trip.days.findIndex((d) => d.id === day.id) : -1;
    const next = idx >= 0 && idx < trip.days.length - 1 ? trip.days[idx + 1] : null;
    if (next) {
      const nw = seedWeatherFor(next.date, next.city);
      const wet = nw.precipProb >= 50 || (nw.code >= 51 && nw.code <= 99);
      if (wet) {
        return `Tomorrow in ${next.city} looks wet: ${nw.icon} ${nw.label}, ${nw.precipProb}% rain. Swap the outdoor/alpine plan for indoor-friendly picks: Trümmelbach Falls (inside the mountain), the Olympic Museum, Lucerne Old Town & Lion Monument, or move the mountain day to a clearer slot. Alpine summits also lose the view in cloud — worth rescheduling Jungfraujoch/Pilatus to a clear morning.`;
      }
      return `Tomorrow in ${next.city} looks good: ${nw.icon} ${nw.label}, ${nw.tMin}–${nw.tMax}°C, only ${nw.precipProb}% rain — the outdoor/alpine plan is a go. If you want a backup anyway, Trümmelbach Falls and the museums are all-weather.`;
    }
    return `Today in ${s.city}: ${s.weather}. If a forecast turns wet, lean on the indoor options — Trümmelbach Falls, Olympic Museum, Old Towns — and save the mountains for a clear morning.`;
  }

  // Budget / spend
  if (/(spent|spend|budget|money|cost|afford|cheap|expensive|chf|inr|rupee)/.test(q)) {
    const lines = Object.entries(bt.byCategory)
      .map(([c, v]) => `• ${c}: spent ${formatCHF(v.actual)} of ${formatCHF(v.planned)} planned`)
      .join('\n');
    return `Budget snapshot:\n${s.budgetLine}\n\nBy category:\n${lines}\n\nThe ₹6L for flights, hotels & visa is locked/committed; this is the live ₹5L you're managing. Biggest levers left: cooking at the apartments and Coop picnics on mountain days.`;
  }

  // Fit another attraction
  if (/(fit|another|squeeze|before dinner|time for|more|extra activity)/.test(q)) {
    if (!day) return `Open the Itinerary to see today's blocks — most days have a little evening slack for one more easy stop.`;
    const acts = dayActivities(day);
    const used = acts.reduce((sum, a) => sum + a.durationMin, 0);
    const optional = trip.activities.filter((a) => a.city === s.city && !a.onItinerary);
    if (used > 8 * 60) {
      return `Today in ${s.city} is already full (~${Math.round(used / 60)}h of activities). I'd not add more — keep the evening relaxed. If you're keen, make ${optional[0]?.title ?? 'an optional stop'} a quick, droppable add-on.`;
    }
    const pick = optional.find((a) => !a.weatherDependent) ?? optional[0];
    return `There's likely room before dinner. A good quick add in ${s.city}: ${pick ? `${pick.title} (~${Math.round(pick.durationMin / 60)}h, ${pick.costCHF ? formatCHF(pick.costCHF) : 'free'})` : 'a short Old Town walk'}. Keep it flexible so dinner isn't rushed.`;
  }

  // Train / route
  if (/(train|sbb|route|how do we get|next train|travel|reach|station|fastest)/.test(q)) {
    if (!day) return `Use the SBB links on each itinerary leg for live times. Your Swiss Travel Pass covers most trains, boats and many mountain legs.`;
    const legs = ['morning', 'afternoon', 'evening', 'night']
      .flatMap((k) => day.blocks[k as 'morning'].travel)
      .filter((l) => l.mode !== 'flight');
    if (legs.length) {
      const l = legs[0];
      return `Next leg today: ${l.from} → ${l.to} by ${l.mode}, about ${l.durationMin} min${
        l.note ? ` (${l.note})` : ''
      }. Tap the SBB link on that itinerary block for live departures. Your Swiss Travel Pass should cover it.`;
    }
    return `No train legs locked for today in ${s.city} — it's a walkable day. For anything else, the SBB links in the Itinerary give live times, and your Swiss Travel Pass covers most journeys.`;
  }

  // Fallback — helpful, grounded, never blank
  return `Here's where things stand: it's Day ${day?.dayNumber ?? '?'} in ${s.city} — ${s.dayTitle}. Weather ${s.weather}. ${
    s.alpine ? 'Alpine day — pack warm layers. ' : ''
  }${s.budgetLine}\n\nTry asking: "What should we carry today?", "Where can we eat veg nearby?", "What if it rains tomorrow?" or "How much have we spent so far?"`;
}
