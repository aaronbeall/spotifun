import type { Metadata } from 'next';
import DashboardContent from '../dashboard/DashboardContent';

export const metadata: Metadata = {
  title: "Spotifun - Sam's example profile",
  description: 'Poke around a Spotifun profile for Sam Pling, a pretend listener with very real taste. No Spotify login needed.',
};

/** The real dashboard, fed by the /api/demo endpoints instead of a Spotify account. */
export default function ExamplePage() {
  return <DashboardContent demo />;
}
