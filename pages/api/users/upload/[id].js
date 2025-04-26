import { supabaseAdmin } from '../../../../lib/supabase-admin';
import multer from 'multer';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

// Configurar multer para processamento de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  },
});

// Middleware para processar erros do multer
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Limite de 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
};

// Criar handler com next-connect
const handler = nextConnect({
  onError: errorHandler,
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
});

// Adicionar middleware multer para processar o upload
handler.use(upload.single('foto'));

// Rota POST para upload de foto
handler.post(async (req, res) => {
  try {
    const { id } = req.query;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Buscar usuário para verificar se existe
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('email, fotos')
      .eq('id', id)
      .single();
      
    if (userError) {
      console.error('Erro ao verificar usuário:', userError);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Criar nome de arquivo baseado no email
    // Substituir "_dot_" por "." no email para deixar mais limpo
    const email = usuario.email;
    const uniqueId = Math.floor(Math.random() * 1000); // Número único para evitar conflitos
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${email}_${uniqueId}.${fileExtension}`;
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('perfil-fotos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });
      
    if (error) {
      console.error('Erro ao fazer upload:', error);
      return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
    }
    
    // Gerar URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('perfil-fotos')
      .getPublicUrl(fileName);
    
    // Atualizar o campo fotos do usuário no banco de dados
    let fotosAtualizadas = usuario.fotos || [];
    fotosAtualizadas = [...fotosAtualizadas, urlData.publicUrl];
    
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ fotos: fotosAtualizadas })
      .eq('id', id);
    
    if (updateError) {
      console.error('Erro ao atualizar fotos do usuário:', updateError);
    }
      
    return res.status(200).json({ 
      success: true, 
      url: urlData.publicUrl,
      updateLocalStorage: true
    });
    
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Desativar o bodyParser para permitir que o multer processe o formulário
export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler; 