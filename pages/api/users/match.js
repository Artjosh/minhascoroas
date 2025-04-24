import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não é permitido`);
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }
  
  try {
    const supabase = supabaseAdmin();
    
    // Buscar usuário atual
    const { data: currentUser, error: currentUserError } = await supabase
      .from('usuarios')
      .select('idmatch')
      .eq('id', userId)
      .single();
      
    if (currentUserError) {
      if (currentUserError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      throw currentUserError;
    }
    
    const userMatches = currentUser.idmatch || [];
    if (userMatches.length === 0) {
      return res.status(200).json({ mutualMatches: [] });
    }
    
    // Buscar todos os usuários que o usuário atual deu match
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('usuarios')
      .select('id, nome, foto, email, idmatch')
      .in('id', userMatches);
      
    if (matchesError) throw matchesError;
    
    // Filtrar para identificar matches mútuos
    const mutualMatches = potentialMatches.filter(match => 
      match.idmatch && match.idmatch.includes(userId)
    ).map(match => ({
      id: match.id,
      nome: match.nome,
      foto: match.foto,
      email: match.email
    }));
    
    res.status(200).json({ mutualMatches });
  } catch (error) {
    console.error('Erro ao verificar matches mútuos:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar matches mútuos', 
      details: error.message 
    });
  }
} 