import { useCallback, useEffect, useState } from 'react';

const KEY = 'voyage-theme';
type Theme = 'light' | 'dark';

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  const apply = useCallback((t: Theme) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
    setTheme(t);
  }, []);

  const toggle = useCallback(() => apply(current() === 'dark' ? 'light' : 'dark'), [apply]);

  useEffect(() => setTheme(current()), []);

  return { theme, toggle, setTheme: apply };
}
