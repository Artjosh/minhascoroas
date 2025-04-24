import { supabaseAdmin } from '../../../lib/supabase-admin';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  // Rota baseada no método HTTP
  switch (req.method) {
    case 'GET':
      try {
        // Listar usuários (com limitação de informações por segurança)
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .select('id, email, venda1, venda2')
          .order('id', { ascending: false });
          
        if (error) throw error;
        
        res.status(200).json(data);
      } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
      }
      break;
      
    case 'POST':
      try {
        const { email, senha } = req.body;
        
        // Validar entrada
        if (!email || !senha) {
          return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        // Verificar se o email já existe
        const { data: existingUser } = await supabaseAdmin
          .from('usuarios')
          .select('id')
          .eq('email', email)
          .single();
          
        if (existingUser) {
          return res.status(409).json({ error: 'Este email já está registrado' });
        }
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        // Criar novo usuário
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .insert([
            { 
              email, 
              senha: senhaHash, 
              venda1: false, 
              venda2: false,
              idmatch: []
            }
          ])
          .select();
          
        if (error) throw error;
        
        // Retornar usuário criado (sem a senha)
        const createdUser = data[0];
        delete createdUser.senha;
        
        res.status(201).json(createdUser);
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Método ${req.method} não é permitido`);
  }
} 