import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// Token expiration time in seconds (24 hours)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const expiryTimerRef = useRef(null);

  // Set up token expiration timer
  const setTokenExpiration = (session) => {
    if (!session) {
      // Clear any existing timer when session ends
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
      setSessionExpiry(null);
      return;
    }

    // Get the actual token expiry from Supabase session (in seconds since epoch)
    // Add a buffer to ensure we expire before Supabase does
    const tokenExpiresAt = session.expires_at;
    
    if (tokenExpiresAt) {
      const expiryTime = tokenExpiresAt * 1000; // Convert to milliseconds
      setSessionExpiry(expiryTime);

      // Clear existing timer
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }

      // Calculate time until expiry
      const now = new Date().getTime();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry > 0) {
        // Set timer to log out user when token expires
        expiryTimerRef.current = setTimeout(() => {
          console.log('Session expired, logging out user');
          supabase.auth.signOut();
          setUser(null);
          localStorage.removeItem('dmillion_cart');
          window.dispatchEvent(new Event('session-expired'));
        }, timeUntilExpiry);
      } else {
        // Token already expired, sign out immediately
        supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('dmillion_cart');
        window.dispatchEvent(new Event('session-expired'));
      }
    } else {
      // No expiry info available, set default 24 hour expiry
      const expiryTime = new Date().getTime() + TOKEN_EXPIRATION_TIME * 1000;
      setSessionExpiry(expiryTime);

      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }

      expiryTimerRef.current = setTimeout(() => {
        console.log('Session expired, logging out user');
        supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('dmillion_cart');
        window.dispatchEvent(new Event('session-expired'));
      }, TOKEN_EXPIRATION_TIME * 1000);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setTokenExpiration(session);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setTokenExpiration(session);
      
      // Clear cart from localStorage when user signs out
      if (!session) {
        localStorage.removeItem('dmillion_cart');
      }
    });

    return () => {
      subscription.unsubscribe();
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Clear localStorage cart immediately
      localStorage.removeItem('dmillion_cart');
      // Force a page-level cart reset by dispatching a custom event
      window.dispatchEvent(new Event('cart-clear'));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Always redirect to custom domain
      const redirectUrl = 'https://dmillionluxury.ca/dashboard';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    sessionExpiry,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
