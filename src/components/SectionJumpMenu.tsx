'use client';

import { useEffect, useState, type ComponentType } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { trackSectionJump } from '@/lib/analytics';

export type SectionLink = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
};

/** Matches the sections' scroll-mt-24, just under the sticky header. */
const HEADER_LINE = 96;

export function SectionJumpMenu({ sections }: { sections: SectionLink[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sections.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= HEADER_LINE) current = section.id;
      }

      const root = document.documentElement;
      const canScroll = root.scrollHeight > window.innerHeight + 2;
      const atEnd = canScroll && window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      const last = sections[sections.length - 1];
      const lastEl = document.getElementById(last.id);
      if (atEnd && lastEl && lastEl.getBoundingClientRect().top < window.innerHeight) {
        current = last.id;
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('hashchange', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('hashchange', onScroll);
    };
  }, [sections]);

  const active = sections.find(section => section.id === activeId) ?? sections[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Jump to a section, now at ${active.label}`}
          className="flex h-9 max-w-[46vw] shrink-0 items-center gap-1.5 rounded-full border border-gray-700/60 bg-gray-900/60 pl-2.5 pr-2 text-sm font-medium text-gray-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ActiveIcon className={`h-4 w-4 shrink-0 ${active.iconClass}`} />
          <span className="truncate">{active.label}</span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-[rotate] duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50"
        >
          {sections.map(section => {
            const current = section.id === active.id;
            return (
              <DropdownMenu.Item key={section.id} asChild>
                <a
                  href={`#${section.id}`}
                  onClick={() => trackSectionJump(section.id)}
                  aria-current={current ? 'location' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 text-sm outline-none ${
                    current
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <section.icon className={`h-4 w-4 shrink-0 ${section.iconClass}`} />
                  {section.label}
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
