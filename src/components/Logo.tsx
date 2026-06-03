export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E2D4E" />
          <stop offset="1" stopColor="#131C32" />
        </linearGradient>
        <linearGradient id="lg-peak" x1="14" y1="44" x2="50" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8AB2FB" />
          <stop offset="1" stopColor="#4C82EC" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lg-bg)" />
      <path d="M12 46L26 22L34 34L40 26L52 46H12Z" fill="url(#lg-peak)" />
      <path d="M26 22L31 30L28.5 33.5L23 25.5L26 22Z" fill="#E6ECF5" />
      <circle cx="46" cy="18" r="4" fill="#E4322B" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={compact ? 30 : 36} />
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-lg font-extrabold tracking-tight text-pine-700 dark:text-canvas">
            Voyage
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
            Mishra · Switzerland
          </div>
        </div>
      )}
    </div>
  );
}
