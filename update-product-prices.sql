-- Update all product prices to $1.00 USD for testing
UPDATE products SET price = 1.00 WHERE price < 0.50;

-- Or if you want realistic luxury pricing, uncomment one of the following:

-- Option 1: Realistic luxury handbag pricing
-- UPDATE products SET price = 2499.99 WHERE name ILIKE '%classic%';
-- UPDATE products SET price = 2899.99 WHERE name ILIKE '%tote%' OR name ILIKE '%signature%';
-- UPDATE products SET price = 2699.99 WHERE name ILIKE '%shoulder%' OR name ILIKE '%chic%';

-- Option 2: Check current prices
-- SELECT id, name, price FROM products;
