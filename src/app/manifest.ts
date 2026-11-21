import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Spotifun',
    short_name: 'Spotifun',
    description: 'Get nerdy about your Spotify listening: vibes, genre maps, a listener persona and silly badges.',
    // Signed-in listeners land on their profile; anyone else is sent home by the dashboard.
    start_url: '/dashboard?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#030712',
    theme_color: '#030712',
    categories: ['music', 'entertainment', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'My profile', url: '/dashboard?source=pwa-shortcut', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: "Sam's example profile", url: '/example?source=pwa-shortcut', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
