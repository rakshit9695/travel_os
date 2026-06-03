import { useCallback, useState } from 'react';
import { TODAY_OVERRIDE_KEY } from './format';

/** Hidden dev toggle: simulate "today" to demo on-trip state (e.g. 18 Jun 2026). */
export function useDevDate() {
  const [override, setOverrideState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TODAY_OVERRIDE_KEY);
    } catch {
      return null;
    }
  });

  const setOverride = useCallback((iso: string | null) => {
    try {
      if (iso) localStorage.setItem(TODAY_OVERRIDE_KEY, iso);
      else localStorage.removeItem(TODAY_OVERRIDE_KEY);
    } catch {
      /* ignore */
    }
    setOverrideState(iso);
    // hard reload so all date-derived state recomputes cleanly
    window.location.reload();
  }, []);

  return { override, setOverride };
}
