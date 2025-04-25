import { supabaseClient } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Apenas permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Obter token de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação ausente ou inválido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'segredo-padrao');
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    const userId = decodedToken.id;
    
    // Verificar se o usuário existe no Supabase
    const { data: user, error } = await supabaseClient
      .from('usuarios')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Usuário existe
    return res.status(200).json({ 
      valid: true,
      userId: user.id
    });
    
  } catch (error) {
    console.error('Erro ao validar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 