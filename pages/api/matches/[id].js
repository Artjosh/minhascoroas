import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  // Obter o ID do match da URL
  const { id: matchId } = req.query;
  const { userId } = req.body;
  
  if (!matchId || !userId) {
    return res.status(400).json({ error: 'IDs do match e do usuário são obrigatórios' });
  }
  
  // Rota baseada no método HTTP
  switch (req.method) {
    case 'DELETE':
      try {
        // Buscar usuário
        const { data: usuario, error: userError } = await supabaseAdmin
          .from('usuarios')
          .select('idmatch')
          .eq('id', userId)
          .single();
          
        if (userError) {
          if (userError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
          throw userError;
        }
        
        // Verificar se o match existe
        const matches = usuario.idmatch || [];
        if (!matches.includes(matchId)) {
          return res.status(404).json({ error: 'Match não encontrado' });
        }
        
        // Remover match
        const updatedMatches = matches.filter(id => id !== matchId);
        
        // Atualizar usuário
        const { error: updateError } = await supabaseAdmin
          .from('usuarios')
          .update({ idmatch: updatedMatches })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        
        res.status(200).json({ matches: updatedMatches });
      } catch (error) {
        console.error('Erro ao remover match:', error);
        res.status(500).json({ error: 'Erro ao remover match', details: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Método ${req.method} não é permitido`);
  }
} 