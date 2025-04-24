import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Verificar se o ID foi fornecido
  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }
  
  // Rota baseada no método HTTP
  switch (req.method) {
    case 'GET':
      try {
        // Obter dados do usuário
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
          throw error;
        }
        
        // Remover a senha por segurança
        const { senha, ...userWithoutPassword } = data;
        
        res.status(200).json({ data: userWithoutPassword });
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({ error: 'Erro ao obter usuário', details: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const { bio, interesses, foto, fotos } = req.body;
        
        // Validar campos
        const updateData = {};
        
        if (bio !== undefined) {
          updateData.bio = bio;
        }
        
        if (interesses !== undefined) {
          updateData.interesses = interesses;
        }
        
        if (foto !== undefined) {
          updateData.foto = foto;
        }
        
        if (fotos !== undefined) {
          updateData.fotos = fotos;
        }
        
        // Se não há nada para atualizar
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: 'Nenhum dado válido para atualização' });
        }
        
        // Atualizar usuário
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .update(updateData)
          .eq('id', id)
          .select();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
          throw error;
        }
        
        // Remover a senha por segurança
        const { senha, ...userWithoutPassword } = data[0];
        
        res.status(200).json({ data: userWithoutPassword });
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Método ${req.method} não é permitido`);
  }
} 