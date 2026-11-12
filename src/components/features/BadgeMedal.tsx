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
}

const BADGE_ART: Record<string, BadgeArt> = {
  'signed-in': {
    icon: LogIn,
    metal: '#c4b5fd',
    ribbon: '#8b5cf6',
    ink: '#2e1065',
    pattern: 'repeating-linear-gradient(135deg, rgba(196,181,253,0.22) 0 1px, transparent 1px 7px)',
  },
  'back-again': {
    icon: CalendarDays,
    metal: '#a78bfa',
    ribbon: '#6d28d9',
    ink: '#2e1065',
    pattern: 'radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1.4px)',
    tile: '10px 10px',
  },
  regular: {
    icon: CalendarCheck,
    metal: '#ddd6fe',
    ribbon: '#7c3aed',
    ink: '#2e1065',
    pattern: 'repeating-linear-gradient(90deg, rgba(221,214,254,0.16) 0 8px, transparent 8px 14px)',
  },
  'after-hours': {
    icon: Moon,
    metal: '#818cf8',
    ribbon: '#4338ca',
    ink: '#1e1b4b',
    pattern: 'radial-gradient(circle at 20% 20%, rgba(129,140,248,0.45) 0 1px, transparent 1.6px), radial-gradient(circle at 70% 60%, rgba(199,210,254,0.35) 0 1px, transparent 1.6px)',
    tile: '18px 18px',
  },
  'first-look': {
    icon: Eye,
    metal: '#67e8f9',
    ribbon: '#0891b2',
    ink: '#083344',
    pattern: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(103,232,249,0.16) 6px 7px)',
  },
  'five-looks': {
    icon: Layers,
    metal: '#22d3ee',
    ribbon: '#0e7490',
    ink: '#083344',
    pattern: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.14) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(34,211,238,0.14) 0 2px, transparent 2px 6px)',
  },
  'twenty-looks': {
    icon: Library,
    metal: '#a5f3fc',
    ribbon: '#155e75',
    ink: '#083344',
    pattern: 'repeating-conic-gradient(from 0deg, rgba(165,243,252,0.16) 0% 25%, transparent 0% 50%)',
  },
  'four-shelves': {
    icon: LayoutGrid,
    metal: '#5eead4',
    ribbon: '#0f766e',
    ink: '#042f2e',
    pattern: 'linear-gradient(90deg, rgba(94,234,212,0.22) 1px, transparent 1px), linear-gradient(rgba(94,234,212,0.22) 1px, transparent 1px)',
    tile: '14px 14px',
  },
  'three-eras': {
    icon: Hourglass,
    metal: '#fde68a',
    ribbon: '#b45309',
    ink: '#451a03',
    pattern: 'repeating-linear-gradient(115deg, rgba(253,230,138,0.2) 0 3px, transparent 3px 9px)',
  },
  'first-name': {
    icon: UserRound,
    metal: '#f9a8d4',
    ribbon: '#be185d',
    ink: '#500724',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(249,168,212,0.4) 0 1px, transparent 1.6px)',
    tile: '11px 11px',
  },
  'three-names': {
    icon: Users,
    metal: '#fb7185',
    ribbon: '#9f1239',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(-45deg, rgba(251,113,133,0.2) 0 4px, transparent 4px 10px)',
  },
  'eight-names': {
    icon: Crown,
    metal: '#fecdd3',
    ribbon: '#e11d48',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(90deg, transparent 0 10px, rgba(254,205,211,0.2) 10px 11px), repeating-linear-gradient(0deg, transparent 0 10px, rgba(254,205,211,0.2) 10px 11px)',
  },
  'both-moods': {
    icon: Contrast,
    metal: '#f0abfc',
    ribbon: '#a21caf',
    ink: '#4a044e',
    pattern: 'linear-gradient(90deg, rgba(240,171,252,0.22) 50%, rgba(88,28,135,0.28) 50%)',
  },
  'both-energies': {
    icon: Zap,
    metal: '#fda4af',
    ribbon: '#be123c',
    ink: '#4c0519',
    pattern: 'repeating-linear-gradient(90deg, transparent 0 5px, rgba(253,164,175,0.28) 5px 6px)',
  },
  'first-vibe': {
    icon: Sparkles,
    metal: '#fcd34d',
    ribbon: '#d97706',
    ink: '#451a03',
    pattern: 'radial-gradient(circle, rgba(252,211,77,0.45) 0.7px, transparent 1.2px)',
    tile: '9px 9px',
  },
  'five-vibes': {
    icon: Stars,
    metal: '#fdba74',
    ribbon: '#c2410c',
    ink: '#431407',
    pattern: 'repeating-linear-gradient(60deg, rgba(253,186,116,0.2) 0 2px, transparent 2px 8px), repeating-linear-gradient(-60deg, rgba(253,186,116,0.2) 0 2px, transparent 2px 8px)',
  },
  'all-vibes': {
    icon: Gem,
    metal: '#fde68a',
    ribbon: '#a16207',
    ink: '#422006',
    pattern: 'repeating-conic-gradient(rgba(253,230,138,0.2) 0% 8%, transparent 0% 16%)',
  },
};

export function badgeArt(id: string): BadgeArt | undefined {
  return BADGE_ART[id];
}

/** Round medal used on the badge board and on unlock toasts. */
export function BadgeMedal({ id, className = 'h-16 w-16' }: { id: string; className?: string }) {
  const art = BADGE_ART[id];
  if (!art) return null;
  const Icon = art.icon;
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[3px] shadow-[inset_0_2px_6px_rgba(255,255,255,0.45)] ${className}`}
      style={{
        borderColor: art.metal,
        background: `radial-gradient(circle at 32% 28%, #fff, ${art.metal} 58%, ${art.ribbon})`,
      }}
    >
      <Icon className="h-[42%] w-[42%]" style={{ color: art.ink }} />
    </span>
  );
}
