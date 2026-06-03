import type { City, DayWeather } from '../types';

// Realistic mid-June summer fallback. Used when Open-Meteo is unavailable/offline.
// Valley temps are warm (NOT winter). One showery day to exercise rain logic.
function w(date: string, city: City, tMax: number, tMin: number, code: number, precip: number): DayWeather {
  return { date, city, tMax, tMin, code, precipProb: precip, source: 'seed', ...wmo(code) };
}

export function wmo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { label: 'Mostly sunny', icon: '🌤️' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '🌨️' };
  if (code <= 82) return { label: 'Showers', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  return { label: 'Thunderstorm', icon: '⛈️' };
}

export const seedWeather: DayWeather[] = [
  w('2026-06-17', 'Lausanne', 24, 15, 1, 10),
  w('2026-06-18', 'Geneva', 25, 16, 0, 5),
  w('2026-06-19', 'Interlaken', 23, 14, 2, 20),
  w('2026-06-20', 'Interlaken', 22, 13, 1, 15), // Jungfraujoch day — clear below, freezing on top
  w('2026-06-21', 'Interlaken', 20, 13, 80, 60), // showery — good for rain rebalancing
  w('2026-06-22', 'Lucerne', 23, 15, 2, 20),
  w('2026-06-23', 'Lucerne', 25, 16, 1, 10),
  w('2026-06-24', 'Zurich', 24, 15, 3, 25),
];

// City-level "today" defaults for any date not in the trip window.
export const seedCityWeather: Record<City, DayWeather> = {
  Lausanne: w('default', 'Lausanne', 24, 15, 1, 10),
  Interlaken: w('default', 'Interlaken', 22, 13, 2, 20),
  Lucerne: w('default', 'Lucerne', 23, 15, 2, 15),
  Geneva: w('default', 'Geneva', 25, 16, 0, 5),
  Zurich: w('default', 'Zurich', 24, 15, 3, 20),
};

export const cityCoords: Record<City, { lat: number; lng: number }> = {
  Lausanne: { lat: 46.5197, lng: 6.6323 },
  Interlaken: { lat: 46.6863, lng: 7.8632 },
  Lucerne: { lat: 47.0502, lng: 8.3093 },
  Geneva: { lat: 46.2044, lng: 6.1432 },
  Zurich: { lat: 47.3769, lng: 8.5417 },
};
