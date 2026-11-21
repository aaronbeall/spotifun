# 🚀 Spotifun Deployment Guide

This guide covers deploying Spotifun to Vercel, the recommended hosting platform for Next.js applications.

## 📋 Prerequisites

- GitHub repository with Spotifun code
- Last.fm API key ([create one](https://www.last.fm/api/account/create))
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
LASTFM_API_KEY = your_lastfm_api_key_here
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

## 🔧 Configuration Details

### Environment Variables Explained

| Variable | Purpose |
|----------|---------|
| `LASTFM_API_KEY` | Reads public Last.fm listening data and artist tags |

Deezer (artwork, lengths, release dates, popularity) needs no key.

### API terms to keep in mind

- **Last.fm:** free API use is non-commercial. Ask partners@last.fm before taking payments. Credit "powered by AudioScrobbler" with a link back (the site footer and dashboard do this), and link to Last.fm pages for artists, tracks and users.
- **Deezer:** images may be linked but not stored. Commercial use needs a partnership.

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
2. **Type a Last.fm username** that has scrobbles
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

#### Last.fm Errors
- **"Last.fm is taking a breather"**: the key is missing or rate limited. Check `LASTFM_API_KEY` and the function logs.
- **"Your listening is hidden"**: that Last.fm profile hides recent listening in its privacy settings.

#### Runtime Errors
- **Check browser console** for client-side errors
- **Review Vercel function logs** for server-side errors
- **Test API endpoints** individually

### Debugging Steps

1. **Check Vercel deployment logs**
2. **Verify environment variables** are set
3. **Test the Last.fm key**: `curl "https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=rj&api_key=$LASTFM_API_KEY&format=json"`
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
- [Last.fm API](https://www.last.fm/api)
- [Deezer API](https://developers.deezer.com/api)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**🎵 Your music analytics app is now live and ready to discover listening habits!**
