# DMILLION Admin Dashboard Setup

## Access the Admin Dashboard
Visit: http://localhost:5173/admin.html

## Admin Credentials
- Email: admin@dmillion.com
- Password: Dmillion@Admin2024

## Supabase Storage Setup (Required for Image Uploads)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/zprmnbozhqwsxwypmedv

2. Click **Storage** in the left sidebar

3. Click **New Bucket**
   - Name: `product-images`
   - Toggle **Public bucket** ON
   - Click **Create bucket**

4. Set bucket policy:
   - Click on `product-images` bucket
   - Click **Policies** tab
   - Click **New Policy**
   - Choose **For full customization**
   - Policy name: `Public Access`
   - Allowed operations: SELECT, INSERT, UPDATE, DELETE
   - Target roles: Leave empty (anon)
   - Policy definition: `true`
   - Click **Review** then **Save**

## How it Works
1. Admin logs in at `/admin.html`
2. Admin uploads product with image
3. Image is stored in Supabase Storage
4. Product data saved to `products` table
5. Main website automatically shows new products!

## Features
- Add products with images
- Edit existing products
- Delete products
- Mark products as featured
- Set stock quantity
- Real-time sync to main website
