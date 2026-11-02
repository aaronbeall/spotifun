import type { Metadata } from 'next';
import DashboardContent from '../dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Spotifun Demo - Take the dashboard for a spin',
  description: 'Poke around the Spotifun dashboard with a made-up listener. No Spotify login needed.',
};

/** The real dashboard, fed by the /api/demo endpoints instead of a Spotify account. */
export default function DemoPage() {
  return <DashboardContent demo />;
}
