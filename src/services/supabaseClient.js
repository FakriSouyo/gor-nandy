import { createClient } from '@supabase/supabase-js';

// Mengambil variabel lingkungan dari proses
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Membuat klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
