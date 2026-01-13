

const SUPABASE_URL = 'https://rebompofijapbeohnfgd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_b63PtZkkpUoL1nkqtIO4zg_r5y7EnUM';

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);