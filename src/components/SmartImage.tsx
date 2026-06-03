import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// SmartImage — never blank, never broken.
// 1. Instantly renders a gorgeous procedural SVG "scene" (offline-safe).
// 2. If a real photo URL is known AND loads, it fades in on top.
// Worst case (offline / 404): a beautiful themed gradient illustration.
// ─────────────────────────────────────────────────────────────

type Archetype =
  | 'alpine'
  | 'lake'
  | 'city'
  | 'valley'
  | 'science'
  | 'culture'
  | 'stay'
  | 'food'
  | 'transport';

interface Scene {
  archetype: Archetype;
  label: string;
  hueShift?: number;
}

const SCENES: Record<string, Scene> = {
  // Alpine
  jungfraujoch: { archetype: 'alpine', label: 'Top of Europe', hueShift: 10 },
  schilthorn: { archetype: 'alpine', label: 'Piz Gloria' },
  first: { archetype: 'alpine', label: 'Grindelwald-First', hueShift: -8 },
  pilatus: { archetype: 'alpine', label: 'Mt. Pilatus' },
  rigi: { archetype: 'alpine', label: 'Mt. Rigi', hueShift: 6 },
  harderkulm: { archetype: 'alpine', label: 'Harder Kulm', hueShift: -4 },
  // Lakes
  'lausanne-lake': { archetype: 'lake', label: 'Lake Geneva' },
  lakebrienz: { archetype: 'lake', label: 'Lake Brienz', hueShift: 8 },
  lakelucerne: { archetype: 'lake', label: 'Lake Lucerne', hueShift: -6 },
  geneva: { archetype: 'lake', label: 'Geneva' },
  // City
  'lausanne-cathedral': { archetype: 'city', label: 'Lausanne Old Town' },
  'lucerne-oldtown': { archetype: 'city', label: 'Lucerne Altstadt', hueShift: 6 },
  chapelbridge: { archetype: 'city', label: 'Chapel Bridge', hueShift: -10 },
  lion: { archetype: 'culture', label: 'Lion Monument' },
  kkl: { archetype: 'city', label: 'KKL Lucerne' },
  'interlaken-town': { archetype: 'city', label: 'Interlaken', hueShift: 4 },
  // Valley / nature
  lauterbrunnen: { archetype: 'valley', label: 'Lauterbrunnen' },
  trummelbach: { archetype: 'valley', label: 'Trümmelbach Falls', hueShift: -6 },
  lavaux: { archetype: 'valley', label: 'Lavaux Terraces', hueShift: 12 },
  // Science / culture
  cern: { archetype: 'science', label: 'CERN' },
  'olympic-museum': { archetype: 'culture', label: 'Olympic Museum', hueShift: 6 },
  chillon: { archetype: 'culture', label: 'Château de Chillon' },
  // Stays
  'lausanne-hotel': { archetype: 'stay', label: 'Hôtel de la Paix' },
  'interlaken-stay': { archetype: 'stay', label: 'apartment2lakes', hueShift: 8 },
  'lucerne-stay': { archetype: 'stay', label: 'Pilatus Apartments', hueShift: -6 },
  // City heroes
  'hero-lausanne': { archetype: 'lake', label: 'Lausanne', hueShift: 4 },
  'hero-interlaken': { archetype: 'alpine', label: 'Interlaken', hueShift: -4 },
  'hero-lucerne': { archetype: 'city', label: 'Lucerne', hueShift: 6 },
  // Food
  'food-indian': { archetype: 'food', label: 'Indian', hueShift: 20 },
  'food-fondue': { archetype: 'food', label: 'Fondue', hueShift: 10 },
  'food-pizza': { archetype: 'food', label: 'Italian', hueShift: 14 },
  'food-burger': { archetype: 'food', label: 'Burgers', hueShift: 6 },
  'food-cafe': { archetype: 'food', label: 'Café', hueShift: 0 },
  'food-buffet': { archetype: 'food', label: 'Veg Buffet', hueShift: -8 },
  'food-grocery': { archetype: 'food', label: 'Coop / Migros', hueShift: -14 },
  'food-mountain': { archetype: 'food', label: 'Mountain Eats', hueShift: 4 },
};

function sceneFor(key?: string): Scene {
  if (key && SCENES[key]) return SCENES[key];
  return { archetype: 'lake', label: key ?? '' };
}

