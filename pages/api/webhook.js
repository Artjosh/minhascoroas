import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não é permitido` });
  }

  try {
    // Verificar token de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const kivarnoToken = process.env.KIVARNO;
    
    if (token !== kivarnoToken) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Validar payload da Kirvano
    const webhookData = req.body;
    
    // Verificar se é um evento de venda aprovada
    if (webhookData.event !== 'SALE_APPROVED' || webhookData.status !== 'APPROVED') {
      return res.status(200).json({ 
        success: true, 
        message: 'Evento ignorado - não é uma venda aprovada' 
      });
    }

    // Extrair email do cliente
    const customerEmail = webhookData.customer?.email;
    if (!customerEmail) {
      return res.status(400).json({ error: 'Email do cliente não encontrado no payload' });
    }

    // Log para debug
    console.log('Processando venda aprovada:', {
      checkout_id: webhookData.checkout_id,
      sale_id: webhookData.sale_id,
      customer_email: customerEmail,
      created_at: webhookData.created_at
    });

    // Verificar se o usuário existe e atualizar venda1
    const { data: usuarioExistente, error: erroConsulta } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, venda1')
      .eq('email', customerEmail)
      .single();

    if (erroConsulta || !usuarioExistente) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        details: `Não foi encontrado usuário com o email: ${customerEmail}`
      });
    }

    // Se venda1 já estiver true, retornar sucesso sem atualizar
    if (usuarioExistente.venda1 === true) {
      return res.status(200).json({
        success: true,
        message: 'Usuário já possui venda1 ativada',
        data: {
          user_id: usuarioExistente.id,
          email: usuarioExistente.email,
          sale_id: webhookData.sale_id
        }
      });
    }

    // Atualizar venda1 para true
    const { data: usuarioAtualizado, error: erroAtualizacao } = await supabaseAdmin
      .from('usuarios')
      .update({ 
        venda1: true,
        // Opcionalmente, podemos salvar mais informações da venda
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('email', customerEmail)
      .select();

    if (erroAtualizacao) {
      throw erroAtualizacao;
    }

    // Registrar o webhook (opcional, mas útil para debug)
    await supabaseAdmin
      .from('webhook_logs')
      .insert([{
        tipo: webhookData.event,
        sale_id: webhookData.sale_id,
        checkout_id: webhookData.checkout_id,
        customer_email: customerEmail,
        payload: webhookData,
        processado_em: new Date().toISOString()
      }])
      .select();

    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Venda processada e venda1 atualizada com sucesso',
      data: {
        user_id: usuarioExistente.id,
        email: customerEmail,
        sale_id: webhookData.sale_id,
        checkout_id: webhookData.checkout_id,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({
      error: 'Erro ao processar webhook',
      details: error.message
    });
  }
} 