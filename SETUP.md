# 🎵 Spotifun - Complete Setup Guide

## 🚀 Quick Start

### 1. Get a Last.fm API key
1. Create an API account at [last.fm/api/account/create](https://www.last.fm/api/account/create)
2. Note the API key (the shared secret isn't needed: Spotifun only reads public data)

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then set your key in `.env.local`:
```env
LASTFM_API_KEY=your_lastfm_api_key_here
```

**Notes:**
- **No OAuth:** listeners just type their Last.fm username. Their public scrobbles are read with the app's API key.
- **Artwork:** comes from Deezer's public API, which needs no key.
- **Caching:** Last.fm and Deezer responses go through `src/lib/apiCache.ts` (Next's fetch cache, a cache-first probe, a per-service throttle, and a cooldown after rate limits). Artist tags and artwork are cached for 30 days, top lists for 15 minutes to a day, recent plays for a minute.
- **Deployment:** When deploying to Vercel, set `LASTFM_API_KEY` in your Vercel project's environment variables (Settings → Environment Variables).

### 3. Run the Application
```bash
npm run dev
```

Visit `http://127.0.0.1:3000` and type a Last.fm username!

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── session/       # Remembers the Last.fm username
│   │   ├── stats/         # Statistics endpoints
│   │   └── user/          # User data endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── features/          # Feature-specific components
│       ├── FunStats.tsx   # Story-style cards
│       ├── MusicProfile.tsx # Music personality profile
│       ├── Achievements.tsx # Achievement system
│       └── Rankings.tsx   # Global rankings
├── lib/                   # Utility libraries
│   ├── lastfmApi.ts       # Last.fm user data
│   ├── deezer.ts          # Artwork and track details
│   ├── apiCache.ts        # Caching and rate limiting for both
│   └── listening.ts       # Stats calculations
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

## 🎯 Key Features Explained

### Analytics Engine
- Processes Last.fm scrobble history
- Calculates comprehensive statistics
- Supports multiple time ranges
- Generates insights and patterns

### Achievement System
- **First Steps**: Play your first track
- **Century Club**: Reach 100 total plays
- **Millennium**: Reach 1,000 total plays
- **Music Marathon**: Reach 10,000 total plays
- **Genre Explorer**: Listen to 10 different genres
- **Artist Collector**: Listen to 50 different artists
- **Music Master**: Listen to 500 different tracks
- **Time Traveler**: Listen for 100+ hours total

### Music Profile Algorithm
- Analyzes genre diversity and artist loyalty
- Determines listening personality (Explorer, Loyal Listener, Genre Hopper, etc.)
- Calculates mood based on top genres
- Identifies peak listening hours
- Generates discovery and consistency scores

### Ranking System
- Score calculation: 40% total plays + 30% artist diversity + 30% genre exploration
- Mock global leaderboard with competitive elements
- Real-time user ranking updates

## 🧪 Testing

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run typecheck
npm run typecheck

# Run linter
npm run lint
```

### Test Coverage

The test suite covers core calculation logic:

- **Popularity Analysis** (`src/utils/popularity.test.ts`) - Track popularity metrics, diversity scoring, and extremes
- **VACRS Traits** (`src/utils/vacrs.test.ts`) - Music trait classification (Valence, Arousal, Complexity, Rawness, Social Presence)
- **Genre Classification** (`src/utils/musicClassification.test.ts`) - Genre-to-VACRS mapping, weighted scoring, and distance calculations
- **Stats Calculations** (`src/lib/listening.test.ts`) - Track/artist/genre aggregation from play history
- **Persona Detection** (`src/utils/musicPersonas.test.ts`) - Music listening personality classification
- **Diversity Metrics** (`src/utils/statsHelpers.test.ts`) - Genre/artist diversity and session statistics

All tests use small hand-built fixtures and do not require network access or API keys.

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Data**: Last.fm API (listening, tags) and Deezer API (artwork)
- **Backend**: Next.js API Routes
- **State Management**: React hooks and local state
- **Testing**: Vitest for unit testing
