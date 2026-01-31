import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!; // Use Service Role Key for backend

export const supabase = createClient(supabaseUrl, supabaseKey);
