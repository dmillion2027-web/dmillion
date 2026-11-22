# Gmail Order Confirmation Email Setup

## Overview

We're now sending order confirmation emails directly from Gmail via Vercel serverless function. This is way more reliable than EmailJS!

---

## ⚙️ Setup (5 Minutes)

### Step 1: Create Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification** (enable if not already)
3. Go back to **Security**
4. Find **App passwords** (bottom of page)
5. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device)
6. Click **Generate**
7. Copy the 16-character password shown

**Example:** `abcd efgh ijkl mnop` (16 characters with space)

### Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click: **dmillion** → **Settings** → **Environment Variables**
3. Add two new variables:

**Variable 1:**
```
Name: GMAIL_USER
Value: your-email@gmail.com  (the Gmail account)
```

**Variable 2:**
```
Name: GMAIL_APP_PASSWORD
Value: abcdefghijklmnop  (the 16-char password, NO SPACES)
```

4. Make sure both are set for all 3 environments:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

5. Click **Save**

### Step 3: Install Dependencies

```bash
npm install nodemailer
```

Then:
```bash
npm run build
```

### Step 4: Push to GitHub

```bash
git add package.json package-lock.json api/
git commit -m "Add Gmail email sending via Vercel serverless function"
git push origin master
```

Vercel will auto-redeploy in 2-5 minutes.

---

## 🧪 Test It

1. **Wait for Vercel redeploy** (watch deployments dashboard)
2. **Hard refresh:** Ctrl+Shift+R
3. **Place test order** at checkout
4. **Check email** (inbox + spam)

You should receive:
- **From:** DMILLION <your-email@gmail.com>
- **Subject:** Your DMILLION Order Confirmed - Tracking DM1234567890
- **Body:** Beautiful HTML email with order details

---

## 🎯 What Happens Now

**When customer places order:**
1. ✅ Order created in Supabase
2. ✅ Code calls `/api/send-order-email`
3. ✅ Vercel runs the serverless function
4. ✅ Function sends email via Gmail SMTP
5. ✅ Customer receives email in 5-10 seconds

**No more EmailJS issues!** 🎉

---

## 🔐 Security Notes

- ✅ App password is NOT your Gmail password
- ✅ App password only works for Gmail, can be revoked anytime
- ✅ Each app gets its own password
- ✅ Never use your actual Gmail password

---

## ❓ Troubleshooting

### Email Not Sent?

1. Check Vercel environment variables are set correctly
2. Check Vercel redeploy completed
3. Check browser console for error messages (F12)
4. Check Vercel function logs: Dashboard → Deployments → Logs

### Wrong Email Showing?

Make sure `GMAIL_USER` matches your actual Gmail account.

### "Invalid credentials"?

1. Make sure app password has NO SPACES
2. 16 characters exactly
3. Created from myaccount.google.com/security

### Still Not Working?

Go to: https://myaccount.google.com/security/checkup
Check if Gmail flagged it as suspicious. Click to approve.

---

## 📧 Email Content

The email is fully customized with:
- ✅ Customer name
- ✅ Tracking number (prominent)
- ✅ Order items & total
- ✅ Shipping address
- ✅ DMILLION branding
- ✅ Support contact
- ✅ Beautiful HTML formatting

---

**Done!** Order confirmation emails are now live! 🚀
