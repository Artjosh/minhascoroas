import { supabaseAdmin } from '../../../lib/supabase-admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Verificar se o método é POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} não é permitido`);
  }
  
  try {
    const { email, senha } = req.body;
    
    // Validar entrada
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo email
    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Criar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        venda1: usuario.venda1,
        venda2: usuario.venda2
      },
      process.env.JWT_SECRET || 'segredo-padrao',
      { expiresIn: '7d' }
    );
    
    // Remover senha do objeto usuário antes de enviar
    delete usuario.senha;
    
    // Retornar usuário e token
    res.status(200).json({
      usuario,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
  }
} 