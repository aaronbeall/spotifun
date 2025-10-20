# Spotifun 🎵

A comprehensive Spotify analytics webapp that provides detailed insights, stats, and fun feedback about your Spotify listening habits. Get your personalized music profile, unlock achievements, and compare your habits with other users!

## Features

- **🔐 Spotify OAuth Integration** - Secure authentication with Spotify
- **📊 Detailed Analytics** - Track songs played, play counts, genres within specified timeframes
- **🎭 Top Lists** - View your top artists, songs, and genres with beautiful visualizations
- **🎉 Fun Stat Cards** - Spotify Wrapped-style insights and fun facts
- **🎨 Music Profile** - Personalized profile with styling based on genres and habits
- **🏆 Achievements** - Unlock fun achievements and milestones
- **📈 Rankings** - Compare your habits against other users
- **📱 Mobile Friendly** - Responsive design that works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: Spotify Web API
- **Backend**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Spotify Developer Account

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spotifun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note down your Client ID and Client Secret
   - Add `http://localhost:3000/api/auth/callback/spotify` to Redirect URIs

4. **Configure environment variables**
   
   Create a `.env.local` file with your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── stats/         # Statistics endpoints
│   │   └── user/          # User data endpoints
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── features/          # Feature-specific components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   └── spotify.ts        # Spotify API integration
├── types/                # TypeScript type definitions
│   └── index.ts          # Main types
└── utils/                # Utility functions
    └── index.ts          # Helper functions
```

## API Endpoints

- `GET /api/auth/spotify` - Initiate Spotify OAuth flow
- `GET /api/auth/callback/spotify` - Handle OAuth callback
- `GET /api/user` - Get current user data
- `GET /api/stats` - Get user statistics and analytics

## Features in Detail

### Analytics Dashboard
- Total plays, unique artists, unique tracks
- Top artists, songs, and genres with play counts
- Time range filtering (4 weeks, 6 months, all time)
- Beautiful visualizations and charts

### Music Profile
- Personalized listening personality
- Genre diversity analysis
- Peak listening hours
- Discovery score and consistency metrics

### Achievements System
- Pre-canned achievements for various milestones
- Progress tracking
- Fun descriptions and icons

### Rankings
- Compare your habits with other users
- Leaderboards for different categories
- Social features and competition

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Spotify Web API for providing access to user data
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All the open-source contributors who made this possible

---

Made with ❤️ for music lovers everywhere