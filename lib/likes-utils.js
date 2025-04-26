/**
 * Utilitários para gerenciar likes e sincronização entre componentes
 */

// Chave única para armazenamento no localStorage
const USER_KEY = 'user'; // Chave para armazenamento do usuário

/**
 * Adiciona um like a um perfil no localStorage
 * @param {string} userId - ID do usuário logado
 * @param {string|number} perfilId - ID do perfil que recebeu o like
 * @param {Object} perfilData - Dados adicionais do perfil (opcional)
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const adicionarLike = (userId, perfilId, perfilData = null) => {
  if (!userId || !perfilId) return false;
  
  try {
    // Recupera os dados do usuário
    const userData = obterDadosUsuario();
    if (!userData) return false;
    
    // Inicializa ou obtém a lista de likes
    const likes = userData.likes || [];
    
    // Verifica se este perfil já recebeu like para evitar duplicação
    if (!likes.some(like => like.perfilId === perfilId)) {
      // Adiciona o novo like com timestamp
      const novoLike = {
        perfilId,
        timestamp: Date.now(),
        ...(perfilData && { dados: perfilData })
      };
      
      // Adiciona ao array de likes
      const novosLikes = [...likes, novoLike];
      
      // Atualiza os dados do usuário
      const dadosAtualizados = {
        ...userData,
        likes: novosLikes
      };
      
      // Salva no localStorage
      return salvarDadosUsuario(dadosAtualizados);
    }
    
    return true; // Já existe, mas consideramos sucesso
  } catch (error) {
    console.error('Erro ao adicionar like:', error);
    return false;
  }
};

/**
 * Verifica se um perfil específico já recebeu like do usuário
 * @param {string} userId - ID do usuário logado
 * @param {string|number} perfilId - ID do perfil a verificar
 * @returns {boolean} - true se o perfil já recebeu like
 */
export const verificarLike = (userId, perfilId) => {
  if (!userId || !perfilId) return false;
  
  try {
    const userData = obterDadosUsuario();
    if (!userData || !userData.likes) return false;
    
    return userData.likes.some(like => like.perfilId === perfilId);
  } catch (error) {
    console.error('Erro ao verificar like:', error);
    return false;
  }
};

/**
 * Remove um like dado a um perfil
 * @param {string} userId - ID do usuário logado
 * @param {string|number} perfilId - ID do perfil que terá o like removido
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const removerLike = (userId, perfilId) => {
  if (!userId || !perfilId) return false;
  
  try {
    // Recupera os dados do usuário
    const userData = obterDadosUsuario();
    if (!userData || !userData.likes) return false;
    
    // Filtra para remover o like específico
    const novosLikes = userData.likes.filter(like => like.perfilId !== perfilId);
    
    // Se a quantidade mudou, salvamos a nova lista
    if (novosLikes.length !== userData.likes.length) {
      const dadosAtualizados = {
        ...userData,
        likes: novosLikes
      };
      
      return salvarDadosUsuario(dadosAtualizados);
    }
    
    return true; // Não existia, mas consideramos sucesso
  } catch (error) {
    console.error('Erro ao remover like:', error);
    return false;
  }
};

/**
 * Obtém todos os likes dados pelo usuário
 * @param {string} userId - ID do usuário logado
 * @returns {Array} - Array com os likes dados pelo usuário
 */
export const obterLikesUsuario = (userId) => {
  if (!userId || typeof window === 'undefined') return [];
  
  try {
    const userData = obterDadosUsuario();
    return userData && userData.likes ? userData.likes : [];
  } catch (error) {
    console.error('Erro ao recuperar likes do usuário:', error);
    return [];
  }
};

/**
 * Obtém os dados do usuário do localStorage
 * @returns {Object|null} - Dados do usuário ou null se não existir
 */
export const obterDadosUsuario = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

/**
 * Salva os dados do usuário no localStorage
 * @param {Object} userData - Dados do usuário
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const salvarDadosUsuario = (userData) => {
  if (!userData || typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    return false;
  }
};

/**
 * Limpa todos os likes dados pelo usuário
 * @param {string} userId - ID do usuário logado
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const limparLikesUsuario = (userId) => {
  if (!userId || typeof window === 'undefined') return false;
  
  try {
    const userData = obterDadosUsuario();
    if (!userData) return false;
    
    const dadosAtualizados = {
      ...userData,
      likes: []
    };
    
    return salvarDadosUsuario(dadosAtualizados);
  } catch (error) {
    console.error('Erro ao limpar likes do usuário:', error);
    return false;
  }
};

/**
 * Obtém o total de likes dados pelo usuário
 * @param {string} userId - ID do usuário logado
 * @returns {number} - Quantidade de likes
 */
