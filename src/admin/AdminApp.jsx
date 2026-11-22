import { useState, useEffect } from 'react';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { createClient } from '@supabase/supabase-js';

// Use a SEPARATE auth client with the ANON key (supports sessions)
// but adminSupabase uses service key for data operations
const authClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'dmillion-admin-auth', // separate storage from main site
    }
  }
);

// List of allowed admin Google emails
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'dmillion2027@gmail.com')
  .split(',')
  .map(e => e.trim());

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check existing session on page load/refresh
    authClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (ADMIN_EMAILS.includes(session.user.email)) {
          setUser(session.user);
          setAccessDenied(false);
        } else {
          setAccessDenied(true);
          authClient.auth.signOut();
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (ADMIN_EMAILS.includes(session.user.email)) {
          setUser(session.user);
          setAccessDenied(false);
        } else {
          setUser(null);
          setAccessDenied(true);
          authClient.auth.signOut();
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authClient.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin accessDenied={accessDenied} authClient={authClient} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}
