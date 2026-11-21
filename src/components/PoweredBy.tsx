/**
 * Credit line Last.fm's API terms ask for ("powered by AudioScrobbler", linking back),
 * plus Deezer for the artwork.
 */
export function PoweredBy({ className = '' }: { className?: string }) {
  return (
    <span className={`text-xs text-white/45 ${className}`}>
      Powered by{' '}
      <a href="https://www.last.fm" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white/80">
        AudioScrobbler
      </a>
      {' '}· art from{' '}
      <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white/80">
        Deezer
      </a>
    </span>
  );
}
