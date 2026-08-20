import { useMemo, useId } from 'react';
import { generateArtLayers, type ArtProfile } from '@/utils/generativeArt';

interface GenerativeArtProps {
  seed: string;
  colors: { light: string; dark: string };
  profile: ArtProfile;
  className?: string;
}

// Deterministic abstract artwork: same seed + profile always renders the
// same composition. Used in place of a plain icon for vibes and personas.
export function GenerativeArt({ seed, colors, profile, className = '' }: GenerativeArtProps) {
  const uid = useId().replace(/[:]/g, '');
  const layers = useMemo(() => generateArtLayers(seed, profile), [seed, profile]);

  const gradientId = `ga-grad-${uid}`;
  const blurId = `ga-blur-${uid}`;
  const noiseId = `ga-noise-${uid}`;
  const valenceMix = 30 + profile.valence * 40; // brighter blend for higher valence

  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset={`${valenceMix}%`} stopColor={colors.light} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
        <filter id={blurId}>
          <feGaussianBlur stdDeviation={2 - profile.complexity} />
        </filter>
        <filter id={noiseId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="100" height="100" fill={colors.dark} opacity="0.12" />

      {layers.map((layer, i) => (
        <path
          key={i}
          d={layer.path}
          fill={`url(#${gradientId})`}
          opacity={layer.opacity}
          filter={i > 0 ? `url(#${blurId})` : undefined}
        />
      ))}

      <rect width="100" height="100" filter={`url(#${noiseId})`} opacity="0.05" style={{ mixBlendMode: 'overlay' }} />
    </svg>
  );
}
