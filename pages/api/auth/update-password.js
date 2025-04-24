import { supabaseAdmin } from '../../../lib/supabase';
import bcrypt from 'bcrypt';
import { createEdgeRouter } from 'next-connect';

// Configurar router com createEdgeRouter
const router = createEdgeRouter({
  onError: (err, req, res) => {
    console.error('Erro na API:', err.stack);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  },
  onNoMatch: (req, res) => {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
  legacyFetch: true  // Adicionar esta opção para compatibilidade
});

// Rota POST para atualizar senha
router.post(async (req, res) => {
  try {
    // Determinar se a requisição é JSON ou FormData
    let token, novaSenha;
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // Tratar como JSON
      const body = await req.json();
      token = body.token;
      novaSenha = body.novaSenha;
    } else if (contentType.includes('multipart/form-data')) {
      // Tratar como FormData
      const formData = await req.formData();
      token = formData.get('token');
      novaSenha = formData.get('novaSenha');
    } else {
      // Formato não suportado
      return res.status(415).json({ 
        error: 'Formato de conteúdo não suportado', 
        details: 'Apenas application/json e multipart/form-data são suportados'
      });
    }

    if (!token || !novaSenha) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    // Validar tamanho da senha
    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const supabase = supabaseAdmin();

    // Buscar o usuário pelo token de redefinição
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Verificar se o token expirou
    const tokenExpires = new Date(user.reset_token_expires);
    if (Date.now() > tokenExpires.getTime()) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);

    // Atualizar a senha do usuário e limpar o token de reset
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        senha: senhaHash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar senha', 
      details: error.message 
    });
  }
});

export default router.handler();

// Configurar para permitir receber qualquer tipo de corpo de requisição
export const config = {
  api: {
    bodyParser: false,
  },
}; 