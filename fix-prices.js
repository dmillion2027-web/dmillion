// Quick script to update product prices in Supabase
// Run this with: node fix-prices.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zprmnbozhqwsxwypmedv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwcm1uYm96aHF3c3h3eXBtZWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDg0MzU5MywiZXhwIjoyMTEwNDE5NTkzfQ.Ar1FV1HsuTfPNW0Tq8qjdQlwLnxthPyX6j5Qv-s6xWA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixPrices() {
  try {
    console.log('📦 Fetching current products...');
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price')
      .order('id', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    console.log('Current products:');
    products.forEach(p => console.log(`  ID ${p.id}: ${p.name} - $${p.price}`));
    
    // Update all products with price < 0.50 to 1.00
    console.log('\n💰 Updating prices to $1.00...');
    const { error: updateError } = await supabase
      .from('products')
      .update({ price: 1.00 })
      .lt('price', 0.50);
    
    if (updateError) throw updateError;
    
    // Verify update
    const { data: updated, error: verifyError } = await supabase
      .from('products')
      .select('id, name, price')
      .order('id', { ascending: true });
    
    if (verifyError) throw verifyError;
    
    console.log('\nUpdated products:');
    updated.forEach(p => console.log(`  ID ${p.id}: ${p.name} - $${p.price}`));
    
    console.log('\n✅ Prices fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPrices();
