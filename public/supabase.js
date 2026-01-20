// supabase.js (ES module)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://rebompofijapbeohnfgd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlYm9tcG9maWphcGJlb2huZmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTU0NjQsImV4cCI6MjA4MzQ3MTQ2NH0.JcFtz6ZSEdpDeYKwC0wOEe0Kzw6rvRfAKl0iGnqdoi0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



/*const SUPABASE_URL = 'https://rebompofijapbeohnfgd.supabase.co';
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
*/