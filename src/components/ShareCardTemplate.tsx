import { ReactNode } from 'react';

export interface ShareContent {
  eyebrow: string;
  title: string;
  value?: string;
  description: string;
  color: { light: string; dark: string };
  /** The key visualization for this card (emblem image, chart, generative art, etc.), reused from the live component rather than re-created. */
  visual?: ReactNode;
  /** When false, the visual replaces the large title block. */
  showTitle?: boolean;
  /** Card width in pixels. Defaults to 640. */
  width?: number;
  /** Faint pattern washed across the whole card, behind the artwork. */
  texture?: { image: string; size?: string };
  /** Ribbon or other mark under the description, such as the unlock banner. */
  banner?: ReactNode;
}

interface ShareCardTemplateProps {
  content: ShareContent;
}

// Purpose-built graphic for exporting/sharing — not part of the live interactive UI.
// Deliberately simple and self-contained so html-to-image can snapshot it cleanly.
export function ShareCardTemplate({ content }: ShareCardTemplateProps) {
  const { eyebrow, title, value, description, color, visual, showTitle = true, width = 640, texture, banner } = content;

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${showTitle ? 'min-h-[800px]' : ''}`}
      style={{ width, background: `linear-gradient(160deg, ${color.dark} 0%, #0b0f1a 65%)` }}
    >
      {texture && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: texture.image, backgroundSize: texture.size, opacity: 0.16 }}
        />
      )}

      {/* Ambient glow */}
      <div
        className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color.light}55, transparent 70%)` }}
      />

      {/* Brand header */}
      <div className={`relative z-10 flex items-center justify-between px-10 ${showTitle ? 'pt-8' : 'pt-5'}`}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
          <span className="text-xl font-black italic lowercase tracking-tight text-violet-400">
            spotifun
          </span>
        </div>
        <span className="text-xs font-medium text-white/30">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-1 flex-col ${showTitle ? 'items-center justify-center px-12 py-8 text-center' : 'px-8 py-4'}`}>
        <span
          className={`text-sm font-bold uppercase tracking-[0.15em] ${showTitle ? '' : 'self-center'}`}
          style={{ color: `${color.light}cc` }}
        >
          {eyebrow}
        </span>

        {visual && (
          <div className={showTitle ? 'my-6 flex items-center justify-center' : 'my-2 w-full'}>
            {visual}
          </div>
        )}

        {showTitle && (
          <>
            <h1
              className={`text-5xl font-black leading-tight tracking-tight ${visual ? 'mt-0' : 'mt-6'} mb-2`}
              style={{ color: color.light }}
            >
              {title}
            </h1>

            {value && (
              <div className="text-xl font-bold mb-4 text-white/90">
                {value}
              </div>
            )}

            <p className="text-base text-white/70 leading-relaxed max-w-[460px]">
              {description}
            </p>
            {banner}
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`relative z-10 mt-auto border-t border-white/10 px-10 text-center ${showTitle ? 'py-8' : 'py-5'}`}>
        <span className="text-sm text-white/40">
          Discover your own music story on{' '}
          <span className="font-bold italic lowercase text-violet-400">spotifun</span>
        </span>
      </div>
    </div>
  );
}
