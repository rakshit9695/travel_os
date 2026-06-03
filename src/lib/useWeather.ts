import { useEffect, useState } from 'react';
import type { City, DayWeather } from '../types';
import { fetchCityForecast, seedWeatherFor } from './weather';

/** Returns weather for a date+city. Renders seed instantly, upgrades to live
 *  silently if the network resolves. Never blank, never throws. */
export function useWeather(date: string, city: City): DayWeather {
  const [w, setW] = useState<DayWeather>(() => seedWeatherFor(date, city));

  useEffect(() => {
    let alive = true;
    setW(seedWeatherFor(date, city));
    fetchCityForecast(city)
      .then((forecast) => {
        if (!alive) return;
        const live = forecast.find((x) => x.date === date);
        if (live) setW(live);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [date, city]);

  return w;
}

/** Whole-forecast hook for a city (seed-first, live-upgrade). */
export function useCityForecast(city: City): DayWeather[] {
  const [list, setList] = useState<DayWeather[]>([]);
  useEffect(() => {
    let alive = true;
    fetchCityForecast(city)
      .then((f) => alive && setList(f))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [city]);
  return list;
}
