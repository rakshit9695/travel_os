import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import type { Traveler } from '../../types';

/** Animated number count-up that runs once when scrolled into view. */
export function CountUp({
  value,
  duration = 1.1,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Animated SVG progress ring (readiness score). */
export function Ring({
  value,
  size = 132,
  stroke = 12,
  children,
  trackClass = 'text-pine-100 dark:text-pine-700',
  valueClass = 'text-glacier-500',
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  trackClass?: string;
  valueClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const offset = inView ? c - (value / 100) * c : c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} stroke="currentColor" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={valueClass}
          stroke="currentColor"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Avatar({ traveler, size = 40 }: { traveler: Traveler; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full font-display font-bold text-white shadow-soft ring-2 ring-white/70 dark:ring-pine-800"
      style={{ width: size, height: size, background: traveler.color, fontSize: size * 0.36 }}
      title={traveler.name}
    >
      {traveler.avatar}
    </div>
  );
}

export function AvatarStack({ travelers, size = 34 }: { travelers: Traveler[]; size?: number }) {
  return (
    <div className="flex -space-x-2">
      {travelers.map((t) => (
        <Avatar key={t.id} traveler={t} size={size} />
      ))}
    </div>
  );
}

export function Chip({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: 'default' | 'mint' | 'pine' | 'warn' | 'swiss' | 'mute';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: 'bg-pine-50 text-pine-700 dark:bg-pine-700/60 dark:text-glacier-100',
    mint: 'bg-glacier-100 text-glacier-700 dark:bg-glacier-500/20 dark:text-glacier-200',
    pine: 'bg-pine-600 text-white',
    warn: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
    swiss: 'bg-swiss/10 text-swiss dark:bg-swiss/20',
    mute: 'bg-black/5 text-ink-mute dark:bg-white/10 dark:text-glacier-100/70',
  };
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
}

export function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="label">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold leading-none">{value}</div>
        {sub && <div className="mt-1 text-xs text-ink-mute">{sub}</div>}
      </div>
      {icon && <div className="text-glacier-500">{icon}</div>}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
