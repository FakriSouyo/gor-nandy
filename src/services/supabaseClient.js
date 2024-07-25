import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamcsurfqoltdvnnrckf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbWNzdXJmcW9sdGR2bm5yY2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0MTA5NjgsImV4cCI6MjAzNjk4Njk2OH0.D10X92_9eij4jMxmUGODKEjflGsjZ2DsyINI1-QYvA4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);