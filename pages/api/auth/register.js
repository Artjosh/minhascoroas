import { supabaseAdmin } from '../../../lib/supabase-admin';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { createEdgeRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

// Configuração do multer para upload de arquivos - não será usado diretamente como middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Configurar router com createEdgeRouter
const router = createEdgeRouter({
  onError: (err, req, res) => {
    console.error('Erro na API:', err.stack);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
  legacyFetch: true  // Adicionar esta opção para compatibilidade
});

// Rota POST para registro
router.post(async (req, res) => {
  try {
    // Processar o FormData recebido
    const formData = await req.formData();
    const email = formData.get('email');
    const senha = formData.get('senha');
    const nome = formData.get('nome');
    
    // Processar arquivo de foto, se houver
    const fotoFile = formData.get('foto');
    
    // Validar entrada
    if (!email || !senha || !nome) {
      return res.status(400).json({ 
        error: 'Dados incompletos', 
        details: 'Email, senha e nome são obrigatórios' 
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
    
    // Criar novo usuário
    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert([
        { 
          email, 
          senha: senhaHash,
          nome,
          venda1: false,
          venda2: false,
          idmatch: [],
          created_at: new Date()
        }
      ])
      .select();
      
    if (error) throw error;
    
    const userId = newUser[0].id;
    
    // Upload da foto se fornecida
    let fotoUrl = null;
    if (fotoFile && fotoFile instanceof File) {
      // Gerar nome de arquivo baseado no email
      const fileExt = fotoFile.name.split('.').pop();
      const emailBase = email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
      const fileName = `${emailBase}_1.${fileExt}`;
      
      // Converter o File para ArrayBuffer e depois para Buffer
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload para o bucket do Supabase
      const { data: fileData, error: uploadError } = await supabaseAdmin
        .storage
        .from('perfil-fotos')
        .upload(fileName, buffer, {
          contentType: fotoFile.type,
          upsert: true
        });
        
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
      } else {
        // Obter URL pública
        const { data } = supabaseAdmin
          .storage
          .from('perfil-fotos')
          .getPublicUrl(fileName);
          
        fotoUrl = data.publicUrl;
        
        // Atualizar usuário com URL da foto
        await supabaseAdmin
          .from('usuarios')
          .update({ foto: fotoUrl })
          .eq('id', userId);
      }
    }
    
    // Retornar usuário criado (sem a senha)
    const createdUser = newUser[0];
    delete createdUser.senha;
    
    if (fotoUrl) {
      createdUser.foto = fotoUrl;
    }
    
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao registrar usuário', 
      details: error.message 
    });
  }
});

export default router.handler();

// Configurar para permitir upload de arquivo
export const config = {
  api: {
    bodyParser: false,
  },
}; 