import { RarityBadge } from '@/components/RarityBadge';

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
  /** Minute of the day for each play, midnight = 0. */
  plays?: number[];
  yearFrom?: number;
  yearTo?: number;
  yearFromTitle?: string;
  yearToTitle?: string;
  accent?: string;
  rarity?: number;
}

function polar(radius: number, angle: number): [number, number] {
  return [60 + Math.cos(angle) * radius, 60 + Math.sin(angle) * radius];
}

function minuteGap(a: number, b: number): number {
  const gap = Math.abs(a - b);
  return Math.min(gap, 1440 - gap);
}

/** Hours that include the peak and stay at least half as busy, wrapping past midnight. */
function hotZone(hours: number[], peak: number): number[] {
  const max = hours[peak] ?? 0;
  if (max <= 0) return [peak];
  const hot = (index: number) => hours[index] > 0 && hours[index] >= max * 0.5;
  const zone = [peak];
  for (let step = 1; step < 24; step += 1) {
    const next = (peak + step) % 24;
    if (!hot(next)) break;
    zone.push(next);
  }
  for (let step = 1; step < 24; step += 1) {
    const prev = (peak - step + 24) % 24;
    if (!hot(prev)) break;
    zone.unshift(prev);
  }
  return zone;
}

/** A round-capped arc spanning the hot hours. */
function zoneArc(zone: number[], radius: number): string | null {
  if (zone.length === 0 || zone.length >= 24) return null;
  const start = (zone[0] / 24) * Math.PI * 2 - Math.PI / 2;
  const end = ((zone[zone.length - 1] + 1) / 24) * Math.PI * 2 - Math.PI / 2;
  const [x0, y0] = polar(radius, start);
  const [x1, y1] = polar(radius, end);
  const large = zone.length > 12 ? 1 : 0;
  return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
}

/** One radial tick per play. Songs that land within a few minutes step outward so each stays visible. */
function placePlays(plays: number[], zone: Set<number>) {
  const sorted = plays.map((minute, index) => ({ minute, index })).sort((a, b) => a.minute - b.minute);
  const ringMinute: number[] = [];
  const placed = plays.map(() => ({ angle: 0, inner: 0, outer: 0, hot: false, minute: 0 }));
  for (const item of sorted) {
    let ring = 0;
    while (ring < ringMinute.length && minuteGap(ringMinute[ring], item.minute) < 12) ring += 1;
    ringMinute[ring] = item.minute;
    const angle = (item.minute / 1440) * Math.PI * 2 - Math.PI / 2;
    const inner = 31 + ring * 2.5;
    placed[item.index] = {
      angle,
      inner,
      outer: inner + 4.4,
      hot: zone.has(Math.floor(item.minute / 60) % 24),
      minute: item.minute,
    };
  }
  const maxOuter = placed.reduce((max, mark) => Math.max(max, mark.outer), 0);
  if (maxOuter > 54 && maxOuter > 0) {
    const scale = 22 / (maxOuter - 31);
    for (const mark of placed) {
      mark.inner = 31 + (mark.inner - 31) * scale;
      mark.outer = 31 + (mark.outer - 31) * scale;
    }
  }
  return placed;
}

function HourHeat({ plays, peak, className }: { plays: number[]; peak: number; className: string }) {
  const hours = new Array<number>(24).fill(0);
  for (const minute of plays) hours[Math.floor(minute / 60) % 24] += 1;
  const zone = hotZone(hours, peak);
  const hot = new Set(zone);
  const marks = placePlays(plays, hot);
  const ring = zoneArc(zone, 28);

  return (
    <svg viewBox="0 0 120 120" className={`shrink-0 ${className}`} role="img" aria-label={`${plays.length} plays around the day, each song its own mark`}>
      <circle cx="60" cy="60" r="28" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
      {ring && <path d={ring} fill="none" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" />}
      {Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
        const on = hot.has(index);
        const [x0, y0] = polar(index % 6 === 0 ? 24 : 26, angle);
        const [x1, y1] = polar(28.8, angle);
        return (
          <line
            key={index}
            x1={x0}
            y1={y0}
            x2={x1}
            y2={y1}
            stroke={on ? '#fde68a' : index % 6 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'}
            strokeWidth={on ? 1.1 : index % 6 === 0 ? 1 : 0.5}
          />
        );
      })}
      {marks.map((mark, index) => {
        const [x0, y0] = polar(mark.inner, mark.angle);
        const [x1, y1] = polar(mark.outer, mark.angle);
        return (
          <line
            key={index}
            x1={x0}
            y1={y0}
            x2={x1}
            y2={y1}
            stroke={mark.hot ? '#fde68a' : 'rgba(255,255,255,0.72)'}
            strokeWidth="1.05"
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
  const round = node.id === 'run' || node.id === 'streak' || node.id === 'lead';
  const showYears = node.yearFrom != null && node.yearTo != null;

  return (
    <div className={`flex ${node.plays ? 'items-center' : 'items-start'} ${compact ? 'gap-2' : 'gap-3'}`}>
      {node.plays && node.hour != null && (
        <HourHeat plays={node.plays} peak={node.hour} className={compact ? 'h-20 w-20' : 'h-24 w-24'} />
      )}
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className={`font-bold uppercase tracking-[0.22em] text-white/45 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{node.kicker}</p>
            {typeof node.rarity === 'number' && <RarityBadge score={node.rarity} />}
          </div>
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
