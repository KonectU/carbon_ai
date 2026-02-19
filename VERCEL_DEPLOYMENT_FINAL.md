# Vercel Deployment - Final Guide

## ✅ Current Status

### What Will Work on Vercel:
- ✅ Next.js API Routes
- ✅ Authentication (NextAuth)
- ✅ Database (Neon PostgreSQL)
- ✅ AI Model Analysis (Gemini AI)
- ✅ All UI pages
- ✅ Unlimited scans (no payment)

### ⚠️ What Needs Attention:

#### 1. Playwright Issue (CRITICAL)
**Problem:** Playwright is too heavy for Vercel serverless functions
**Impact:** Website scanning will fail or timeout

**Solutions (Choose One):**

##### Option A: Use External Service (Recommended for Production)
Use a service like:
- **Browserless.io** (has free tier)
- **ScrapingBee**
- **Apify**

##### Option B: Simplify Scanning (Quick Fix)
Remove headless browser, use simple HTTP requests:
- Fetch HTML with `fetch()`
- Parse with `cheerio`
- Estimate metrics from HTML size
- Less accurate but works on Vercel

##### Option C: Use Puppeteer + chrome-aws-lambda
Replace Playwright with lighter alternative:
```bash
npm uninstall playwright
npm install puppeteer-core chrome-aws-lambda
```

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Remove payment, optimize for Vercel"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel auto-detects Next.js

### Step 3: Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Required)
DATABASE_URL=postgresql://neondb_owner:npg_CvtGIY0gQKz5@ep-round-mud-aiq6xyr3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Auth (Required)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-strong-random-secret-here

# Worker (Required)
SCAN_WORKER_SECRET=another-random-secret

# AI (Required)
GEMINI_API_KEY=AIzaSyCwW25hGN-EfaoEt1H5Hf-SJ-GAulG7PAU

# Build (Required)
NEXT_DISABLE_TURBOPACK=1

# Stripe (Optional - not used anymore)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Important:** 
- Replace `NEXTAUTH_URL` with your actual Vercel URL
- Generate new secrets for `NEXTAUTH_SECRET` and `SCAN_WORKER_SECRET`

### Step 4: Deploy
Click "Deploy" button in Vercel

### Step 5: Update NEXTAUTH_URL
After first deployment:
1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Update `NEXTAUTH_URL` environment variable
3. Redeploy

## ⚙️ Vercel Configuration

File `vercel.json` is already created with:
```json
{
  "buildCommand": "prisma generate && next build",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

This gives API routes 60 seconds timeout (requires Vercel Pro).

## 🔧 Known Limitations

### 1. Function Timeout
- **Free Plan:** 10 seconds
- **Pro Plan:** 60 seconds
- **Current scan time:** 30-60 seconds

**Solution:** Upgrade to Vercel Pro OR use external scanning service

### 2. Playwright Size
- **Issue:** Too large for serverless
- **Solution:** See "Playwright Issue" section above

### 3. Cold Starts
- First request may be slow (5-10 seconds)
- Subsequent requests are fast

## 🧪 Testing After Deployment

1. **Visit homepage** - Should load
2. **Sign up** - Create account
3. **Login** - Test authentication
4. **Try AI scan** - Should work (no browser needed)
5. **Try website scan** - May fail due to Playwright

## 🐛 Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build
```

Check Vercel build logs for specific errors.

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Ensure SSL mode is enabled

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches deployment URL
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### API Routes Timeout
- Check function logs in Vercel dashboard
- Consider upgrading to Pro for 60s timeout
- Or use external service for heavy operations

## 📊 Monitoring

**Vercel Dashboard provides:**
- Real-time logs
- Function execution time
- Error tracking
- Analytics

**Check:**
- Deployments → Function Logs
- Analytics → Performance
- Settings → Environment Variables

## 🎯 Recommended Next Steps

### For Production:

1. **Fix Playwright Issue** (Choose one):
   - Use Browserless.io (easiest)
   - Switch to Puppeteer + chrome-aws-lambda
   - Simplify to HTTP-only scanning

2. **Upgrade to Vercel Pro** ($20/month):
   - 60 second function timeout
   - Better performance
   - More bandwidth

3. **Add Monitoring**:
   - Sentry for error tracking
   - LogRocket for user sessions
   - Vercel Analytics (built-in)

4. **Optimize Performance**:
   - Enable Edge Functions where possible
   - Add caching headers
   - Optimize images

## 📝 Quick Fix for Playwright

If you want to deploy NOW without fixing Playwright:

1. Comment out website scanning temporarily
2. Keep only AI model analysis working
3. Add "Coming Soon" message for website scans
4. Deploy and test
5. Fix Playwright later

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] NEXTAUTH_URL updated to production URL
- [ ] First deployment successful
- [ ] Authentication tested
- [ ] AI scan tested
- [ ] Database connection verified
- [ ] Error logs checked

## 🆘 Need Help?

If deployment fails:
1. Check Vercel build logs
2. Check function runtime logs
3. Verify all environment variables
4. Test locally with `npm run build`
5. Check database connectivity

## 🎉 Success!

Once deployed, your app will be:
- ✅ Live on Vercel
- ✅ Free unlimited scans
- ✅ No payment required
- ✅ Scalable and fast
- ⚠️ Website scanning may need fixing (Playwright issue)

**Your app will be accessible at:**
`https://your-app-name.vercel.app`
