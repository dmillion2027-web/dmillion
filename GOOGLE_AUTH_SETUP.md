# Enable Google Authentication in Supabase

## Step 1: Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the consent screen first:
   - User Type: External
   - App name: DMILLION Bags
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through all steps

## Step 2: Create OAuth Client ID

1. Application type: **Web application**
2. Name: DMILLION Bags Web
3. **Authorized JavaScript origins**: 
   - `https://zprmnbozhqwsxwypmedv.supabase.co`
4. **Authorized redirect URIs**:
   - `https://zprmnbozhqwsxwypmedv.supabase.co/auth/v1/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 3: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

## Step 4: Test

1. Your app should now support Google sign-in!
2. Click the Google button on the login page
3. You'll be redirected to Google's sign-in page
4. After successful sign-in, you'll be redirected to your dashboard

## Notes

- The redirect URL for local development is automatically handled by Supabase
- For production, you'll need to add your production URL to Google's authorized origins
- Facebook auth is disabled for now (you can enable it later following similar steps)
