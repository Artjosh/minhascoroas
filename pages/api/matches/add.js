import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  // Verificar se o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    // Extrair dados do corpo da requisição
    const { userId, matchId } = req.body;
    
    // Validar dados
    if (!userId || !matchId) {
      return res.status(400).json({ error: 'Dados incompletos. userId e matchId são obrigatórios.' });
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
    
    // Verificar se o usuário já tem o matchId
    const currentMatches = userData.idmatch || [];
    
    // Se o matchId já existe no array, não precisamos fazer nada
    if (currentMatches.includes(matchId)) {
      return res.status(200).json({ message: 'Match já existente', matches: currentMatches });
    }
    
    // Adicionar o novo matchId ao array
    const newMatches = [...currentMatches, matchId];
    
    // Atualizar o registro do usuário
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update({ idmatch: newMatches })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Erro ao atualizar matches:', error);
      return res.status(500).json({ error: 'Erro ao atualizar matches' });
    }
    
    return res.status(200).json({ 
      message: 'Match adicionado com sucesso',
      matches: newMatches
    });
    
  } catch (error) {
    console.error('Erro ao processar match:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 