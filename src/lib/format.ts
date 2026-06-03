// Formatting + date helpers (no external date lib — keep it light & offline).

export const TODAY_OVERRIDE_KEY = 'voyage-today-override';

/** Returns the effective "now" — honours the dev date-simulation toggle. */
export function now(): Date {
  try {
    const o = localStorage.getItem(TODAY_OVERRIDE_KEY);
    if (o) {
      const d = new Date(o);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {
    /* ignore */
  }
  return new Date();
}

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  return new Date(s.length === 10 ? `${s}T00:00:00` : s);
}

export function formatCHF(n: number): string {
  return `CHF ${Math.round(n).toLocaleString('en-CH')}`;
}

export function formatINR(n: number): string {
  // Indian grouping
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function chfToInr(chf: number, rate: number): number {
  return chf * rate;
}

export function inrToChf(inr: number, rate: number): number {
  return inr / rate;
}

export function formatDateLong(s: string): string {
  const d = parseISO(s);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateFull(s: string): string {
  const d = parseISO(s);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDayMonth(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function minutesToHM(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms
  past: boolean;
}

export function countdownTo(target: Date, from: Date = now()): Countdown {
  let total = target.getTime() - from.getTime();
  const past = total < 0;
  total = Math.abs(total);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { days, hours, minutes, seconds, total, past };
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
