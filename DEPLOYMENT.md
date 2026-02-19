# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository (recommended)
- Database already setup (Neon PostgreSQL)

## Step 1: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_CvtGIY0gQKz5@ep-round-mud-aiq6xyr3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-a-strong-random-secret-here

SCAN_WORKER_SECRET=generate-another-secret

GEMINI_API_KEY=AIzaSyCwW25hGN-EfaoEt1H5Hf-SJ-GAulG7PAU

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PRICE_ID=price_your_id
STRIPE_WEBHOOK_SECRET=whsec_your_secret

NEXT_DISABLE_TURBOPACK=1
```

## Step 2: Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push code to GitHub
2. Go to vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Vercel will auto-detect Next.js
6. Add environment variables
7. Click "Deploy"

### Option B: Via Vercel CLI
```bash
npm i -g vercel
cd carbon-ai
vercel
```

## Step 3: Post-Deployment

1. **Update NEXTAUTH_URL**: Replace with your actual Vercel URL
2. **Run Prisma Migration**: 
   - Vercel will auto-run `prisma generate` during build
   - Database migrations already applied
3. **Test Authentication**: Try login/signup
4. **Test Scanning**: Run a website scan

## Known Limitations on Vercel

### 1. Playwright/Headless Browser
- **Issue**: Heavy dependency, may timeout
- **Solution**: Consider using:
  - Browserless.io (external service)
  - Puppeteer with chrome-aws-lambda
  - Or upgrade to Vercel Pro for 60s timeout

### 2. Function Timeout
- **Free Plan**: 10 seconds max
- **Pro Plan**: 60 seconds max
- **Current scan time**: 30-60 seconds
- **Recommendation**: Upgrade to Pro or use background jobs

### 3. Cold Starts
- First request may be slow
- Subsequent requests will be faster

## Troubleshooting

### Build Fails
```bash
# Check if Prisma generates correctly
npx prisma generate
npm run build
```

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is accessible
- Ensure SSL mode is enabled

### API Routes Not Working
- Check environment variables are set
- Verify NEXTAUTH_URL matches deployment URL
- Check function logs in Vercel dashboard

## Monitoring

- **Logs**: Vercel Dashboard → Deployments → Function Logs
- **Analytics**: Vercel Dashboard → Analytics
- **Errors**: Check Runtime Logs for API errors

## Optimization Tips

1. **Enable Edge Functions** for faster response
2. **Use ISR** (Incremental Static Regeneration) for static pages
3. **Optimize Images** with Next.js Image component
4. **Enable Caching** for API responses where possible

## Production Checklist

- [ ] All environment variables added
- [ ] NEXTAUTH_URL updated to production URL
- [ ] Database migrations applied
- [ ] Stripe webhook URL updated
- [ ] Test authentication flow
- [ ] Test website scanning
- [ ] Test payment flow
- [ ] Monitor function timeouts
- [ ] Check error logs

## Support

If deployment fails, check:
1. Vercel build logs
2. Function runtime logs
3. Database connectivity
4. Environment variables

For Playwright issues, consider migrating to a lighter solution or external service.
