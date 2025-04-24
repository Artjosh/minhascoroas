import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// URL e chave do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente para Supabase não configuradas');
}

// Inicializar cliente Supabase com privilégios admin para API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey); 