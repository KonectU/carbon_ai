# 🚀 Deploy Karne Ke Steps - Follow Karo!

## ✅ Step 1: Local Test Karo (Optional but Recommended)

```bash
npm run build
```

Agar build successful hai, to aage badho!

---

## ✅ Step 2: Git Push Karo

```bash
git add .
git commit -m "Ready for Vercel deployment - Payment removed, Playwright fixed"
git push origin main
```

**Note:** Agar GitHub repo nahi hai to pehle create karo:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## ✅ Step 3: Vercel Pe Deploy Karo

### Option A: Vercel Dashboard (Easiest)

1. **Vercel Website Open Karo:**
   - https://vercel.com
   - Login/Signup karo

2. **Import Project:**
   - "Add New..." button click karo
   - "Project" select karo
   - "Import Git Repository" click karo
   - Apna GitHub repo select karo

3. **Configure Project:**
   - Framework Preset: Next.js (auto-detect hoga)
   - Root Directory: `./carbon-ai` (agar monorepo hai)
   - Build Command: (default rakho)
   - Output Directory: (default rakho)

4. **Deploy Button Click Karo!**
   - Wait for deployment (2-3 minutes)

---

## ✅ Step 4: Environment Variables Add Karo

Deployment complete hone ke baad:

1. **Settings Pe Jao:**
   - Deployed project click karo
   - Top menu → "Settings"
   - Left sidebar → "Environment Variables"

2. **Yeh Variables Add Karo:**

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_CvtGIY0gQKz5@ep-round-mud-aiq6xyr3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: NEXTAUTH_SECRET
Value: 88c2a83c12bebb8d8c1b4ba9017942d8705f108ea57b8b48661c84f65818daaa
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: SCAN_WORKER_SECRET
Value: 2e2f02129ca2bf00cb0f18ad4182d646eb7bea1cf10da99c2f5d427e7204297b
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: GEMINI_API_KEY
Value: AIzaSyCwW25hGN-EfaoEt1H5Hf-SJ-GAulG7PAU
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: NEXT_DISABLE_TURBOPACK
Value: 1
Environments: ✅ Production ✅ Preview ✅ Development
```

3. **NEXTAUTH_URL Add Karo:**

Pehle deployment se apna URL copy karo (e.g., `https://your-app.vercel.app`)

```
Name: NEXTAUTH_URL
Value: https://your-actual-app-name.vercel.app
Environments: ✅ Production
```

**Important:** Apna actual Vercel URL use karo!

---

## ✅ Step 5: Redeploy Karo

Environment variables add karne ke baad:

1. "Deployments" tab pe jao
2. Latest deployment pe 3 dots (...) click karo
3. "Redeploy" select karo
4. Wait for redeployment

---

## ✅ Step 6: Test Karo!

Deployment complete hone ke baad:

1. **Homepage Visit Karo:**
   - https://your-app.vercel.app

2. **Sign Up Karo:**
   - New account banao

3. **Login Karo:**
   - Test authentication

4. **Website Scan Try Karo:**
   - https://google.com scan karo

5. **AI Model Scan Try Karo:**
   - Test AI analysis

6. **Dashboard Check Karo:**
   - Results dekho

---

## 🎯 Quick Reference

### Your Secrets (Save These):
```
NEXTAUTH_SECRET=88c2a83c12bebb8d8c1b4ba9017942d8705f108ea57b8b48661c84f65818daaa
SCAN_WORKER_SECRET=2e2f02129ca2bf00cb0f18ad4182d646eb7bea1cf10da99c2f5d427e7204297b
```

### Database URL:
```
postgresql://neondb_owner:npg_CvtGIY0gQKz5@ep-round-mud-aiq6xyr3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Gemini API Key:
```
AIzaSyCwW25hGN-EfaoEt1H5Hf-SJ-GAulG7PAU
```

---

## 🐛 Agar Koi Problem Aaye

### Build Fail Ho Jaye:
```bash
# Local test karo
npm install
npm run build
```

### Environment Variables Not Working:
- Spelling check karo (case-sensitive)
- Redeploy karo after adding variables
- Check all required variables added

### Authentication Issues:
- NEXTAUTH_URL correct hai?
- Browser cookies clear karo
- NEXTAUTH_SECRET set hai?

### Scanning Fails:
- Gemini API key valid hai?
- Database connection check karo
- Vercel logs dekho

---

## 📊 Deployment Checklist

- [ ] Local build test kiya
- [ ] Git push kiya
- [ ] Vercel pe import kiya
- [ ] First deployment successful
- [ ] All environment variables added
- [ ] NEXTAUTH_URL updated
- [ ] Redeployed
- [ ] Homepage loads
- [ ] Sign up works
- [ ] Login works
- [ ] Website scan works
- [ ] AI scan works
- [ ] Dashboard shows results

---

## 🎉 Success!

Agar sab steps complete ho gaye, to:

✅ Your app is LIVE on Vercel!
✅ Unlimited scans available
✅ No payment required
✅ Smart crawler working
✅ All features functional

**Your app URL:**
`https://your-app-name.vercel.app`

---

## 💡 Pro Tips

1. **Custom Domain:**
   - Vercel Settings → Domains
   - Add your custom domain

2. **Monitor Logs:**
   - Deployments → Function Logs
   - Check for errors

3. **Analytics:**
   - Enable Vercel Analytics
   - Monitor performance

4. **Automatic Deploys:**
   - Every git push auto-deploys
   - Preview deployments for PRs

---

## 🆘 Need Help?

Agar koi issue aaye to:
1. Vercel build logs check karo
2. Function logs dekho
3. Environment variables verify karo
4. Database connection test karo

**Ab deploy karo aur enjoy karo!** 🚀
