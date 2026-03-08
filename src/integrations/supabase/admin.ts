// Admin client for privileged operations (user creation)
// WARNING: This should only be used in secure contexts
// For production, move this to an Edge Function or backend API
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Only create admin client if service role key is available
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
