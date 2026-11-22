# DMILLION Deployment Guide - Vercel

## Prerequisites
- GitHub account with repository: https://github.com/dmillion2027-web/dmillion
- Vercel account (free): https://vercel.com
- Supabase project with API keys

---

## Step-by-Step Deployment

### 1. Create Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### 2. Import Project
1. Click "Add New..." → "Project"
2. Find and select: **dmillion2027-web/dmillion**
3. Click "Import"

### 3. Configure Build Settings
Vercel should auto-detect these settings:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

If not auto-detected, enter them manually.

### 4. Add Environment Variables
Click "Environment Variables" and add:

**Required Variables:**
```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
VITE_EMAILJS_SERVICE_ID = your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID = your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY = your_emailjs_public_key
VITE_ADMIN_EMAIL = admin@dmillion.ca
VITE_ADMIN_PASSWORD = your_secure_admin_password
```

**Get Supabase Keys from:**
https://app.supabase.com/project/_/settings/api

**Get EmailJS Keys from:**
https://dashboard.emailjs.com/admin

### 5. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://dmillion-xxx.vercel.app`

### 6. Setup Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain (e.g., dmillion.ca)
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Admin Panel Access

After deployment, access admin panel at:
- Main site: `https://your-domain.vercel.app`
- Admin panel: `https://your-domain.vercel.app/admin.html`

**Admin Login:**
- Email: Value of `VITE_ADMIN_EMAIL`
- Password: Value of `VITE_ADMIN_PASSWORD`

---

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Supabase keys are correct
- Check build logs in Vercel dashboard

### Admin Panel Not Working
- Verify `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` are set
- Clear browser cache
- Check browser console for errors

### Images Not Loading
- Verify Supabase Storage is configured
- Check bucket permissions (public read access)
- Ensure image URLs are correct

### API Errors
- Verify Supabase project is active
- Check RLS (Row Level Security) policies
- Verify service role key is correct

---

## Post-Deployment Checklist

- ✅ Site loads without errors
- ✅ Products display correctly
- ✅ User registration works
- ✅ User login works
- ✅ Cart functionality works
- ✅ Checkout creates orders
- ✅ Admin panel accessible
- ✅ Admin can add/edit/delete products
- ✅ Admin can manage orders
- ✅ Newsletter signup works
- ✅ Contact form sends emails
- ✅ Real-time updates working

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
1. Make changes to your code
2. Commit: `git commit -m "your message"`
3. Push: `git push origin master`
4. Vercel automatically rebuilds and deploys
5. Check deployment status in Vercel dashboard

---

## Performance Tips

1. **Enable Vercel Analytics** (free)
   - Go to Project → Analytics
   - Monitor traffic and performance

2. **Enable Edge Caching**
   - Automatically enabled by Vercel
   - Faster load times globally

3. **Optimize Images**
   - Use WebP format
   - Compress before upload to Supabase

4. **Monitor Supabase Usage**
   - Free tier: 500MB storage, 2GB bandwidth
   - Upgrade if needed

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project GitHub:** https://github.com/dmillion2027-web/dmillion

---

## Production URLs

After deployment, your site will be available at:
- Production: `https://your-domain.vercel.app`
- Admin: `https://your-domain.vercel.app/admin.html`

You can add a custom domain in Vercel settings.
