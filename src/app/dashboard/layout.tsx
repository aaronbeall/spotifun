import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your dashboard',
  // A signed-in, per-listener page. Nothing here for search engines.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
