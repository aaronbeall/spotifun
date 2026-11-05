import Link from 'next/link';

const SITE = 'https://abeall.com';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/about/vacrs', label: 'VACRS' },
  { href: '/about#privacy', label: 'Privacy' },
  { href: '/about#terms', label: 'Terms' },
  { href: '/about#contact', label: 'Contact' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-gray-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-gray-500 sm:px-6">
        <p className="text-gray-300">
          Made with ❤️ and 🍌 by{' '}
          <a href={SITE} target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-white/20 underline-offset-2 hover:text-white">
            Meta Modern Monkey
          </a>
        </p>
        <p>
          © {year}{' '}
          <a href={SITE} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            Meta Modern Monkey
          </a>
          . All rights reserved.
        </p>
        <p className="max-w-2xl text-xs leading-relaxed">
          Spotifun is an independent project and is not affiliated with, endorsed, or sponsored by Spotify AB.
          Spotify is a trademark of Spotify AB. Genre data may be enhanced with{' '}
          <a
            href="https://www.last.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 underline decoration-white/20 underline-offset-2 hover:text-gray-300"
          >
            Last.fm
          </a>
          .
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-gray-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
