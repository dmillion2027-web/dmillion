# Supabase Database Setup Guide

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

## 2. Get API Credentials
1. Go to Project Settings > API
2. Copy the `Project URL` and `anon/public` key
3. Create a `.env` file in the root of your project
4. Add your credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Create Database Tables

Run these SQL commands in the Supabase SQL Editor (Database > SQL Editor > New Query):

### Products Table
```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  model_url TEXT, -- 3D model file URL
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add some sample products
INSERT INTO products (name, description, category, price, image_url, stock_quantity, featured) VALUES
('Classic Handbag', 'Elegance in your hands.', 'handbag', 2499.99, '/images/classic-handbag.jpg', 15, true),
('Signature Tote', 'Carry luxury everywhere.', 'tote', 2899.99, '/images/signature-tote.jpg', 12, true),
('Chic Shoulder Bag', 'Style that stands out.', 'shoulder', 2699.99, '/images/chic-shoulder.jpg', 8, true);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
```

### Orders Table
```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  tracking_number VARCHAR(100),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for order tracking
CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
```

### Order Items Table
```sql
-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### Newsletter Subscribers Table
```sql
-- Create newsletter table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT true
);

-- Create unique index on email
CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers(email);
```

### Cart Table (Optional - for persistent carts)
```sql
-- Create carts table
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create cart_items table
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_carts_session ON carts(session_id);
```

## 4. Set Up Real-time Subscriptions

Enable real-time for order tracking:

```sql
-- Enable real-time for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
```

## 5. Set Up Row Level Security (RLS)

For production, enable RLS policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Allow anyone to create orders
CREATE POLICY "Anyone can create orders" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Allow customers to view their own orders by email
CREATE POLICY "Customers can view own orders" 
ON orders FOR SELECT 
USING (true); -- You can add: auth.jwt() ->> 'email' = customer_email for authenticated users

-- Allow public to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

-- Allow viewing order items for their orders
CREATE POLICY "Order items are viewable by everyone" 
ON order_items FOR SELECT 
USING (true);
```

## 6. Set Up Storage Buckets (Optional)

For product images and 3D models:

1. Go to Storage in Supabase dashboard
2. Create two buckets:
   - `product-images` (for product photos)
   - `product-models` (for 3D model files)
3. Set both to public access
4. Configure CORS if needed

```sql
-- Make storage buckets public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('product-images', 'product-models');
```

## 7. Test Your Setup

After running all the SQL commands:
1. Check that all tables appear in the Table Editor
2. Verify sample products are inserted
3. Test the connection in your app by running `npm run dev`

## 8. Environment Variables

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Real-time Features

The app will use Supabase real-time to:
- Track order status updates live
- Update product availability in real-time
- Show live inventory changes

## Next Steps

1. Run `npm install` to install all dependencies
2. Copy `.env.example` to `.env` and add your Supabase credentials
3. Run the SQL scripts above in Supabase SQL Editor
4. Start the development server with `npm run dev`
