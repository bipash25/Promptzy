import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and React Native (process.env)
const getEnvVar = (viteKey, reactNativeKeys) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env) {
    for (const key of reactNativeKeys) {
      if (process.env[key]) return process.env[key];
    }
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', ['REACT_APP_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_URL']);
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', ['REACT_APP_SUPABASE_ANON_KEY', 'EXPO_PUBLIC_SUPABASE_ANON_KEY']);

// Only log in development mode
const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
              (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

if (isDev) {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✓ Set' : '✗ Missing',
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing',
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables. Please check your .env file.');
  if (isDev) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('  Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  throw error;
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