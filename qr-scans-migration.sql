-- Create QR code scans tracking table
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100)
);

-- Enable Row Level Security
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Create policies (public can insert scans, admin can view all)
CREATE POLICY "Anyone can log QR scans" ON qr_scans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view scan count" ON qr_scans
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_scans_product_id ON qr_scans(product_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at DESC);

-- Add scan_count to products table (cached count for performance)
ALTER TABLE products ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;

-- Create function to increment scan count
CREATE OR REPLACE FUNCTION increment_product_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET scan_count = scan_count + 1 
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment scan count
DROP TRIGGER IF EXISTS update_scan_count ON qr_scans;
CREATE TRIGGER update_scan_count
  AFTER INSERT ON qr_scans
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_scan_count();
