import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// URL e chave do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'perfil-fotos';

// Inicializar cliente Supabase para o frontend
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Inicializar cliente Supabase com privilégios admin para API routes
export const supabaseAdmin = () => {
  // Na produção, use a chave de serviço
  // Em desenvolvimento, use a chave anon para simplificar
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  
  return createClient(supabaseUrl, supabaseKey);
};

// Funções auxiliares para storage
export const uploadProfileImage = async (file, email) => {
  if (!file) return { error: 'Nenhum arquivo fornecido' };
  
  // Gerar nome de arquivo baseado no email
  const fileExt = file.name.split('.').pop();
  const emailBase = email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
  const fileName = `${emailBase}_1.${fileExt}`;
  
  // Upload do arquivo
  const { data, error } = await supabaseClient
    .storage
    .from(storageBucket)
    .upload(fileName, file, {
      upsert: true,
      cacheControl: '3600'
    });
  
  if (error) return { error };
  
  // Gerar URL pública
  const { data: urlData } = supabaseClient
    .storage
    .from(storageBucket)
    .getPublicUrl(fileName);
  
  return { data: urlData.publicUrl };
};

// Obter URL pública da imagem de perfil
export const getProfileImageUrl = (email) => {
  const emailBase = email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
  return supabaseClient
    .storage
    .from(storageBucket)
    .getPublicUrl(`${emailBase}_1.jpg`).data.publicUrl;
}; 