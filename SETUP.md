# 🎵 Spotifun - Complete Setup Guide

## 🚀 Quick Start

### 1. Set up Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your Client ID and Client Secret
4. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`

### 2. Configure Environment
Update `.env.local` with your credentials:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` and connect with Spotify!

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── stats/         # Statistics endpoints
│   │   └── user/          # User data endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── features/          # Feature-specific components
│       ├── FunStats.tsx   # Spotify Wrapped-style cards
│       ├── MusicProfile.tsx # Music personality profile
│       ├── Achievements.tsx # Achievement system
│       └── Rankings.tsx   # Global rankings
├── lib/                   # Utility libraries
│   └── spotify.ts         # Spotify API integration
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

## 🎯 Key Features Explained

### Analytics Engine
- Processes Spotify play history data
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
- **Stats Calculations** (`src/lib/spotify.test.ts`) - Track/artist/genre aggregation from play history
- **Persona Detection** (`src/utils/musicPersonas.test.ts`) - Music listening personality classification
- **Diversity Metrics** (`src/utils/statsHelpers.test.ts`) - Genre/artist diversity and session statistics

All tests use small hand-built fixtures and do not require network access or Spotify credentials.

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Authentication**: Spotify Web API OAuth
- **Backend**: Next.js API Routes
- **State Management**: React hooks and local state
- **Testing**: Vitest for unit testing
