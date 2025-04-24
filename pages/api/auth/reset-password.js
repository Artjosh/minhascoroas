import { supabaseAdmin } from '../../../lib/supabase';
import { createEdgeRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// Rota POST para solicitação de redefinição de senha
router.post(async (req, res) => {
  try {
    // Determinar se a requisição é JSON ou FormData
    let email;
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // Tratar como JSON
      const body = await req.json();
      email = body.email;
    } else if (contentType.includes('multipart/form-data')) {
      // Tratar como FormData
      const formData = await req.formData();
      email = formData.get('email');
    } else {
      // Formato não suportado
      return res.status(415).json({ 
        error: 'Formato de conteúdo não suportado', 
        details: 'Apenas application/json e multipart/form-data são suportados'
      });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const supabase = supabaseAdmin();

    // Verificar se o email existe no sistema
    const { data: user } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return res.status(200).json({ 
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' 
      });
    }

    // Gerar um token único para redefinição de senha
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora
    
    // Salvar o token de reset no banco de dados
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Erro ao salvar token de reset:', updateError);
      throw updateError;
    }

    // Construir o link de redefinição de senha
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://5.78.42.115:3000'}/redefinir-senha?token=${resetToken}`;

    // Aqui seria o código para enviar o email com o link de redefinição
    // Como ainda não temos o serviço de email configurado, apenas logamos o link
    console.log(`Link de redefinição para ${email}: ${resetLink}`);
    
    // Se tivesse integração com serviço de email:
    // await sendEmail(email, 'Redefinição de Senha - Minha Coroa', 
    //   `Para redefinir sua senha, clique no link: ${resetLink}. Este link é válido por 1 hora.`);

    // Retornar resposta de sucesso
    res.status(200).json({ 
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha',
      // Para fins de desenvolvimento, retornamos o link também
      // Em produção, remover isso
      debug: {
        resetLink,
        note: 'Esta informação é apenas para desenvolvimento e deve ser removida em produção'
      }
    });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ 
      error: 'Erro ao processar sua solicitação', 
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