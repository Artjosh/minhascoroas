/**
 * Utilitários para gerenciar matches e sincronização entre componentes
 */

import { mulheres } from '../data/mock';
import mockData from '../data/mock';
import { adicionarNovoMatch } from './chat-utils';

/**
 * Salva um match no localStorage para ser processado por outros componentes
 * @param {Object} matchProfile - Objeto com os dados do perfil do match
 * @param {boolean} notifyOtherTabs - Se true, notifica outras abas que um match ocorreu
 */
export function saveCurrentMatch(matchProfile, notifyOtherTabs = true) {
  if (!matchProfile) return;
  
  // Salvar no localStorage
  localStorage.setItem('currentMatch', JSON.stringify(matchProfile));
  
  // Se necessário, disparar evento para outras abas/janelas
  if (notifyOtherTabs) {
    localStorage.setItem('matchUpdate', Date.now().toString());
  }
}

/**
 * Obtém o match atual do localStorage, se existir
 * @returns {Object|null} - Dados do match ou null
 */
export const getCurrentMatch = () => {
  try {
    const match = localStorage.getItem('currentMatch');
    return match ? JSON.parse(match) : null;
  } catch (error) {
    console.error('Erro ao recuperar match atual:', error);
    return null;
  }
};

/**
 * Remove o match atual do localStorage
 */
export const clearCurrentMatch = () => {
  try {
    localStorage.removeItem('currentMatch');
  } catch (error) {
    console.error('Erro ao limpar match atual:', error);
  }
};

/**
 * Processa um array de IDs de match e retorna objetos de perfil completos
 * @param {Array} matchIds - Array de IDs de match
 * @returns {Array} - Array de objetos de perfil
 */
export const processMatchIds = (matchIds) => {
  if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
    
    return [];
  }
  
  
  
  
  // Usar os dados mockados de perfis de mulheres
  const perfilMatches = matchIds
    .map(id => {
      const parsedId = parseInt(id);
      return mulheres.find(p => p.id === parsedId);
    })
    .filter(Boolean);
  
  
  return perfilMatches;
};

/**
 * Obtém informações relevantes de um perfil para exibição no componente de contatos
 * @param {Object} perfil - Objeto completo do perfil
 * @returns {Object} - Objeto com dados simplificados para a interface
 */
export const extractContactInfo = (perfil) => {
  return {
    id: perfil.id,
    nome: perfil.nome,
    imagem: perfil.foto
  };
};

/**
 * Adiciona um match ao Supabase e notifica outros componentes
 * @param {string|number} userId - ID do usuário logado
 * @param {string|number} matchId - ID do perfil que deu match
 * @returns {Promise<Object>} - Resultado da operação
 */
export async function addMatchToDatabase(userId, matchId) {
  try {
    const response = await fetch('/api/matches/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, matchId }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao adicionar match: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Salvar a lista de matches no localStorage
    if (result.localStorageUpdate) {
      const { key, value } = result.localStorageUpdate;
      localStorage.setItem(key, JSON.stringify(value));
      
    }
    
    // Se for um novo match, notificar outras abas/componentes
    if (result.isNewMatch) {
      // Buscar o perfil completo nos dados mockados
      const matchPerfil = mulheres.find(p => p.id === parseInt(matchId));
      
      if (matchPerfil) {
        // Salvar no localStorage para ser processado
        saveCurrentMatch(matchPerfil);
        
        // Inicializar conversa para o novo match
        adicionarNovoMatch(userId, matchPerfil);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao adicionar match:', error);
    throw error;
  }
}

/**
 * Obtém todos os matches de um usuário a partir do Supabase
 * @param {string|number} userId - ID do usuário logado
 * @returns {Promise<Array>} - Array de IDs de match
 */
export const getMatchesFromDatabase = async (userId) => {
  try {
    
    
    // Verificar se há matches no localStorage
    const matchesKey = `matches_${userId}`;
    const savedMatches = localStorage.getItem(matchesKey);
    
    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches);
      
      return parsedMatches;
    }
    
    // Se não houver matches salvos, retornar array vazio
    // Não vamos mais gerar matches aleatórios aqui
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar matches:", error);
    return [];
  }
};

/**
 * Processa um novo match entre dois usuários
 * @param {string|number} userId - ID do usuário principal (deprecado, mantido para compatibilidade)
 * @param {string|number} matchId - ID do perfil que deu match
 * @param {Object} matchProfile - Perfil completo do match (opcional)
 * @returns {boolean} - Sucesso da operação
 */
export const processarNovoMatch = (userId, matchId, matchProfile = null) => {
  if (!matchId) return false;
  
  try {
    // Buscar perfil completo do match se não foi fornecido
    const perfil = matchProfile || mulheres.find(p => p.id === parseInt(matchId));
    if (!perfil) return false;
    
    // Salvar o match atual no localStorage para exibição
    localStorage.setItem('currentMatch', JSON.stringify(perfil));
    
    // Notificar outras abas que um novo match foi processado
    localStorage.setItem('matchUpdate', Date.now().toString());
    
    // Obter o email do usuário logado
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    try {
      const user = JSON.parse(userData);
      if (!user.email) return false;
      
      // Inicializar conversa para este novo match e salvá-la usando o email
      adicionarNovoMatch(user.email, perfil);
      
      return true;
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao processar novo match:', error);
    return false;
  }
}; 