import { NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';

export async function GET() {8
  try {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-read-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];

    const authURL = spotifyApi.createAuthorizeURL(scopes, 'state');
    
    return NextResponse.redirect(authURL);
  } catch (error) {
    console.error('Error creating Spotify auth URL:', error);
    return NextResponse.json({ error: 'Failed to create auth URL' }, { status: 500 });
  }
}

