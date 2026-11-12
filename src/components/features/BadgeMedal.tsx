import {
  CalendarCheck,
  CalendarDays,
  Contrast,
  Crown,
  Eye,
  Gem,
  Hourglass,
  Layers,
  LayoutGrid,
  Library,
  LogIn,
  Moon,
  Sparkles,
  Stars,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface BadgeArt {
  icon: LucideIcon;
  metal: string;
  ribbon: string;
  ink: string;
  pattern: string;
  tile?: string;
  /** Silhouette of the badge. A radius is a rounded box; a clip is a polygon or ellipse. */
  shape: { radius?: string; clip?: string; nudge?: string; icon?: number };
}

const BADGE_ART: Record<string, BadgeArt> = {
  'signed-in': {
    icon: LogIn,
    metal: '#c4b5fd',
    ribbon: '#8b5cf6',
    ink: '#2e1065',
    pattern: 'repeating-linear-gradient(135deg, rgba(196,181,253,0.22) 0 1px, transparent 1px 7px)',
    shape: { clip: 'polygon(8% 0%, 92% 0%, 100% 16%, 100% 58%, 50% 100%, 0% 58%, 0% 16%)' },
  },
  'back-again': {
    icon: CalendarDays,
    metal: '#a78bfa',
    ribbon: '#6d28d9',
    ink: '#2e1065',
    pattern: 'radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1.4px)',
    tile: '10px 10px',
    shape: { clip: 'polygon(0% 18%, 18% 18%, 18% 0%, 36% 0%, 36% 18%, 64% 18%, 64% 0%, 82% 0%, 82% 18%, 100% 18%, 100% 100%, 0% 100%)', nudge: 'translateY(6%)' },
  },
  regular: {
    icon: CalendarCheck,
    metal: '#ddd6fe',
    ribbon: '#7c3aed',
    ink: '#2e1065',
    pattern: 'repeating-linear-gradient(90deg, rgba(221,214,254,0.16) 0 8px, transparent 8px 14px)',
    shape: { clip: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' },
  },
  'after-hours': {
    icon: Moon,
    metal: '#818cf8',
    ribbon: '#4338ca',
    ink: '#1e1b4b',
    pattern: 'radial-gradient(circle at 20% 20%, rgba(129,140,248,0.45) 0 1px, transparent 1.6px), radial-gradient(circle at 70% 60%, rgba(199,210,254,0.35) 0 1px, transparent 1.6px)',
    tile: '18px 18px',
    shape: { clip: 'polygon(0% 100%, 0% 42%, 14% 16%, 50% 0%, 86% 16%, 100% 42%, 100% 100%)', nudge: 'translateY(8%)' },
  },
  'first-look': {
    icon: Eye,
    metal: '#67e8f9',
    ribbon: '#0891b2',
    ink: '#083344',
    pattern: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(103,232,249,0.16) 6px 7px)',
    shape: { clip: 'ellipse(50% 36% at 50% 50%)', icon: 32 },
  },
  'five-looks': {
    icon: Layers,
    metal: '#22d3ee',
    ribbon: '#0e7490',
    ink: '#083344',
    pattern: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.14) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(34,211,238,0.14) 0 2px, transparent 2px 6px)',
    shape: { clip: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', nudge: 'translateY(6%)' },
  },
  'twenty-looks': {
    icon: Library,
    metal: '#a5f3fc',
    ribbon: '#155e75',
    ink: '#083344',
    pattern: 'repeating-conic-gradient(from 0deg, rgba(165,243,252,0.16) 0% 25%, transparent 0% 50%)',
    shape: { clip: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' },
  },
  'four-shelves': {
    icon: LayoutGrid,
    metal: '#5eead4',
    ribbon: '#0f766e',
    ink: '#042f2e',
    pattern: 'linear-gradient(90deg, rgba(94,234,212,0.22) 1px, transparent 1px), linear-gradient(rgba(94,234,212,0.22) 1px, transparent 1px)',
    tile: '14px 14px',
    shape: { radius: '12%' },
  },
  'three-eras': {
    icon: Hourglass,
    metal: '#fde68a',
    ribbon: '#b45309',
    ink: '#451a03',
    pattern: 'repeating-linear-gradient(115deg, rgba(253,230,138,0.2) 0 3px, transparent 3px 9px)',
    shape: { clip: 'polygon(6% 0%, 94% 0%, 68% 50%, 94% 100%, 6% 100%, 32% 50%)', icon: 30 },
  },
  'first-name': {
    icon: UserRound,
    metal: '#f9a8d4',
    ribbon: '#be185d',
    ink: '#500724',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(249,168,212,0.4) 0 1px, transparent 1.6px)',
    tile: '11px 11px',
    shape: { radius: '9999px' },
  },
  'three-names': {
    icon: Users,
    metal: '#fb7185',
    ribbon: '#9f1239',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(-45deg, rgba(251,113,133,0.2) 0 4px, transparent 4px 10px)',
    shape: { clip: 'polygon(50% 4%, 97% 96%, 3% 96%)', nudge: 'translateY(14%)', icon: 30 },
  },
  'eight-names': {
    icon: Crown,
    metal: '#fecdd3',
    ribbon: '#e11d48',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(90deg, transparent 0 10px, rgba(254,205,211,0.2) 10px 11px), repeating-linear-gradient(0deg, transparent 0 10px, rgba(254,205,211,0.2) 10px 11px)',
    shape: { clip: 'polygon(0% 22%, 16% 22%, 16% 0%, 34% 22%, 50% 0%, 66% 22%, 84% 0%, 84% 22%, 100% 22%, 100% 100%, 0% 100%)', nudge: 'translateY(10%)', icon: 32 },
  },
  'both-moods': {
    icon: Contrast,
    metal: '#f0abfc',
    ribbon: '#a21caf',
    ink: '#4a044e',
    pattern: 'linear-gradient(90deg, rgba(240,171,252,0.22) 50%, rgba(88,28,135,0.28) 50%)',
    shape: { clip: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' },
  },
  'both-energies': {
    icon: Zap,
    metal: '#fda4af',
    ribbon: '#be123c',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(90deg, transparent 0 5px, rgba(253,164,175,0.28) 5px 6px)',
    shape: { clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', icon: 34 },
  },
  'first-vibe': {
    icon: Sparkles,
    metal: '#fcd34d',
    ribbon: '#d97706',
    ink: '#451a03',
    pattern: 'radial-gradient(circle, rgba(252,211,77,0.45) 0.7px, transparent 1.2px)',
    tile: '9px 9px',
    shape: { clip: 'polygon(50% 0%, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0% 50%, 36% 36%)', icon: 30 },
  },
  'five-vibes': {
    icon: Stars,
    metal: '#fdba74',
    ribbon: '#c2410c',
    ink: '#431407',
    pattern: 'repeating-linear-gradient(60deg, rgba(253,186,116,0.2) 0 2px, transparent 2px 8px), repeating-linear-gradient(-60deg, rgba(253,186,116,0.2) 0 2px, transparent 2px 8px)',
    shape: { clip: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', icon: 28 },
  },
  'all-vibes': {
    icon: Gem,
    metal: '#fde68a',
    ribbon: '#a16207',
    ink: '#422006',
    pattern: 'repeating-conic-gradient(rgba(253,230,138,0.2) 0% 8%, transparent 0% 16%)',
    shape: { clip: 'polygon(18% 0%, 82% 0%, 100% 32%, 50% 100%, 0% 32%)', nudge: 'translateY(8%)' },
  },
};

export function badgeArt(id: string): BadgeArt | undefined {
  return BADGE_ART[id];
}

/** Faintest step: the pattern washed across a whole tile. */
export function BadgeTileWash({ id }: { id: string }) {
  const art = badgeArt(id);
  if (!art) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: art.pattern, backgroundSize: art.tile, opacity: 0.16 }}
    />
  );
}