// Optional real photography. Populate VITE-style or leave empty — gradient art is
// always the reliable baseline. (Kept empty by default for a flawless offline demo.)
const PHOTO_URLS: Record<string, string> = {};

function SceneArt({ scene, rounded }: { scene: Scene; rounded: string }) {
  const h = scene.hueShift ?? 0;
  const id = Math.abs(hashCode(scene.label)) % 100000;
  const sky1 = adjust('#0F3D3E', h);
  const sky2 = adjust('#14524F', h);

  // Midnight-alpine: deep slate-navy bases, refined azure accents (no teal).
  const palettes: Record<Archetype, { a: string; b: string; accent: string }> = {
    alpine: { a: adjust('#16233F', h), b: adjust('#4C82EC', h), accent: '#E6ECF5' },
    lake: { a: adjust('#131C32', h), b: adjust('#3A66C8', h), accent: '#8AB2FB' },
    city: { a: adjust('#16213C', h), b: adjust('#3A66C8', h), accent: '#8AB2FB' },
    valley: { a: adjust('#15233E', h), b: adjust('#3E5C86', h), accent: '#C7D6EE' },
    science: { a: '#0E1B33', b: '#4C82EC', accent: '#8AB2FB' },
    culture: { a: adjust('#221A3E', h), b: adjust('#4A3E82', h), accent: '#9AB0F5' },
    stay: { a: adjust('#15233E', h), b: adjust('#2D4E9C', h), accent: '#8AB2FB' },
    food: { a: adjust('#5A2E1E', h), b: adjust('#C26B2E', h), accent: '#FBE3C7' },
    transport: { a: '#131C32', b: '#3A66C8', accent: '#8AB2FB' },
  };
  const p = palettes[scene.archetype];

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${rounded}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.a} />
          <stop offset="1" stopColor={p.b} />
        </linearGradient>
        <linearGradient id={`glow-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sky-${id})`} />
      {/* soft sun / glow */}
      <circle cx="312" cy="58" r="120" fill={`url(#glow-${id})`} opacity="0.5" />
      <circle cx="312" cy="58" r="26" fill={scene.archetype === 'food' ? '#FFE6B3' : '#EAF2F1'} opacity="0.85" />

      {renderArchetype(scene.archetype, p)}

      <text
        x="20"
        y="222"
        fill="#ffffff"
        opacity="0.92"
        fontSize="15"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="700"
        style={{ letterSpacing: '0.01em' }}
      >
        {scene.label}
      </text>
    </svg>
  );
}

