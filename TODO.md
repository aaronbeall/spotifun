# Todo

## Features
- [x] Time range
- [x] Stats (Plays, Duration, Songs, Albums, Artists)
- [x] Tops (Songs, Albums, Artists, Genres)
- [x] Charts
- [x] Achievements
- [x] Music Personality (Artist Consistency, Genre Diversity, Popularity, Dating, Peak Hours)
- [x] Current Mood
- [ ] Shows/News
  - [ ] For current mood
  - [ ] For Top Artists
- [x] Currently playing
- [ ] Playlist creation
  - [ ] Create playlist from mood
  - [ ] Create my perfect playlist
  - [ ] Create a music journey
- [x] Mood timeline
- [ ] AI insights
  - [ ] Roast my music
- [ ] Reccomendations

## Social (Requires backend)
- [ ] Rankings (Global, Nearby, Friends)
- [ ] Personal ranking changes
- [ ] Compare with friends
- [ ] Competitions
- [ ] Compatibility Partners
  - [ ] Send messages

## Enhancements
- [ ] Music vibe dimension relevance based on range
- [ ] Recently Played time frame
- [ ] Vibes for liked songs
- [ ] Vibes for playlists
- [ ] Vibes for tops
- [x] Spotify links for all the artist/track/album/playlist/genre
- [x] Share option
- [x] Timeout/refresh handling
- [ ] PWA
- [ ] Genre images (lookup genre top artists and use their pictures)
- [ ] Extract artist/theme colors (can also be used for genres)
- [ ] Full music story share (include everything on one card)
- [x] Supplement track/artist genres with external APIs (Last.fm, MusicBrainz)
  - [x] Last.fm artist tags integration with rate limiting
  - [x] Tag filtering (remove junk tags like "seen live", nationalities, years)
  - [x] Weighted tag scoring against genre taxonomy and descriptor vocabulary
  - [x] Next.js fetch caching with long revalidation (7 days)
  - [x] Graceful degradation when API key is missing
  - [ ] MusicBrainz integration (optional, background only)
- [ ] Supplement reccomendations with external APIs (Last.fm)
- [x] Add song moods with external APIs (Last.fm) - via descriptor vocabulary scoring

## Premium
- [ ] Poll user data
- [ ] Allow data import -> automate this or provide a service?
- [ ] Send alerts on mood change, etc
- [ ] Longer history rollup analysis
- [ ] AI features -> LLM based playlist creation, analysis, etc

## Advanced
- [x] Genre classification improvements
  - [x] Hierarchical genre taxonomy with parent fallback
  - [x] Normalized genre matching (case, diacritics, hyphens, aliases)
  - [x] Whole-word matching to avoid false positives (e.g., "trap" vs "rap")
  - [x] Unknown genre tracking with coverage metrics (instead of defaulting to 0.5)
  - [x] Descriptor vocabulary for mood/tag scoring
  - [x] Validation script for taxonomy integrity
- [ ] ML and sentiment analysis
  - [ ] Better (maybe?) vibe classification
  - [ ] Better (maybe?) persona classification
- [ ] Automatic caching of connected accounts in realtime

## Posterity
- [ ] About
- [ ] Fake ass home screen
- [ ] Technical explanation (for the nerds)
- [ ] Footer -> Meta Modern Monkey
- [ ] Buy Me A Coffee, Patreon, X
- [ ] Share on forums for fun
- [ ] Add to portfolio?