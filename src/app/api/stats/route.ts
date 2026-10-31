import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches,
  calculateTopTracksStats, calculateTopArtistsStats, enhanceArtistsWithLastFm, countRecentPlays,
  getLikedSongsCollection, getPlaylistCollection, MissingScopeError, InvalidPlaylistError
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import type { LastFmEnhancedArtist, PlaylistCollection } from '@/lib/spotify';
import { Stats, TimeRange, DataMode, ArtistGenreDebugInfo, GenreTagDebugInfo, TopArtistItem, TopTrackItem, PlaylistAnalysis, LIKED_SONGS_ID } from '@/types';

// Drops server-only fields (e.g. `_lastFmData`, `_spotifyGenres`) from the response
const stripInternalFields = (key: string, value: unknown) => key.startsWith('_') ? undefined : value;

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
    const mode = (searchParams.get('mode') as DataMode) || 'recent';
    const playlistId = searchParams.get('playlist') || LIKED_SONGS_ID;
    const lastFmApiKey = searchParams.get('lastfm') === '0' ? undefined : process.env.LASTFM_API_KEY;

    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const collectionPromise: Promise<PlaylistCollection | null> = mode === 'playlist'
        ? (playlistId === LIKED_SONGS_ID ? getLikedSongsCollection() : getPlaylistCollection(playlistId))
        : Promise.resolve(null);

      // Personal tops stay available for the grids below the profile card.
      const [recentlyPlayed, topTracksRaw, topArtistsRaw, collection] = await Promise.all([
        getRecentlyPlayed(limit),
        getTopTracks(timeRange, 50),
        getTopArtists(timeRange, 50),
        collectionPromise
      ]);

      const lastFmUnavailable = new Set<string>();
      const enhanceWithLastFm = async (artists: SpotifyApi.ArtistObjectFull[]) => {
        const result = await enhanceArtistsWithLastFm(artists, lastFmApiKey);
        result.lastFmUnavailable.forEach(name => lastFmUnavailable.add(name));
        return result.artists;
      };

      // Enhance top artists with Last.fm data for artists with thin genres.
      // This is server-side only, cached 7 days.
      const enhancedTopArtists = await enhanceWithLastFm(topArtistsRaw);

      // Recent plays come from the same recently-played window, never from rank.
      const recentPlays = countRecentPlays(recentlyPlayed);
      const topArtists: TopArtistItem[] = enhancedTopArtists.map(artist => ({
        ...artist,
        recentPlays: recentPlays.artists.get(artist.id) ?? 0
      }));
      const topTracks: TopTrackItem[] = topTracksRaw.map(track => {
        const plays = recentPlays.tracks.get(track.id);
        return {
          ...track,
          recentPlays: plays?.count ?? 0,
          ...(plays ? { lastPlayed: plays.lastPlayed } : {})
        };
      });

      // Calculate top genres from top artists
      const topGenres = calculateTopGenres(topArtists);

      let trackStats, artistStats, genreStats, totalPlays, totalDuration, totalGenres, averagePopularity;
      let playlistAnalysis: PlaylistAnalysis | undefined;

      switch (mode) {
        case 'topTracks': {
          // Top Tracks mode: Spotify's ranked list, each track counted once
          const artistIds = Array.from(new Set(
            topTracks.flatMap(track => track.artists.map(artist => artist.id))
          ));
          const topTracksArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          
          // Enhance these artists with Last.fm too
          const topTracksArtistsArray = await enhanceWithLastFm(Object.values(topTracksArtistsByIdRaw));
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
          // Top Artists mode: Spotify's ranked list, each artist counted once
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
        case 'playlist': {
          if (!collection) throw new Error('Playlist was not loaded');
          const source = collection;
          const artistIds = Array.from(new Set(
            source.tracks.flatMap(item => item.track.artists.map(artist => artist.id).filter(Boolean))
          ));
          const playlistArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          const playlistArtistsArray = await enhanceWithLastFm(Object.values(playlistArtistsByIdRaw));
          const playlistArtistsById = Object.fromEntries(
            playlistArtistsArray.map(artist => [artist.id, artist])
          );

          const addedAtById = new Map(source.tracks.map(item => [item.track.id, item.addedAt]));
          const statsResult = calculateTopTracksStats(
            source.tracks.map(item => item.track),
            playlistArtistsById
          );
          trackStats = statsResult.trackStats.map(stat => {
            const addedAt = addedAtById.get(stat.track.id);
            return addedAt ? { ...stat, firstPlayed: addedAt, lastPlayed: addedAt } : stat;
          });
          artistStats = statsResult.artistStats;
          genreStats = statsResult.genreStats;
          totalPlays = statsResult.totalWeight;
          totalDuration = statsResult.totalDuration;
          totalGenres = Object.values(playlistArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

          const totalPopularity = source.tracks.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
          averagePopularity = source.tracks.length > 0 ? Math.round(totalPopularity / source.tracks.length) : 0;
          playlistAnalysis = {
            id: source.id,
            name: source.name,
            ...(source.image ? { image: source.image } : {}),
            total: source.total,
            analyzed: trackStats.length,
          };
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
          const recentlyPlayedArtistsArray = await enhanceWithLastFm(Object.values(recentlyPlayedArtistsByIdRaw));
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
        mode,
        ...(playlistAnalysis ? { playlist: playlistAnalysis } : {}),
        ...(lastFmUnavailable.size > 0 && { lastFmUnavailableCount: lastFmUnavailable.size })
      };

      // Compute genre coverage using the improved classification system
      // Import here to avoid circular dependencies
      const { calculateWeightedVACRSScoreWithCoverage } = await import('@/utils/musicClassification');
      const coverageResult = calculateWeightedVACRSScoreWithCoverage(genreStats);
      stats.overview.genreCoverage = coverageResult.coverage;

      // Dev-only debug data, derived from what the pipeline above already fetched (no extra requests)
      if (process.env.NODE_ENV === 'development') {
        const { classifyGenresWithDetails } = await import('@/utils/musicClassification');
        const { explainGenreMatch } = await import('@/utils/improvedClassification');

        const { isJunkTag } = await import('@/utils/lastfm');

        stats.debugLastFmStatus = lastFmApiKey
          ? 'on'
          : process.env.LASTFM_API_KEY ? 'disabled' : 'no-api-key';

        const debugData: ArtistGenreDebugInfo[] = artistStats.map(({ artist }) => {
          const { genres = [], _spotifyGenres, _lastFmData: lastFmData } = artist as LastFmEnhancedArtist;
          const spotifyGenres = _spotifyGenres ?? genres;
          const spotifyGenresSet = new Set(spotifyGenres);
          const lastFmTagsUsedSet = new Set(genres.filter(genre => !spotifyGenresSet.has(genre)));

          const classifications = classifyGenresWithDetails(genres);

          const spotifyTags: GenreTagDebugInfo[] = spotifyGenres.map(tag => {
            const explanation = explainGenreMatch(tag);
            return {
              tag,
              source: 'spotify',
              ...explanation,
              usedInScoring: explanation.scoresFrom !== null
            };
          });

          const lastFmTags: GenreTagDebugInfo[] = (lastFmData?.rawTags ?? []).map(({ name, count }) => ({
            tag: name,
            source: 'lastfm',
            ...explainGenreMatch(name),
            weight: count,
            filteredAsJunk: isJunkTag(name),
            usedInScoring: lastFmTagsUsedSet.has(name)
          }));

          return {
            artistName: artist.name,
            hasLastFmData: lastFmData !== undefined,
            tags: [...spotifyTags, ...lastFmTags],
            vacrsScores: classifications.scores,
            coverage: classifications.coverage
          };
        });
        stats.debugGenreData = debugData;
      }

      return stats;
    });

    const response = new NextResponse<Stats>(JSON.stringify(stats, stripInternalFields), {
      headers: { 'content-type': 'application/json' }
    });
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    if (error instanceof MissingScopeError) {
      return NextResponse.json({ error: 'missing_scope', scope: error.scope }, { status: 403 });
    }
    if (error instanceof InvalidPlaylistError) {
      return NextResponse.json({ error: 'Invalid playlist' }, { status: 400 });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