/** Medal plus a larger, fainter copy of the same shape behind it. */
export function BadgeMark({ id, className = 'h-16 w-16' }: { id: string; className?: string }) {
  const art = badgeArt(id);
  if (!art) return null;
  const { radius, clip } = art.shape;
  return (
    <span className={`relative z-0 inline-flex shrink-0 ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          borderRadius: radius,
          clipPath: clip,
          backgroundColor: `${art.ribbon}38`,
          backgroundImage: art.pattern,
          backgroundSize: art.tile,
          opacity: 0.55,
        }}
      />
      <BadgeMedal id={id} className="relative z-10 h-full w-full" />
    </span>
  );
}

/** Shaped badge used on the board, unlock toasts, and the share image. The pattern is the frame around the metal face. */
export function BadgeMedal({ id, className = 'h-16 w-16' }: { id: string; className?: string }) {
  const art = BADGE_ART[id];
  if (!art) return null;
  const Icon = art.icon;
  const { radius, clip, nudge, icon = 38 } = art.shape;
  const silhouette = { borderRadius: radius, clipPath: clip };
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 ${className}`}
      style={{
        ...silhouette,
        backgroundColor: '#120c18',
        backgroundImage: art.pattern,
        backgroundSize: art.tile,
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          ...silhouette,
          transform: 'scale(0.68)',
          background: `radial-gradient(circle at 32% 28%, #fff, ${art.metal} 55%, ${art.ribbon})`,
        }}
      >
        <Icon className="relative" style={{ color: art.ink, width: `${icon}%`, height: `${icon}%`, transform: nudge }} />
      </span>
    </span>
  );
}
