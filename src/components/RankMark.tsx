const SIZE = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-6 w-6 text-[11px]',
  lg: 'h-7 w-7 text-xs',
} as const;

/** Quiet place marker. Only the top three ranks get one. */
export function RankMark({ rank, size = 'md' }: { rank: 1 | 2 | 3; size?: keyof typeof SIZE }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-black/50 font-semibold tabular-nums text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-sm ${SIZE[size]}`}
    >
      {rank}
    </span>
  );
}
