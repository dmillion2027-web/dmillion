import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Admin client uses service key - bypasses RLS for full access
// Singleton pattern to prevent multiple instances
let adminSupabaseInstance = null;

function getAdminSupabase() {
  if (!adminSupabaseInstance) {
    adminSupabaseInstance = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          // Disable HTTP caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    });
  }
  return adminSupabaseInstance;
}

export const adminSupabase = getAdminSupabase();
