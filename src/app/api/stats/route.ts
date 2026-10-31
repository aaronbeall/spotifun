import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches,
  calculateTopTracksStats, calculateTopArtistsStats, enhanceArtistsWithLastFm
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { Stats, TimeRange, DataMode } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
    const mode = (searchParams.get('mode') as DataMode) || 'recent';

    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      // Fetch initial data in parallel
      const [recentlyPlayed, topTracksRaw, topArtistsRaw] = await Promise.all([
        getRecentlyPlayed(limit),
        getTopTracks(timeRange, 50),
        getTopArtists(timeRange, 50)
      ]);

      // Enhance top artists with Last.fm data for artists with thin genres
      // This is server-side only, cached 7 days, rate-limited
      const topArtists = await enhanceArtistsWithLastFm(
        topArtistsRaw,
        process.env.LASTFM_API_KEY
      );
      
      const topTracks = topTracksRaw;

      // Calculate top genres from top artists
      const topGenres = calculateTopGenres(topArtists);

      let trackStats, artistStats, genreStats, totalPlays, totalDuration, totalGenres, averagePopularity;

      switch (mode) {
        case 'topTracks': {
          // Top Tracks mode: use rank-based weights from top tracks
          const artistIds = Array.from(new Set(
            topTracks.flatMap(track => track.artists.map(artist => artist.id))
          ));
          const topTracksArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          
          // Enhance these artists with Last.fm too
          const topTracksArtistsArray = await enhanceArtistsWithLastFm(
            Object.values(topTracksArtistsByIdRaw),
            process.env.LASTFM_API_KEY
          );
          const topTracksArtistsById = Object.fromEntries(
            topTracksArtistsArray.map(artist => [artist.id, artist])
          );

          const statsResult = calculateTopTracksStats(topTracks, topTracksArtistsById);
          trackStats = statsResult.trackStats;
          artistStats = statsResult.artistStats;
          genreStats = statsResult.genreStats;
          totalPlays = statsResult.totalWeight;
          totalDuration = statsResult.totalDuration;
          totalGenres = Object.values(topTracksArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);
          
          const totalPopularityTracks = topTracks.reduce((sum, track) => sum + (track.popularity || 0), 0);
          averagePopularity = topTracks.length > 0 ? Math.round(totalPopularityTracks / topTracks.length) : 0;
          break;
        }
        case 'topArtists': {
          // Top Artists mode: use rank-based weights, match tracks from user's top tracks
          const statsResult = calculateTopArtistsStats(topArtists, topTracks);
          trackStats = statsResult.trackStats;
          artistStats = statsResult.artistStats;
          genreStats = statsResult.genreStats;
          totalPlays = statsResult.totalWeight;
          totalDuration = statsResult.totalDuration;
          totalGenres = topArtists.reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);
          
          const totalPopularityArtists = trackStats.reduce((sum, track) => sum + (track.track.popularity || 0), 0);
          averagePopularity = trackStats.length > 0 ? Math.round(totalPopularityArtists / trackStats.length) : 0;
          break;
        }
        case 'recent':
        default: {
          // Recently Played mode: use actual play counts
          const artistIds = Array.from(new Set(
            recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
          ));
          const recentlyPlayedArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          
          // Enhance these artists with Last.fm too
          const recentlyPlayedArtistsArray = await enhanceArtistsWithLastFm(
            Object.values(recentlyPlayedArtistsByIdRaw),
            process.env.LASTFM_API_KEY
          );
          const recentlyPlayedArtistsById = Object.fromEntries(
            recentlyPlayedArtistsArray.map(artist => [artist.id, artist])
          );

          trackStats = calculateTrackStats(recentlyPlayed, recentlyPlayedArtistsById);
          artistStats = calculateArtistStats(recentlyPlayed, recentlyPlayedArtistsById);
          genreStats = calculateGenreStats(recentlyPlayed, recentlyPlayedArtistsById);
          totalPlays = recentlyPlayed.length;
          totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);
          totalGenres = Object.values(recentlyPlayedArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

          const totalPopularityRecent = recentlyPlayed.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
          averagePopularity = totalPlays > 0 ? Math.round(totalPopularityRecent / totalPlays) : 0;
          break;
        }
      }

      const stats: Stats = {
        overview: {
          totalPlays,
          uniqueArtists: artistStats.length,
          uniqueTracks: trackStats.length,
          uniqueGenres: genreStats.length,
          totalDuration,
          averageSessionLength: totalDuration / Math.max(totalPlays, 1) / 60000, // in minutes
          genreDiversity: genreStats.length / Math.max(totalGenres, 1),
          artistDiversity: artistStats.length / Math.max(totalPlays, 1),
          averagePopularity,
          genreCoverage: 0 // Will be computed below
        },
        recentlyPlayed,
        tracks: trackStats,
        artists: artistStats,
        genres: genreStats,
        topTracks,
        topArtists,
        topGenres,
        timeRange,
        mode
      };

      // Compute genre coverage using the improved classification system
      // Import here to avoid circular dependencies
      const { calculateWeightedVACRSScoreWithCoverage } = await import('@/utils/musicClassification');
      const coverageResult = calculateWeightedVACRSScoreWithCoverage(genreStats);
      stats.overview.genreCoverage = coverageResult.coverage;

      // Dev-only debug data: include per-artist genre classification details
      if (process.env.NODE_ENV === 'development' && searchParams.get('debugGenres') === '1') {
        const { classifyGenresWithDetails } = await import('@/utils/musicClassification');
        
        // Fetch audio features for tracks
        const tracksByArtist = new Map<string, Array<{ trackId: string; trackName: string }>>();
        console.log('[Debug] trackStats length:', trackStats.length);
        trackStats.slice(0, 50).forEach(({ track, artists }) => {
          artists.forEach(artist => {
            if (!tracksByArtist.has(artist.id)) {
              tracksByArtist.set(artist.id, []);
            }
            const artistTracks = tracksByArtist.get(artist.id)!;
            if (artistTracks.length < 3) { // Max 3 tracks per artist for debug
              artistTracks.push({ trackId: track.id, trackName: track.name });
            }
          });
        });
        
        console.log('[Debug] tracksByArtist size:', tracksByArtist.size);
        console.log('[Debug] Total tracks to fetch features for:', Array.from(tracksByArtist.values()).flatMap(t => t).length);
        
        // Fetch audio features in batches
        const audioFeaturesMap = new Map<string, SpotifyApi.AudioFeaturesResponse>();
        const trackIds = Array.from(tracksByArtist.values()).flatMap(tracks => tracks.map(t => t.trackId));
        
        try {
          // Spotify allows up to 100 tracks per request
          for (let i = 0; i < trackIds.length; i += 100) {
            const batch = trackIds.slice(i, i + 100);
            const { getAudioFeaturesForTracks } = await import('@/lib/spotify');
            const features = await getAudioFeaturesForTracks(batch);
            console.log('[Debug] Fetched features batch:', batch.length, 'got:', features.filter(f => f !== null).length, 'non-null');
            features.forEach((feature, idx) => {
              if (feature) {
                audioFeaturesMap.set(batch[idx], feature);
              }
            });
          }
          console.log('[Debug] Total audio features fetched:', audioFeaturesMap.size);
        } catch (error) {
          console.error('Error fetching audio features for debug:', error);
        }
        
        const debugData = artistStats.map(({ artist }) => {
          const spotifyGenres = artist.genres || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lastFmData = (artist as any)._lastFmData;
          const lastFmTagsUsed = lastFmData?.classifications
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.filter((c: any) => c.matchedGenre && c.scores)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.map((c: any) => c.originalGenre) || [];
          
          const effectiveGenres = [...spotifyGenres, ...lastFmTagsUsed];
          const classifications = classifyGenresWithDetails(effectiveGenres);
          
          // Get audio features for this artist's tracks
          const artistTracks = tracksByArtist.get(artist.id) || [];
          const audioFeatures = artistTracks
            .map(({ trackId, trackName }) => {
              const features = audioFeaturesMap.get(trackId);
              if (!features) return null;
              return {
                trackName,
                valence: features.valence,
                energy: features.energy,
                danceability: features.danceability,
                acousticness: features.acousticness,
                instrumentalness: features.instrumentalness,
                speechiness: features.speechiness,
                tempo: features.tempo
              };
            })
            .filter((f): f is NonNullable<typeof f> => f !== null);
          
          if (audioFeatures.length > 0) {
            console.log('[Debug] Artist', artist.name, 'has', audioFeatures.length, 'audio features');
          }
          
          return {
            artistName: artist.name,
            spotifyGenres,
            lastFmTagsUsed,
            matchedNodes: classifications.matchedGenres,
            matchType: classifications.matchType,
            vacrsScores: classifications.scores,
            coverage: classifications.coverage,
            audioFeatures: audioFeatures.length > 0 ? audioFeatures : undefined
          };
        });
        console.log('[Debug] Debug data with audio features:', debugData.filter(d => d.audioFeatures).length, '/', debugData.length);
        stats.debugGenreData = debugData;
      }

      return stats;
    });

    const response = NextResponse.json(stats);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
