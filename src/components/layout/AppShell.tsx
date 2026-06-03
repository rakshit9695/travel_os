import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  CalendarDays,
  Plane,
  MapPinned,
  Wallet,
  Backpack,
  Sparkles,
  FileText,
  Users,
  BookHeart,
  MoreHorizontal,
  Moon,
  Sun,
  Settings2,
  X,
  RotateCcw,
  CalendarClock,
} from 'lucide-react';
import { Logo, LogoMark } from '../Logo';
import { useTheme } from '../../lib/useTheme';
import { useDevDate } from '../../lib/useDevDate';
import { useStore } from '../../lib/store';
import { countdownTo, now, parseISO } from '../../lib/format';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, primary: true },
  { to: '/itinerary', label: 'Itinerary', icon: CalendarDays, primary: true },
  { to: '/cities', label: 'City Guides', icon: MapPinned, primary: true },
  { to: '/budget', label: 'Budget', icon: Wallet, primary: true },
  { to: '/concierge', label: 'Concierge', icon: Sparkles, primary: true },
  { to: '/bookings', label: 'Bookings', icon: Plane },
  { to: '/packing', label: 'Packing', icon: Backpack },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/family', label: 'Family & Safety', icon: Users },
  { to: '/memories', label: 'Memory Book', icon: BookHeart },
];

function NavRow({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
          isActive
            ? 'bg-pine-600 text-white shadow-soft dark:bg-glacier-500 dark:text-pine-900'
            : 'text-ink-soft hover:bg-pine-50 dark:text-glacier-100/80 dark:hover:bg-pine-700/50'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
    </NavLink>
  );
}

function DepartureCountdown() {
  const target = parseISO('2026-06-16T23:03:00');
  const c = countdownTo(target, now());
  if (c.past) return <span className="text-glacier-500">On the ground 🇨🇭</span>;
  return (
    <span>
      <b className="text-pine-700 dark:text-glacier-200">{c.days}d {c.hours}h</b> to departure
    </span>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, toggle } = useTheme();
  const { override, setOverride } = useDevDate();
  const { reset } = useStore();

  const presets = [
    { label: 'Live (real today)', value: null },
    { label: 'Arrival · 17 Jun', value: '2026-06-17T10:00:00' },
    { label: 'On trip · 18 Jun', value: '2026-06-18T10:00:00' },
    { label: 'Alpine day · 20 Jun', value: '2026-06-20T09:00:00' },
    { label: 'Lucerne · 23 Jun', value: '2026-06-23T10:00:00' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="card absolute right-0 top-12 z-50 w-72 p-4 shadow-lift"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">Settings</h3>
        <button onClick={onClose} className="text-ink-mute hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <button onClick={toggle} className="btn-soft mb-4 w-full justify-between">
        <span className="flex items-center gap-2">
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'dark' ? 'Dark mode' : 'Light mode'}
        </span>
        <span className="text-xs text-ink-mute">tap to switch</span>
      </button>

      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-mute">
        <CalendarClock className="h-3.5 w-3.5" /> Simulate date (demo)
      </div>
      <div className="grid gap-1.5">
        {presets.map((p) => {
          const active = (p.value ?? null) === (override ?? null);
          return (
            <button
              key={p.label}
              onClick={() => setOverride(p.value)}
              className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                active
                  ? 'bg-glacier-100 text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200'
                  : 'bg-pine-50 text-ink-soft hover:bg-pine-100 dark:bg-pine-700/50 dark:text-glacier-100/80'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          if (confirm('Reset all edits and restore the seeded trip?')) reset().then(() => window.location.reload());
        }}
        className="btn-soft mt-4 w-full text-swiss"
      >
        <RotateCcw className="h-4 w-4" /> Reset to seed data
      </button>
    </motion.div>
  );
}

function HeaderBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="pt-safe sticky top-0 z-40 flex items-center justify-between border-b border-pine-100/60 bg-canvas/80 px-4 py-2.5 backdrop-blur-xl dark:border-pine-700/50 dark:bg-pine-900/70 lg:hidden">
      <Logo />
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-pine-700 shadow-soft dark:bg-pine-700/60 dark:text-canvas"
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <AnimatePresence>{open && <SettingsPanel onClose={() => setOpen(false)} />}</AnimatePresence>
      </div>
    </header>
  );
}

function BottomTabs() {
  const [moreOpen, setMoreOpen] = useState(false);
  const loc = useLocation();
  const primary = NAV.filter((n) => n.primary);
  const secondary = NAV.filter((n) => !n.primary);
  const onSecondary = secondary.some((s) => s.to === loc.pathname);

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-pine-100/60 bg-canvas/90 backdrop-blur-xl dark:border-pine-700/50 dark:bg-pine-900/80 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 px-1.5 py-1.5">
          {primary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold transition ${
                    isActive ? 'text-pine-700 dark:text-glacier-300' : 'text-ink-mute'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-8 w-8 place-items-center rounded-xl transition ${isActive ? 'bg-pine-100 dark:bg-pine-700/70' : ''}`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    {item.label.split(' ')[0]}
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold transition ${
              onSecondary ? 'text-pine-700 dark:text-glacier-300' : 'text-ink-mute'
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-xl ${onSecondary ? 'bg-pine-100 dark:bg-pine-700/70' : ''}`}>
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </span>
            More
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-pine-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="safe-bottom absolute inset-x-0 bottom-0 rounded-t-3xl bg-canvas p-4 dark:bg-pine-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-pine-200 dark:bg-pine-600" />
              <div className="grid gap-1.5">
                {secondary.map((item) => (
                  <NavRow key={item.to} item={item} onClick={() => setMoreOpen(false)} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-pine-100/60 bg-white/50 px-4 py-5 dark:border-pine-700/50 dark:bg-pine-800/40 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-7 flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </nav>
      <div className="relative mt-4 rounded-2xl bg-pine-50 p-3.5 text-xs text-ink-mute dark:bg-pine-700/40">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-ink-soft dark:text-glacier-100">
            <LogoMark size={18} /> Voyage
          </span>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-7 w-7 place-items-center rounded-lg text-ink-mute hover:bg-white dark:hover:bg-pine-700"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">
          <DepartureCountdown />
        </div>
        <AnimatePresence>
          {open && (
            <div className="absolute bottom-12 right-0">
              <SettingsPanel onClose={() => setOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <HeaderBar />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
        <BottomTabs />
      </div>
    </div>
  );
}
