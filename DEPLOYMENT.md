# 🚀 Spotifun Deployment Guide

This guide covers deploying Spotifun to Vercel, the recommended hosting platform for Next.js applications.

## 📋 Prerequisites

- GitHub repository with Spotifun code
- Spotify Developer Account
- Vercel account (free)

## 🎯 Why Vercel?

- ✅ **Perfect for Next.js** - Zero configuration needed
- ✅ **Free tier** - Generous limits for personal projects
- ✅ **Automatic deployments** - Deploys on every git push
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **HTTPS included** - Secure by default
- ✅ **Environment variables** - Secure secret management
- ✅ **Serverless functions** - Handles API routes automatically

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. **Visit**: https://vercel.com
2. **Sign up** with your GitHub account
3. **Authorize** Vercel to access your repositories

### Step 3: Import Project

1. **Click "New Project"** in Vercel dashboard
2. **Find your repository**: `aaronbeall/spotifun`
3. **Click "Import"**

### Step 4: Configure Project

Vercel will auto-detect Next.js settings:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**No additional configuration needed!**

### Step 5: Set Environment Variables

Before deploying, add these environment variables in Vercel dashboard:

#### Required Variables:

```
SPOTIFY_CLIENT_ID = your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET = your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI = https://your-app-name.vercel.app/api/auth/callback/spotify
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = your_production_secret_here
```

#### How to Add Environment Variables:

1. **Go to Project Settings** → **Environment Variables**
2. **Add each variable** with the correct values
3. **Set environment** to "Production" (and Preview if desired)
4. **Save** each variable

### Step 6: Deploy

1. **Click "Deploy"**
2. **Wait for build** (usually 1-2 minutes)
3. **Get your live URL** (e.g., `https://spotifun-abc123.vercel.app`)

### Step 7: Update Spotify App Settings

Once you have your Vercel URL:

1. **Go to**: https://developer.spotify.com/dashboard
2. **Select your app**
3. **Click "Edit Settings"**
4. **Update Redirect URIs** to:
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/spotify
   ```
5. **Save changes**

### Step 8: Update Environment Variables

Go back to Vercel and update the redirect URI:

1. **Project Settings** → **Environment Variables**
2. **Edit** `SPOTIFY_REDIRECT_URI` and `NEXTAUTH_URL`
3. **Update** with your actual Vercel URL
4. **Save** and **redeploy**

## 🔧 Configuration Details

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app's client ID | `8c0981c557244dc3ba20b9c2b03ddab0` |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify app's secret | `41383b2c187c40cb93a5d257c41d7739` |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL | `https://spotifun.vercel.app/api/auth/callback/spotify` |
| `NEXTAUTH_URL` | Your app's base URL | `https://spotifun.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for sessions | `your_production_secret_here` |

### Spotify App Requirements

Your Spotify app must have:

- **App Name**: Any name you choose
- **Redirect URIs**: Must match your Vercel URL exactly
- **Scopes**: 
  - `user-read-private`
  - `user-read-email`
  - `user-top-read`
  - `user-read-recently-played`
  - `user-read-playback-state`
  - `user-read-currently-playing`
  - `playlist-read-private`
  - `playlist-read-collaborative`

## 🎉 Post-Deployment

### Automatic Features

Once deployed, Vercel provides:

- ✅ **Automatic HTTPS** - Secure connections
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Auto-deployments** - Updates on every git push
- ✅ **Custom domains** - Optional custom domain setup
- ✅ **Analytics** - Performance monitoring
- ✅ **Preview deployments** - Test changes before production

### Testing Your Deployment

1. **Visit your Vercel URL**
2. **Click "Connect with Spotify"**
3. **Complete OAuth flow**
4. **Verify all features work**:
   - Dashboard loads
   - Stats display correctly
   - Achievements work
   - Rankings show
   - Music profile generates

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
- **Check build logs** in Vercel dashboard
- **Verify all dependencies** are in `package.json`
- **Ensure TypeScript** compiles without errors

#### Environment Variable Issues
- **Double-check variable names** (case-sensitive)
- **Verify values** are correct
- **Ensure variables** are set for Production environment

#### Spotify Authentication Errors
- **Check redirect URI** matches exactly
- **Verify Spotify app** is not in Development Mode (unless you're the only user)
- **Confirm scopes** are properly configured

#### Runtime Errors
- **Check browser console** for client-side errors
- **Review Vercel function logs** for server-side errors
- **Test API endpoints** individually

### Debugging Steps

1. **Check Vercel deployment logs**
2. **Verify environment variables** are set
3. **Test Spotify OAuth** with a simple curl request
4. **Check browser network tab** for failed requests
5. **Review serverless function logs**

## 📊 Vercel Free Tier Limits

- **100GB bandwidth** per month
- **100GB-hours** of serverless function execution
- **Unlimited** static deployments
- **Unlimited** personal projects
- **Custom domains** included

## 🔄 Continuous Deployment

### Automatic Deployments

Every time you push to your main branch:

1. **Vercel detects** the push
2. **Builds** your application
3. **Deploys** to production
4. **Notifies** you of success/failure

### Preview Deployments

For pull requests:

1. **Vercel creates** a preview URL
2. **Deploys** the PR branch
3. **Provides** a unique URL for testing
4. **Automatically** cleans up when PR is closed

## 🎯 Next Steps

After successful deployment:

1. **Share your app** with friends
2. **Monitor usage** in Vercel dashboard
3. **Set up custom domain** (optional)
4. **Configure analytics** (optional)
5. **Set up monitoring** (optional)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**🎵 Your music analytics app is now live and ready to discover listening habits!**
