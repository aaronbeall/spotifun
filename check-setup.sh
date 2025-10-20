#!/bin/bash

echo "🎵 Spotifun Development Environment Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Environment file (.env.local) found"
    
    # Check if Spotify credentials are set
    if grep -q "SPOTIFY_CLIENT_ID=8c0981c557244dc3ba20b9c2b03ddab0" .env.local; then
        echo "✅ Spotify Client ID configured"
    else
        echo "❌ Spotify Client ID not found"
    fi
    
    if grep -q "SPOTIFY_CLIENT_SECRET=41383b2c187c40cb93a5d257c41d7739" .env.local; then
        echo "✅ Spotify Client Secret configured"
    else
        echo "❌ Spotify Client Secret not found"
    fi
    
    if grep -q "SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify" .env.local; then
        echo "✅ Spotify Redirect URI configured"
    else
        echo "❌ Spotify Redirect URI not found"
    fi
else
    echo "❌ Environment file (.env.local) not found"
fi

echo ""
echo "🌐 Server Status:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Development server is running on http://localhost:3000"
else
    echo "❌ Development server is not responding"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Visit http://localhost:3000"
echo "2. Click 'Connect with Spotify'"
echo "3. Authorize the app with your Spotify account"
echo "4. Explore your music analytics!"
echo ""
echo "🎉 Ready to discover your music story!"

