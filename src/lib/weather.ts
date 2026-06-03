import type { City, DayWeather } from '../types';
import { seedWeather, seedCityWeather, cityCoords, wmo } from '../data/seedWeather';

const memo = new Map<City, DayWeather[]>();

/** Fetch a 9-day forecast for a city from Open-Meteo (no key). Falls back to seed. */
export async function fetchCityForecast(city: City, signal?: AbortSignal): Promise<DayWeather[]> {
  if (memo.has(city)) return memo.get(city)!;
  const { lat, lng } = cityCoords[city];
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&forecast_days=10`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4500);
    const res = await fetch(url, { signal: signal ?? ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    const d = json.daily;
    const out: DayWeather[] = d.time.map((date: string, i: number) => {
      const code = d.weather_code[i];
      return {
        date,
        city,
        tMax: Math.round(d.temperature_2m_max[i]),
        tMin: Math.round(d.temperature_2m_min[i]),
        code,
        precipProb: d.precipitation_probability_max?.[i] ?? 0,
        source: 'live' as const,
        ...wmo(code),
      };
    });
    memo.set(city, out);
    return out;
  } catch {
    const seed = seedForCity(city);
    return seed;
  }
}

function seedForCity(city: City): DayWeather[] {
  const matches = seedWeather.filter((w) => w.city === city);
  if (matches.length) return matches;
  return [seedCityWeather[city]];
}

/** Best-effort weather for a specific date+city. Always returns something. */
export async function weatherForDate(date: string, city: City): Promise<DayWeather> {
  // Try seed first (fast, guaranteed), then enhance with live if available.
  const seed =
    seedWeather.find((w) => w.date === date && w.city === city) ??
    seedWeather.find((w) => w.date === date) ??
    seedCityWeather[city];
  try {
    const forecast = await fetchCityForecast(city);
    const live = forecast.find((w) => w.date === date);
    if (live) return live;
  } catch {
    /* fall through to seed */
  }
  return seed;
}

/** Synchronous seed-only lookup for instant render (no await, never blank). */
export function seedWeatherFor(date: string, city: City): DayWeather {
  return (
    seedWeather.find((w) => w.date === date && w.city === city) ??
    seedWeather.find((w) => w.date === date) ??
    seedCityWeather[city]
  );
}

export function isWet(w: DayWeather): boolean {
  return w.precipProb >= 50 || (w.code >= 51 && w.code <= 99);
}
