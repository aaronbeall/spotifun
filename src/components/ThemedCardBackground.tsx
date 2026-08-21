import { CSSProperties, ReactNode } from 'react';

interface ThemedCardBackgroundProps {
  color: { light: string; dark: string };
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

// The diagonal gradient + top-right ambient glow used on the share cards
// (see ShareCardTemplate), brought over to the live app cards so their
// backgrounds carry the same per-card color theme instead of being flat gray.
//
// Unlike the share card (a fixed 800px canvas), live cards resize as content
// expands (e.g. Vibes' "Show All"). A gradient set directly as the root's
// background would stretch its color stop with the box's height, visibly
// shifting as the card grows. Instead the gradient is a fixed-size
// background-image confined to the top via background-size/no-repeat, fading
// to the same solid backgroundColor the rest of the card sits on — so it
// stays anchored to the top regardless of how tall the card gets.
//
// CSS angled gradients only reach their 100% stop at the single corner
// furthest along that angle — on a box this wide, the tile needs real
// height headroom so the *whole* bottom edge (not just one corner) has
// actually reached the solid end color by the time the tile ends, or the
// still-mid-fade rest of that edge shows as a seam against the flat color
// below it. The end stop is pulled well back from the tile's own bottom
// edge (not 100%) so there's a generous flat buffer — already fully
// resolved to the same solid color — before that edge, guaranteeing no
// seam regardless of angle/width, while keeping the visibly-tinted area
// modest rather than washing most of the card in color.
export function ThemedCardBackground({ color, className = '', style, children }: ThemedCardBackgroundProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: '#111827',
        backgroundImage: `linear-gradient(160deg, ${color.dark} 0%, #111827 40%)`,
        backgroundSize: '100% 900px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top',
        ...style,
      }}
    >
      <div
        className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color.light}40, transparent 70%)` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
