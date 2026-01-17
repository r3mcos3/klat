import { createClient } from '@supabase/supabase-js';

const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In mock mode, skip validation - we won't actually use Supabase
if (!isMockMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with placeholder values in mock mode (won't be used)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: !isMockMode, // Disable session persistence in mock mode
      autoRefreshToken: !isMockMode,
    },
  }
);
