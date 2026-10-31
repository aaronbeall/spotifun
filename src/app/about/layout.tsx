import Link from 'next/link';
import Image from 'next/image';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/about/vacrs', label: 'VACRS' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="relative h-8 w-8">
              <Image src="/logo.png" alt="" fill className="object-contain" sizes="32px" />
            </span>
            <span className="text-xl font-black italic lowercase tracking-tight text-violet-400">
              spotifun
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        {children}
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-gray-500">
          <p>Spotifun is an independent project and is not affiliated with Spotify AB.</p>
          <p className="flex gap-3">
            <Link href="/about#privacy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/about#terms" className="hover:text-gray-300">Terms</Link>
            <Link href="/about#contact" className="hover:text-gray-300">Contact</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
