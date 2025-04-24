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
    const { email, senha, nome } = req.body;
    
    // Validar entrada
    if (!email || !senha || !nome) {
      return res.status(400).json({ 
        error: 'Dados incompletos. Email, senha e nome são obrigatórios.' 
      });
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
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);
    
    // Verificar os campos disponíveis na tabela antes de inserir
    // Isso evita erros se a migração ainda não foi aplicada
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Erro ao verificar estrutura da tabela:', tableError);
    }
    
    // Criar o objeto de dados para inserção
    const userData = { 
      email, 
      senha: senhaHash,
      nome,
      venda1: false,
      venda2: false,
      idmatch: [],
      created_at: new Date()
    };
    
    // Verificar se os novos campos existem na tabela e adicioná-los se existirem
    const tableFields = tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]) : [];
    
    if (tableFields.includes('bio')) {
      userData.bio = '';
    }
    
    if (tableFields.includes('interesses')) {
      userData.interesses = [];
    }
    
    if (tableFields.includes('fotos')) {
      userData.fotos = [];
    }
    
    // Criar o usuário no banco de dados
    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert([userData])
      .select();
    
    if (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
    
    // Obter o ID do usuário criado
    const userId = newUser[0].id;
    
    // Gerar o token JWT para autenticação
    const token = jwt.sign(
      { 
        id: userId,
        email: email,
        venda1: false,
        venda2: false
      },
      process.env.JWT_SECRET || 'segredo-padrao',
      { expiresIn: '7d' }
    );
    
    // Remover a senha do objeto antes de enviar
    const usuario = newUser[0];
    delete usuario.senha;
    
    // Retornar as informações do usuário e o token
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario,
      token
    });
    
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao registrar usuário',
      details: error.message
    });
  }
} 