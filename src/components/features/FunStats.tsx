'use client';

import { BookOpen } from 'lucide-react';
import { Stats } from '@/types';
import { SectionShareButton } from '@/components/SectionShareButton';
import type { ShareContent } from '@/components/ShareCardTemplate';
import { musicStoryShare } from '@/components/shareLists';
import { StoryTrail, type StoryNode } from '@/components/features/StoryTrail';
import { darkenHex } from '@/utils/color';
import {
  buildFindings,
  buildStorySlides,
  viewScope,
  type Finding,
  type StorySlide,
} from '@/utils/listeningFacts';

interface FunStatsProps {
  stats: Stats;
  onShare?: (content: ShareContent) => void;
}

function fromSlide(slide: StorySlide, role: StoryNode['role']): StoryNode {
  return {
    id: slide.id,
    kicker: slide.kicker,
    headline: slide.headline,
    note: slide.detail,
    image: slide.image,
    images: slide.images,
    role,
    replayCount: slide.replayCount,
    hour: slide.hour,
    yearFrom: slide.yearFrom,
    yearTo: slide.yearTo,
    yearFromTitle: slide.yearFromTitle,
    yearToTitle: slide.yearToTitle,
    accent: slide.accent,
  };
}

function fromFinding(finding: Finding): StoryNode {
  return {
    id: finding.id,
    kicker: finding.title,
    headline: finding.name ?? finding.fact,
    note: finding.name ? finding.fact : finding.detail,
    image: finding.image,
    images: finding.images,
    role: finding.hit ? 'place' : 'pin',
    quiet: !finding.hit,
    yearFrom: finding.from,
    yearTo: finding.to,
    replayCount: finding.kind === 'replay' ? finding.count : undefined,
  };
}

function buildMap(stats: Stats): { nodes: StoryNode[]; citation: string | null } {
  const slides = buildStorySlides(stats);
  if (slides.length === 1 && slides[0].kind === 'empty') {
    return { nodes: [fromSlide(slides[0], 'landmark')], citation: null };
  }

  const kinds = new Set(slides.map(slide => slide.kind));
  const nodes = slides
    .filter(slide => slide.kind !== 'empty')
    .map(slide => fromSlide(slide, slide.kind === 'persona' ? 'landmark' : 'place'));

  let citation: string | null = null;
  for (const finding of buildFindings(stats)) {
    if (finding.kind === 'coverage') {
      citation = finding.percent != null ? `${finding.percent}% of genre weight mapped.` : finding.fact;
      continue;
    }
    if (finding.kind === 'replay' && (kinds.has('replay') || kinds.has('once'))) continue;
    if (finding.kind === 'streak' && kinds.has('run')) continue;
    if (finding.kind === 'span' && kinds.has('years')) continue;
    nodes.push(fromFinding(finding));
  }

  const landmark = nodes.filter(node => node.role === 'landmark');
  const places = nodes.filter(node => node.role === 'place');
  const pins = nodes.filter(node => node.role === 'pin');
  return { nodes: [...landmark, ...places, ...pins], citation };
}

function StoryDepth({ accent }: { accent: string }) {
  const deep = darkenHex(accent, 0.62);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 95% 38% at 88% -8%, ${accent}66, transparent 62%)`,
            `radial-gradient(ellipse 75% 32% at -8% 42%, ${accent}40, transparent 64%)`,
            `radial-gradient(ellipse 80% 36% at 108% 78%, ${deep}, transparent 60%)`,
            `linear-gradient(168deg, ${deep} 0%, #0c1220 34%, #162033 62%, #0c1220 100%)`,
          ].join(', '),
        }}
      />
    </div>
  );
}

export default function FunStats({ stats, onShare }: FunStatsProps) {
  const { nodes, citation } = buildMap(stats);
  const trailhead = nodes.find(node => node.role === 'landmark');
  const shareable = nodes.some(node => node.id !== 'empty');
  const accent = trailhead?.accent?.startsWith('#') ? trailhead.accent : '#7dd3fc';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220] p-4 shadow-lg sm:p-6">
      <StoryDepth accent={accent} />
      <div className="relative mb-6 flex items-start justify-between gap-3 px-1">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <BookOpen className="h-5 w-5 text-sky-300" />
            Music Story
          </h2>
          <p className="text-xs text-gray-400">{viewScope(stats)}.</p>
        </div>
        {onShare && shareable && trailhead && (
          <SectionShareButton
            onClick={() => onShare(musicStoryShare({
              title: trailhead.headline,
              accent: trailhead.accent,
              scope: viewScope(stats),
              nodes,
              citation,
            }))}
          />
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <StoryTrail nodes={nodes} citation={citation} />
      </div>
    </section>
  );
}
