# 🔧 URGENT: Database Setup Required for Vercel

Your app is deployed but needs a database! Follow these steps:

## Option 1: Vercel Postgres (EASIEST - 2 minutes)

1. **Go to your Vercel Dashboard**
   - https://vercel.com/igoreydman/f1-hackathon-eat

2. **Click on "Storage" tab**

3. **Click "Create Database"**
   - Select **Postgres**
   - Choose your region (closest to you)
   - Click **Create**

4. **That's it!** Vercel automatically:
   - Creates the database
   - Adds DATABASE_URL to your environment
   - Connects it to your app

5. **Push database schema**
   ```bash
   npx vercel env pull .env.local
   npx prisma generate
   npx prisma db push --accept-data-loss
   ```

## Option 2: Neon (Alternative - Free)

1. **Sign up at https://neon.tech**

2. **Create a new project**

3. **Copy the connection string**
   - Looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

4. **Add to Vercel Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `DATABASE_URL` = your connection string
   - Click Save

5. **Redeploy**
   - Vercel Dashboard → Deployments → Redeploy

## Option 3: Supabase (If you already have it)

1. **Get your Database URL from Supabase**
   - Settings → Database → Connection string

2. **Add to Vercel** (same as Neon step 4)

## After Database Setup

The app should work immediately! Test by:
1. Creating an AMA
2. Sharing the links
3. Submitting questions
4. Adding answers

## Troubleshooting

If still getting errors:
1. Check Vercel Functions logs
2. Ensure DATABASE_URL is set in Environment Variables
3. Make sure you selected "Production" environment
4. Try redeploying from Vercel dashboard

## Current Issue
The "Failed to create AMA" error is happening because there's no database connected. Once you add Vercel Postgres (takes 1 minute), everything will work!