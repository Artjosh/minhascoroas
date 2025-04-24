import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    // Extrair userId da query
    const { userId } = req.query;
    
    // Validar dados
    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }
    
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('idmatch')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar o array de matches ou array vazio se não existir
    const matches = userData.idmatch || [];
    
    return res.status(200).json({ 
      matches
    });
    
  } catch (error) {
    console.error('Erro ao buscar matches:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 