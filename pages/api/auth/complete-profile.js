import { supabaseAdmin } from '../../../lib/supabase-admin';
import multer from 'multer';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  },
});

// Middleware para verificar autenticação
const authMiddleware = (req, res, next) => {
  try {
    // Obter o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo-padrao');
    
    // Adicionar o usuário decodificado ao objeto da requisição
    req.user = decoded;
    
    // Seguir para o próximo middleware ou handler
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Configurar manipulador com next-connect (importado como módulo CommonJS)
const handler = nextConnect({
  onError: (err, req, res) => {
    console.error('Erro na API:', err.stack);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
});

// Aplicar middlewares
handler.use(authMiddleware);
handler.use(upload.array('foto', 3)); // Permitir até 3 fotos

// Rota POST para completar o perfil
handler.post(async (req, res) => {
  try {
    // Obter dados do corpo da requisição
    const { bio, interesses } = req.body;
    const userId = req.user.id; // ID do usuário autenticado
    
    // Validar ID do usuário
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    // Verificar se o usuário existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError || !existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar os campos disponíveis na tabela
    const tableFields = Object.keys(existingUser);
    
    // Processar os interesses
    let interessesArray = [];
    if (interesses) {
      try {
        interessesArray = JSON.parse(interesses);
      } catch (e) {
        console.error('Erro ao processar interesses:', e);
      }
    }
    
    // Atualizar o perfil do usuário com bio e interesses
    const updateData = {};
    
    // Somente adicionar bio se o campo existir
    if (tableFields.includes('bio') && bio !== undefined) {
      updateData.bio = bio || '';
    }
    
    // Somente adicionar interesses se o campo existir
    if (tableFields.includes('interesses')) {
      updateData.interesses = interessesArray;
    }
    
    // Processar fotos se fornecidas e se o campo existir
    const fotoUrls = [];
    const hasFotosField = tableFields.includes('fotos');
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Gerar nome de arquivo baseado no email do usuário e número da foto
        const fileExt = file.originalname.split('.').pop();
        const emailBase = existingUser.email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
        const fileName = `${emailBase}_${i + 1}.${fileExt}`;
        
        // Upload para o bucket do Supabase
        const { data: fileData, error: uploadError } = await supabaseAdmin
          .storage
          .from('perfil-fotos')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
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
            
          fotoUrls.push(data.publicUrl);
        }
      }
      
      // Adicionar URL da foto principal se houver pelo menos uma foto
      if (fotoUrls.length > 0) {
        updateData.foto = fotoUrls[0];
        
        // Adicionar array de fotos se o campo existir
        if (hasFotosField) {
          updateData.fotos = fotoUrls;
        }
      }
    }
    
    // Só prosseguir se houver dados para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
    }
    
    // Atualizar o usuário
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update(updateData)
      .eq('id', userId);
      
    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      throw updateError;
    }
    
    // Obter o usuário atualizado
    const { data: updatedUser, error: getError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (getError) {
      throw getError;
    }
    
    // Remover a senha do objeto antes de enviar
    delete updatedUser.senha;
    
    // Retornar o usuário atualizado
    res.status(200).json({
      message: 'Perfil atualizado com sucesso',
      usuario: updatedUser
    });
    
  } catch (error) {
    console.error('Erro ao completar perfil:', error);
    res.status(500).json({ 
      error: 'Erro ao completar perfil',
      details: error.message
    });
  }
});

export default handler;

// Configurar para permitir upload de arquivo
export const config = {
  api: {
    bodyParser: false,
  },
}; 