export const obterTotalLikes = (userId) => {
  const likes = obterLikesUsuario(userId);
  return Array.isArray(likes) ? likes.length : 0;
};

/**
 * Verifica se um perfil pode receber like (não recebeu anteriormente)
 * @param {string} userId - ID do usuário logado
 * @param {Array} perfis - Lista de perfis a verificar
 * @returns {Array} - Lista de perfis que podem receber like
 */
export const filtrarPerfisNaoLikados = (userId, perfis) => {
  if (!Array.isArray(perfis)) return [];
  
  const userData = obterDadosUsuario();
  if (!userData || !userData.likes) return perfis;
  
  const idsLikados = userData.likes.map(like => like.perfilId);
  
  return perfis.filter(perfil => !idsLikados.includes(perfil.id));
};

/**
 * Adiciona notificações para um usuário no localStorage
 * @param {Object} notificacao - Objeto com dados da notificação
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const adicionarNotificacao = (notificacao) => {
  if (!notificacao || typeof window === 'undefined') return false;
  
  try {
    // Obter dados do usuário
    const userData = obterDadosUsuario();
    if (!userData) return false;
    
    // Adicionar ou inicializar array de notificações
    const notificacoes = userData.notificacoes || [];
    
    // Adicionar nova notificação com timestamp
    const novaNotificacao = {
      ...notificacao,
      id: Date.now(), // ID único baseado no timestamp
      lida: false,
      timestamp: Date.now()
    };
    
    // Adicionar ao início do array (mais recente primeiro)
    notificacoes.unshift(novaNotificacao);
    
    // Limitar a 50 notificações para não sobrecarregar o localStorage
    const notificacoesLimitadas = notificacoes.slice(0, 50);
    
    // Atualizar o objeto do usuário mantendo todos os outros dados
    const novosDados = {
      ...userData,
      notificacoes: notificacoesLimitadas
    };
    
    // Salvar no localStorage
    return salvarDadosUsuario(novosDados);
  } catch (error) {
    console.error('Erro ao adicionar notificação:', error);
    return false;
  }
};

/**
 * Marca uma notificação como lida
 * @param {string|number} notificacaoId - ID da notificação
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const marcarNotificacaoComoLida = (notificacaoId) => {
  if (!notificacaoId || typeof window === 'undefined') return false;
  
  try {
    // Obter dados do usuário
    const userData = obterDadosUsuario();
    if (!userData || !userData.notificacoes) return false;
    
    // Atualizar o status da notificação
    const notificacoesAtualizadas = userData.notificacoes.map(notif => 
      notif.id === notificacaoId ? { ...notif, lida: true } : notif
    );
    
    // Atualizar o objeto do usuário
    const novosDados = {
      ...userData,
      notificacoes: notificacoesAtualizadas
    };
    
    // Salvar no localStorage
    return salvarDadosUsuario(novosDados);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return false;
  }
};

/**
 * Obtém todas as notificações do usuário
 * @param {boolean} apenasNaoLidas - Se true, retorna apenas notificações não lidas
 * @returns {Array} - Array com as notificações
 */
export const obterNotificacoes = (apenasNaoLidas = false) => {
  try {
    // Obter dados do usuário
    const userData = obterDadosUsuario();
    if (!userData || !userData.notificacoes) return [];
    
    // Filtrar se necessário
    return apenasNaoLidas
      ? userData.notificacoes.filter(notif => !notif.lida)
      : userData.notificacoes;
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    return [];
  }
};

/**
 * Limpa todas as notificações do usuário
 * @returns {boolean} - true se a operação foi bem-sucedida
 */
export const limparNotificacoes = () => {
  try {
    // Obter dados do usuário
    const userData = obterDadosUsuario();
    if (!userData) return false;
    
    // Atualizar o objeto do usuário
    const novosDados = {
      ...userData,
      notificacoes: []
    };
    
    // Salvar no localStorage
    return salvarDadosUsuario(novosDados);
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
    return false;
  }
}; 