export interface StoryNode {
  id: string;
  kicker: string;
  headline: string;
  note: string;
  image?: string;
  images?: string[];
  role: 'landmark' | 'place' | 'pin';
  quiet?: boolean;
  replayCount?: number;
  hour?: number;
  yearFrom?: number;
  yearTo?: number;
  yearFromTitle?: string;
  yearToTitle?: string;
  accent?: string;
}

function HourFace({ hour, className = 'h-12 w-12' }: { hour: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`shrink-0 ${className}`} aria-hidden>
      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
        const active = index === hour;
        const inner = active ? 38 : 44;
        const outer = active ? 54 : 50;
        return (
          <line
            key={index}
            x1={60 + Math.cos(angle) * inner}
            y1={60 + Math.sin(angle) * inner}
            x2={60 + Math.cos(angle) * outer}
            y2={60 + Math.sin(angle) * outer}
            stroke={active ? '#fde68a' : 'rgba(255,255,255,0.35)'}
            strokeWidth={active ? 4 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Cover({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" className={`object-cover ring-1 ring-white/15 ${className ?? ''}`} />;
}

function thumbs(node: StoryNode): string[] {
  if (node.image) return [node.image];
  return (node.images ?? []).slice(0, node.yearFrom != null ? 2 : 3);
}

function StopBody({ node, compact }: { node: StoryNode; compact?: boolean }) {
  const art = thumbs(node);
  const round = node.id === 'run' || node.id === 'streak' || node.id === 'concentration';
  const showYears = node.yearFrom != null && node.yearTo != null;

  return (
    <div className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}>
      {node.hour != null && <HourFace hour={node.hour} className={compact ? 'h-9 w-9' : 'h-12 w-12'} />}
      {node.hour == null && art.length > 0 && (
        <div className="flex shrink-0 gap-1">
          {art.map((src, index) => (
            <Cover
              key={`${src}-${index}`}
              src={src}
              className={`${compact ? 'h-9 w-9' : 'h-12 w-12'} ${round ? 'rounded-full' : 'rounded-lg'} ${node.replayCount ? '-rotate-3' : ''}`}
            />
          ))}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{node.kicker}</p>
        {showYears ? (
          <h3 className={`font-black tabular-nums text-white ${compact ? 'mt-0.5 text-base' : 'mt-1 text-lg'}`}>
            {node.yearFrom}
            <span className="mx-1.5 text-white/35">—</span>
            {node.yearTo}
          </h3>
        ) : (
          <h3 className={`font-black leading-tight text-white ${compact ? 'mt-0.5 text-base' : 'mt-1 text-lg'}`}>
            {node.headline}
            {node.replayCount != null && node.replayCount > 1 && (
              <span className="ml-2 align-middle text-xs font-black tracking-widest text-white/70">×{node.replayCount}</span>
            )}
          </h3>
        )}
        <p className={`text-xs text-white/55 ${compact ? 'mt-0.5 leading-snug' : 'mt-1 leading-relaxed'}`}>
          {showYears && node.yearFromTitle && node.yearToTitle ? `${node.yearFromTitle} to ${node.yearToTitle}` : node.note}
        </p>
      </div>
    </div>
  );
}

function Trailhead({ node, compact }: { node: StoryNode; compact?: boolean }) {
  return (
    <article
      className={`rounded-3xl border border-white/10 bg-[#141820] ${compact ? 'p-3' : 'p-5 sm:p-6'}`}
      style={node.accent ? { boxShadow: `0 0 0 1px ${node.accent}22` } : undefined}
    >
      <div className={`flex flex-col items-start sm:flex-row sm:items-center ${compact ? 'gap-3' : 'gap-4'}`}>
        {node.image && (
          <Cover
            src={node.image}
            className={compact ? 'h-16 w-16 shrink-0 rounded-xl' : 'h-28 w-28 shrink-0 rounded-2xl sm:h-32 sm:w-32'}
          />
        )}
        <div className="min-w-0">
          <p className={`font-bold uppercase tracking-[0.22em] text-white/45 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{node.kicker}</p>
          <h3 className={`font-black italic leading-none tracking-tight text-white ${compact ? 'mt-1 text-2xl' : 'mt-2 text-3xl sm:text-4xl'}`}>{node.headline}</h3>
          <p className={`max-w-md text-white/60 ${compact ? 'mt-1 text-xs leading-snug' : 'mt-2 text-sm leading-relaxed'}`}>{node.note}</p>
        </div>
      </div>
    </article>
  );
}

export function StoryTrail({ nodes, citation, compact = false }: { nodes: StoryNode[]; citation: string | null; compact?: boolean }) {
  const trailhead = nodes.find(node => node.role === 'landmark');
  const stops = nodes.filter(node => node.role !== 'landmark');

  return (
    <div className="relative w-full text-left">
      {trailhead && (
        <div className={`${compact ? 'mb-4' : 'mb-8'} pl-8 md:mx-auto md:max-w-xl md:pl-0`}>
          <Trailhead node={trailhead} compact={compact} />
        </div>
      )}

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[7px] w-px -translate-x-1/2 border-l border-dashed border-white/20 md:left-1/2"
        />

        <ol className={compact ? 'space-y-2.5' : 'space-y-5'}>
          {stops.map((node, index) => {
            const left = index % 2 === 0;
            return (
              <li key={node.id} className="relative pl-8 md:pl-0">
                <span
                  aria-hidden
                  className={`absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 bg-[#0c1220] ${compact ? 'top-3.5' : 'top-5'} ${node.quiet ? 'border-white/30' : 'border-sky-200'} left-[7px] md:left-1/2`}
                />
                <div className={`${compact ? 'md:w-[calc(50%-1.25rem)]' : 'md:w-[calc(50%-2rem)]'} ${left ? '' : 'md:ml-auto'}`}>
                  <article className={`rounded-2xl border bg-[#141820] ${compact ? 'p-2.5' : 'p-4'} ${node.quiet ? 'border-white/5 opacity-70' : 'border-white/10'}`}>
                    <StopBody node={node} compact={compact} />
                  </article>
                </div>
              </li>
            );
          })}
        </ol>

        {citation && (
          <p className={`relative pl-8 text-center text-xs italic text-white/35 md:pl-0 ${compact ? 'mt-3' : 'mt-6'}`}>
            <sup className="mr-1 not-italic">1</sup>
            {citation}
          </p>
        )}
      </div>
    </div>
  );
}
