# 🚀 Vercel Deployment Guide for Explain-a-thon

## Prerequisites
- GitHub account (or GitLab/Bitbucket)
- Vercel account (free tier works perfectly)

## Backend Requirements

### Do you need Supabase or external backend?
**NO!** The app is self-contained with these options:

1. **Vercel Postgres** (Recommended - FREE tier available)
   - Built into Vercel
   - One-click setup
   - Perfect for this app

2. **Neon Database** (Alternative - generous free tier)
   - PostgreSQL compatible
   - Easy Vercel integration

3. **Supabase** (Only if you already use it)
   - Works but overkill for this app
   - We don't use auth, storage, or realtime features

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial explain-a-thon AMA app"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

#### Option B: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **./** (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 3. Set Up Database

#### Using Vercel Postgres (Recommended):
1. In Vercel Dashboard → Your Project → **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Choose region closest to your users
4. Click **Create**
5. Database URL is automatically added to your environment variables

#### Using Neon (Alternative):
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables:
   - `DATABASE_URL` = your Neon connection string

### 4. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=[Auto-filled if using Vercel Postgres]
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
```

### 5. Update Database Schema

After deployment, run migrations:

```bash
# If using Vercel CLI
vercel env pull .env.local
npx prisma generate
npx prisma db push

# Or use Vercel's query interface to run the schema
```

### 6. Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain (e.g., `ama.yourdomain.com`)
3. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Test creating an AMA
- [ ] Test all three links (Ask, Answer, Host)
- [ ] Test question submission and voting
- [ ] Test answer submission
- [ ] Test digest compilation
- [ ] Verify dark theme displays correctly
- [ ] Check mobile responsiveness

## Production Optimizations

### Already Included:
- ✅ Server-side rendering
- ✅ API route optimization
- ✅ Efficient database queries
- ✅ No authentication overhead
- ✅ Minimal bundle size

### Optional Enhancements:
- Add Vercel Analytics (free tier)
- Enable Vercel Speed Insights
- Set up error monitoring (Sentry)

## Monitoring & Maintenance

### Vercel Dashboard Shows:
- Request logs
- Function execution times
- Database queries
- Error tracking
- Performance metrics

### Database Maintenance:
- Vercel Postgres: Automatic backups
- Connection pooling: Handled automatically
- Scaling: Automatic with Vercel

## Costs

### Free Tier Limits (More than enough):
- **Vercel**: 100GB bandwidth, unlimited projects
- **Vercel Postgres**: 60 compute hours/month, 256MB storage
- **Neon**: 3GB storage, generous compute

### When You'll Need to Pay:
- Over 1000 active AMAs/month
- Over 100k page views/month
- Need guaranteed uptime SLA

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL in environment variables

### Issue: "Build failed"
**Solution**:
```bash
npm run build  # Test locally first
npx prisma generate  # Ensure Prisma client is generated
```

### Issue: "Links show localhost in production"
**Solution**: Set `NEXT_PUBLIC_BASE_URL` in Vercel env vars

### Issue: "Slow cold starts"
**Solution**: Normal for serverless, improves with traffic

## Quick Deploy Button

Add this to your README for one-click deploys:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/explain-a-thon&env=DATABASE_URL,NEXT_PUBLIC_BASE_URL)
```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Prisma with Vercel: https://www.prisma.io/docs/guides/deployment/deployment-vercel

---

## TL;DR Quick Deploy

1. Push to GitHub
2. Go to https://vercel.com/new
3. Import repo
4. Add Vercel Postgres in Storage tab
5. Deploy!

That's it! No external backend needed. Vercel handles everything.