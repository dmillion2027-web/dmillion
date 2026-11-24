// Check for products with zero or null prices
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zprmnbozhqwsxwypmedv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwcm1uYm96aHF3c3h3eXBtZWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDg0MzU5MywiZXhwIjoyMTEwNDE5NTkzfQ.Ar1FV1HsuTfPNW0Tq8qjdQlwLnxthPyX6j5Qv-s6xWA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkPrices() {
  try {
    console.log('🔍 Checking all products...\n');
    
    // Get all products with all fields
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    console.log(`Total products: ${products.length}\n`);
    
    products.forEach(p => {
      const price = p.price || 'NULL';
      const status = p.price >= 0.50 ? '✅' : '❌';
      console.log(`${status} ID ${p.id}: ${p.name} - Price: $${price}`);
    });
    
    // Show problematic products
    const problematic = products.filter(p => !p.price || p.price < 0.50);
    if (problematic.length > 0) {
      console.log(`\n⚠️  Problematic products (price < $0.50 or NULL):`);
      problematic.forEach(p => {
        console.log(`  - ID ${p.id}: ${p.name} - $${p.price || 'NULL'}`);
      });
      
      // Fix them
      console.log(`\n🔧 Fixing ${problematic.length} products...\n`);
      for (const p of problematic) {
        await supabase
          .from('products')
          .update({ price: 1.00 })
          .eq('id', p.id);
        console.log(`  ✅ ID ${p.id}: ${p.name} → $1.00`);
      }
    } else {
      console.log('\n✅ All products have valid prices!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPrices();
