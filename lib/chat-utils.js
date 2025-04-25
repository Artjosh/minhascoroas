/**
 * Utilitários para gerenciar conversas e mensagens
 */

import mockData from '../data/mock';
import conversas from '../data/conversas';

// Chave para localStorage
const STORAGE_KEY = 'chat_conversas';

// Função para gerar ID único
const generateId = () => Math.floor(Math.random() * 100000000);

// Função para obter o email do usuário do localStorage
const getUserEmail = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).email : null;
  } catch {
    return null;
  }
};

// Função para obter conversas do localStorage
const getStoredConversas = () => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Função para salvar conversas no localStorage
const storeConversas = (conversasData) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversasData));
  } catch (error) {
    console.error('Erro ao salvar conversas:', error);
  }
};

/**
 * Obtém todas as conversas de um usuário
 */
export const getConversas = (userId) => {
  try {
    const conversas = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`chat_${userId}_`)) {
        const matchId = key.split('_')[2];
        conversas[matchId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return conversas;
  } catch (error) {
    console.error('Erro ao recuperar conversas:', error);
    return {};
  }
};

/**
 * Obtém uma conversa específica
 */
export const getConversa = (userId, matchId) => {
  try {
    const key = `chat_${userId}_${matchId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao recuperar conversa:', error);
    return null;
  }
};

/**
 * Inicializa uma nova conversa
 */
export const inicializarConversa = (perfil) => {
  const agora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  return {
    mensagens: [
      {
        id: 1,
        texto: `Olá! Que bom te conhecer!`,
        enviada: false,
        hora: agora
      }
    ],
    ultimaMensagem: "Olá! Que bom te conhecer!",
    horaUltimaMensagem: agora
  };
};

/**
 * Salva o estado de uma conversa
 */
export const salvarConversa = (userId, matchId, mensagens, ultimaMensagem, horaUltimaMensagem) => {
  try {
    const key = `chat_${userId}_${matchId}`;
    const data = {
      mensagens,
      ultimaMensagem,
      horaUltimaMensagem
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
  }
};

/**
 * Adiciona uma mensagem do usuário e avança para próxima etapa
 */
export const enviarMensagem = (userEmail = null, matchId, texto) => {
  if (!matchId || !texto) return null;
  
  const email = userEmail || getUserEmail();
  if (!email) return null;
  
  let conversa = getConversa(email, matchId);
  if (!conversa) {
    conversa = inicializarConversa(email);
  }

  const novaMensagem = {
    id: generateId(),
    tipo: 'texto',
    texto,
    enviada: true,
    hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  };

  const mensagensAtualizadas = [...conversa.mensagens, novaMensagem];
  
  // Avançar para próxima etapa
  const proximaEtapa = conversas.obterProximaEtapa(matchId, conversa.etapaAtual);
  if (proximaEtapa) {
    mensagensAtualizadas.push(...proximaEtapa.mensagens);
    conversa.etapaAtual++;
  }

  conversa.mensagens = mensagensAtualizadas;
  salvarConversa(email, matchId, conversa.mensagens, conversa.ultimaMensagem, conversa.horaUltimaMensagem);

  return novaMensagem;
};

/**
 * Verifica se um usuário está online (simulado)
 */
export const isOnline = (userId) => {
  return Math.random() > 0.5;
};

/**
 * Adiciona um novo match e inicializa uma conversa
 * @param {string} userEmail - Email do usuário
 * @param {Object} perfil - Objeto do perfil que deu match
 */
export const adicionarNovoMatch = (userEmail, perfil) => {
  if (!userEmail || !perfil || !perfil.id) {
    console.error('Dados inválidos para adicionar match');
    return;
  }
  
  try {
    console.log(`Adicionando novo match: ${perfil.nome} (${perfil.id}) para ${userEmail}`);
    
    // Inicializar conversa
    const mensagemInicial = mockData.getMensagemInicial();
    const agora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const novaConversa = {
      mensagens: [
        {
          id: 1,
          texto: mensagemInicial,
          enviada: false,
          hora: agora
        }
      ],
      ultimaMensagem: mensagemInicial,
      horaUltimaMensagem: agora,
      perfilId: perfil.id,
      etapaAtual: 0
    };
    
    // Armazenar no localStorage
    const userId = getUserEmail() || userEmail;
    const key = `chat_${userId}_${perfil.id}`;
    localStorage.setItem(key, JSON.stringify(novaConversa));
    
    console.log(`Conversa inicializada para match ${perfil.id}`);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar novo match:', error);
    return false;
  }
};

export default {
  getConversas,
  getConversa,
  inicializarConversa,
  salvarConversa,
  enviarMensagem,
  isOnline
}; 