import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
}

// Create Supabase client with persistent session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'softspace-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to sync token to localStorage for API calls
const syncToken = (session: any) => {
  if (session?.access_token) {
    localStorage.setItem('supabase_token', session.access_token);
  } else {
    localStorage.removeItem('supabase_token');
  }
};

// Initialize: sync token on load and listen for auth changes
supabase.auth.getSession().then(({ data: { session } }) => {
  syncToken(session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  syncToken(session);
});

// Auth helpers
export const authHelpers = {
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    
    // Store token
    syncToken(data.session);
    
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Store token
    syncToken(data.session);
    
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('softspace_current_session_id');
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    syncToken(session);
    return session;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Refresh the session token
  refreshSession: async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    syncToken(session);
    return session;
  },
};
