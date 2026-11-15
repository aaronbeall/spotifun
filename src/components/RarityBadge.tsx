import { RARITY_STEPS, rarityStep } from '@/utils/rarity';

/** Subtle five-step rarity mark. Each step keeps its own color, and the score's step is the one at full strength. */
export function RarityBadge({
  score,
  compact = false,
  caption,
}: {
  score: number;
  compact?: boolean;
  caption?: string;
}) {
  const active = rarityStep(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 align-middle"
      title={`Rarity ${score.toFixed(2)}`}
      aria-label={`${caption ? `${caption} rarity` : 'Rarity'} ${active.label}, ${score.toFixed(2)} of 1`}
    >
      {caption && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{caption}</span>
      )}
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {RARITY_STEPS.map(step => (
          <span
            key={step.id}
            className="h-1.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: step.color,
              opacity: step.id === active.id ? 1 : 0.14,
              boxShadow: step.id === active.id ? `0 0 6px ${step.color}` : undefined,
            }}
          />
        ))}
      </span>
      {!compact && (
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: active.color }}>
          {active.label}
        </span>
      )}
    </span>
  );
}
