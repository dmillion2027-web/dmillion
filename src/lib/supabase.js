import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Using mock data.');
  console.warn('To use real data, create a .env file with your Supabase credentials.');
}

// Create a minimal mock client that won't crash if credentials are missing
const mockClient = {
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      }),
      order: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    }),
    insert: () => ({
      select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback) => {
      // Return a mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    signUp: async ({ email, password, options }) => {
      console.log('Mock signUp called with:', email);
      // Simulate successful signup
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            user_metadata: options?.data || {},
          },
          session: null, // Usually null until email is confirmed
        },
        error: null,
      };
    },
    signInWithPassword: async ({ email, password }) => {
      console.log('Mock signIn called with:', email);
      // Simulate successful sign in with session
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: { full_name: 'Mock User' },
      };
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      };
      
      // Trigger the auth state change callback
      setTimeout(() => {
        if (window._authStateChangeCallback) {
          window._authStateChangeCallback('SIGNED_IN', mockSession);
        }
      }, 100);
      
      return {
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      };
    },
    signOut: async () => {
      console.log('Mock signOut called');
      // Trigger the auth state change callback
      setTimeout(() => {
        if (window._authStateChangeCallback) {
          window._authStateChangeCallback('SIGNED_OUT', null);
        }
      }, 100);
      return { error: null };
    },
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {}
};

// Store the callback globally for mock auth
let authCallback = null;

export let supabase = mockClient;

// If credentials are provided, create real client
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co') {
  try {
    supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = mockClient;
  }
} else {
  // Enhance mock to handle auth state callbacks
  const originalOnAuthStateChange = mockClient.auth.onAuthStateChange;
  mockClient.auth.onAuthStateChange = (callback) => {
    window._authStateChangeCallback = callback;
    return originalOnAuthStateChange(callback);
  };
}