function renderArchetype(a: Archetype, p: { a: string; b: string; accent: string }) {
  switch (a) {
    case 'alpine':
      return (
        <g>
          <path d="M0 160 L70 70 L120 150 Z" fill={shade(p.a, -10)} opacity="0.9" />
          <path d="M90 170 L180 40 L270 170 Z" fill={shade(p.a, 6)} />
          <path d="M150 60 L180 40 L210 60 L195 78 L165 78 Z" fill={p.accent} />
          <path d="M230 170 L320 80 L400 170 Z" fill={shade(p.a, -6)} opacity="0.92" />
          <path d="M300 96 L320 80 L340 96 L330 110 L310 110 Z" fill={p.accent} />
          <rect y="168" width="400" height="72" fill={shade(p.b, -8)} opacity="0.6" />
        </g>
      );
    case 'lake':
      return (
        <g>
          <path d="M0 150 L120 90 L210 140 L320 95 L400 140 L400 165 L0 165 Z" fill={shade(p.a, 8)} opacity="0.85" />
          <rect y="162" width="400" height="78" fill={p.b} opacity="0.55" />
          <rect y="162" width="400" height="78" fill={`url(#sky-0)`} opacity="0" />
          <g opacity="0.35" fill="#ffffff">
            <rect x="40" y="186" width="120" height="3" rx="1.5" />
            <rect x="70" y="200" width="180" height="3" rx="1.5" />
            <rect x="180" y="214" width="160" height="3" rx="1.5" />
          </g>
        </g>
      );
    case 'city':
      return (
        <g>
          <rect y="150" width="400" height="90" fill={shade(p.b, -10)} opacity="0.65" />
          <g fill={shade(p.a, 10)} opacity="0.95">
            <rect x="40" y="110" width="34" height="60" rx="3" />
            <rect x="84" y="92" width="26" height="78" rx="3" />
            <rect x="120" y="120" width="40" height="50" rx="3" />
            <rect x="186" y="84" width="22" height="86" rx="3" />
            <path d="M186 84 L197 64 L208 84 Z" fill={p.accent} />
            <rect x="220" y="116" width="44" height="54" rx="3" />
            <rect x="288" y="100" width="30" height="70" rx="3" />
            <rect x="330" y="124" width="40" height="46" rx="3" />
          </g>
          <g fill={p.accent} opacity="0.5">
            <rect x="48" y="122" width="6" height="8" /><rect x="60" y="122" width="6" height="8" />
            <rect x="92" y="104" width="6" height="8" /><rect x="196" y="100" width="6" height="8" />
            <rect x="296" y="112" width="6" height="8" />
          </g>
        </g>
      );
    case 'valley':
      return (
        <g>
          <path d="M0 60 L0 170 L120 170 L120 50 Z" fill={shade(p.a, 4)} opacity="0.9" />
          <path d="M280 40 L280 170 L400 170 L400 50 Z" fill={shade(p.a, 4)} opacity="0.9" />
          <rect x="186" y="70" width="10" height="100" fill={p.accent} opacity="0.85" />
          <rect y="168" width="400" height="72" fill={shade(p.b, -6)} opacity="0.6" />
        </g>
      );
    case 'science':
      return (
        <g stroke={p.accent} strokeWidth="2.5" fill="none" opacity="0.9">
          <circle cx="200" cy="120" r="10" fill={p.accent} />
          <ellipse cx="200" cy="120" rx="74" ry="28" />
          <ellipse cx="200" cy="120" rx="74" ry="28" transform="rotate(60 200 120)" />
          <ellipse cx="200" cy="120" rx="74" ry="28" transform="rotate(120 200 120)" />
        </g>
      );
    case 'culture':
      return (
        <g fill={shade(p.a, 10)} opacity="0.95">
          <rect x="120" y="150" width="160" height="20" />
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={134 + i * 30} y="96" width="12" height="54" />
            ))}
          </g>
          <path d="M120 96 L200 60 L280 96 Z" fill={p.accent} opacity="0.9" />
        </g>
      );
    case 'stay':
      return (
        <g>
          <rect y="168" width="400" height="72" fill={shade(p.b, -6)} opacity="0.55" />
          <rect x="150" y="96" width="100" height="74" rx="4" fill={shade(p.a, 10)} />
          <path d="M142 96 L200 60 L258 96 Z" fill={p.accent} />
          <rect x="168" y="120" width="18" height="18" rx="2" fill={p.accent} opacity="0.7" />
          <rect x="214" y="120" width="18" height="18" rx="2" fill={p.accent} opacity="0.7" />
          <rect x="192" y="138" width="16" height="32" rx="2" fill={p.b} />
        </g>
      );
    case 'food':
      return (
        <g opacity="0.95">
          <circle cx="200" cy="130" r="52" fill="#ffffff" opacity="0.18" />
          <circle cx="200" cy="130" r="34" fill={p.accent} opacity="0.85" />
          <path d="M150 100 L150 160" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M252 100 q10 12 0 26 l0 34" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      );
    default:
      return null;
  }
}

// color helpers
function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function shade(hex: string, pct: number) {
  const { r, g, b } = toRGB(hex);
  const f = 1 + pct / 100;
  return `rgb(${clampByte(r * f)},${clampByte(g * f)},${clampByte(b * f)})`;
}
function adjust(hex: string, hueShift: number) {
  // crude warm/cool shift
  const { r, g, b } = toRGB(hex);
  return `rgb(${clampByte(r + hueShift)},${clampByte(g)},${clampByte(b - hueShift)})`;
}
function toRGB(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function SmartImage({
  imageKey,
  className = '',
  rounded = 'rounded-3xl',
  overlay = false,
}: {
  imageKey?: string;
  className?: string;
  rounded?: string;
  overlay?: boolean;
}) {
  const scene = sceneFor(imageKey);
  const photo = imageKey ? PHOTO_URLS[imageKey] : undefined;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [imageKey]);

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <SceneArt scene={scene} rounded={rounded} />
      {photo && (
        <img
          src={photo}
          alt={scene.label}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${rounded} ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-pine-900/70 via-pine-900/10 to-transparent" />
      )}
    </div>
  );
}
