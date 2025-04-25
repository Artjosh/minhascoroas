/**
 * Utilitários para gerenciar matches e sincronização entre componentes
 */

import { perfis } from '../data/mock';
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
    console.log("Match IDs vazios ou inválidos");
    return [];
  }
  
  console.log("Processando match IDs:", matchIds);
  console.log("Perfis disponíveis:", mockData.perfis.length);
  
  // Usar os dados mockados de perfis
  const perfilMatches = matchIds
    .map(id => {
      const parsedId = parseInt(id);
      return mockData.perfis.find(p => p.id === parsedId);
    })
    .filter(Boolean);
  
  console.log("Perfis de match encontrados:", perfilMatches.length);
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
    
    // Se for um novo match, notificar outras abas/componentes
    if (result.isNewMatch) {
      // Buscar o perfil completo nos dados mockados
      const matchPerfil = perfis.find(p => p.id === parseInt(matchId));
      
      if (matchPerfil) {
        // Salvar no localStorage para ser processado
        saveCurrentMatch(matchPerfil);
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
    console.log(`Buscando matches para usuário ${userId}`);
    
    // Verificar se há matches no localStorage
    const matchesKey = `matches_${userId}`;
    const savedMatches = localStorage.getItem(matchesKey);
    
    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches);
      console.log("Matches encontrados no localStorage:", parsedMatches);
      return parsedMatches;
    }
    
    // Se não houver matches salvos, gerar alguns aleatórios iniciais
    const randomMatches = generateRandomMatches();
    localStorage.setItem(matchesKey, JSON.stringify(randomMatches));
    console.log("Matches iniciais gerados:", randomMatches);
    
    return randomMatches;
  } catch (error) {
    console.error("Erro ao buscar matches:", error);
    return [];
  }
};

// Função auxiliar para gerar IDs de match aleatórios iniciais
function generateRandomMatches() {
  // Gerar 2-4 matches aleatórios
  const numMatches = Math.floor(Math.random() * 3) + 2;
  const totalPerfis = mockData.perfis.length;
  const matches = [];
  
  for (let i = 0; i < numMatches; i++) {
    // Garantir que não haja duplicatas
    let randomId;
    do {
      randomId = Math.floor(Math.random() * totalPerfis) + 1;
    } while (matches.includes(randomId));
    
    matches.push(randomId);
  }
  
  return matches;
}

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
    const perfil = matchProfile || mockData.encontrarPerfilPorId(matchId);
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