import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and React Native (process.env)
const supabaseUrl = typeof import.meta !== 'undefined'
  ? import.meta.env.VITE_SUPABASE_URL
  : (process.env.REACT_APP_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL);

const supabaseAnonKey = typeof import.meta !== 'undefined'
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// Debug logging
console.log('🔧 Supabase Configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
console.log('  Environment:', typeof import.meta !== 'undefined' ? 'Vite' : 'React Native');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('  URL:', supabaseUrl);
  console.error('  Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export default supabase;