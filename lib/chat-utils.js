/**
 * Utilitários para gerenciar conversas e mensagens
 */

import mockData from '../data/mock';
import { 
  obterProximaEtapa, 
  fluxosConversa, 
  getEstadoInicialConversa,
  salvarConversaLocal,
  obterConversaLocal
} from '../data/conversas';

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
    const key = `conversa_${userId}_${matchId}`;
    const data = localStorage.getItem(key);
    const conversa = data ? JSON.parse(data) : null;
    
    return conversa;
  } catch (error) {
    console.error('[chat-utils] Erro ao obter conversa:', error);
    return null;
  }
};

/**
 * Inicializa uma nova conversa
 */
export const inicializarConversa = (perfil) => {
  if (!perfil || !perfil.id) {
    console.error('Perfil inválido para inicializar conversa');
    return {
      mensagens: [],
      ultimaMensagem: "",
      horaUltimaMensagem: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      etapaAtual: 1 // Começar na etapa 1, não na etapa 0
    };
  }
  
  // Verificar se existe um fluxo para este perfil
  const fluxo = fluxosConversa[perfil.id];
  
  if (!fluxo) {
    console.warn(`Não foi encontrado fluxo de conversa para o perfil ${perfil.id}`);
    
    // Criar uma conversa básica se não houver fluxo definido
    const agora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return {
      mensagens: [
        {
          id: generateId(),
          tipo: 'texto',
          texto: `Olá! Que bom te conhecer!`,
          enviada: false,
          hora: agora
        }
      ],
      ultimaMensagem: "Olá! Que bom te conhecer!",
      horaUltimaMensagem: agora,
      etapaAtual: 1, // Garantir que comece na etapa 1
      perfilId: perfil.id
    };
  }
  
  // Usar a primeira etapa do fluxo
  const primeiraEtapa = fluxo.etapas[0];
  const mensagensIniciais = primeiraEtapa ? primeiraEtapa.mensagens : [];
  
  // Garantir que todas as mensagens tenham IDs e horas
  const agora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const mensagensFormatadas = mensagensIniciais.map(msg => ({
    ...msg,
    id: msg.id || generateId(),
    hora: msg.hora || agora,
    enviada: false
  }));
  
  const ultimaMensagem = mensagensFormatadas.length > 0 ? 
    mensagensFormatadas[mensagensFormatadas.length - 1].texto : 
    "Olá! Que bom te conhecer!";
  
  return {
    mensagens: mensagensFormatadas,
    ultimaMensagem,
    horaUltimaMensagem: agora,
    etapaAtual: 1, // Garantir que comece na etapa 1
    perfilId: perfil.id
  };
};

/**
 * Salva o estado de uma conversa
 */
export const salvarConversa = (userId, matchId, conversa) => {
  
  
  try {
    const key = `conversa_${userId}_${matchId}`;
    localStorage.setItem(key, JSON.stringify(conversa));
    
    return true;
  } catch (error) {
    console.error('[chat-utils] Erro ao salvar conversa:', error);
    return false;
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
    conversa = getEstadoInicialConversa(matchId);
  }

  const novaMensagem = {
    id: generateId(),
    tipo: 'texto',
    texto,
    enviada: true,
    hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  };

  // Adicionar a nova mensagem do usuário
  const mensagensAtualizadas = [...(conversa.mensagens || []), novaMensagem];
  
  // Atualizar dados da conversa com a mensagem do usuário
  conversa = {
    ...conversa,
    mensagens: mensagensAtualizadas,
    ultimaMensagem: texto,
    horaUltimaMensagem: novaMensagem.hora
  };
  
  // Garantir que a etapaAtual existe e é pelo menos 1
  if (!conversa.hasOwnProperty('etapaAtual') || conversa.etapaAtual < 1) {
    conversa.etapaAtual = 1;
  }
  
  // Salvar a conversa temporariamente
  salvarConversaLocal(email, matchId, conversa);
  
  // Avançar para próxima etapa
  const etapaAtual = conversa.etapaAtual || 1; // Garantir que nunca seja 0
  const proximaEtapa = obterProximaEtapa(matchId, etapaAtual);
  
  if (proximaEtapa) {
    // Adicionar as mensagens da próxima etapa
    setTimeout(() => {
      const agora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const mensagensProximaEtapa = proximaEtapa.mensagens.map(msg => ({
        ...msg,
        id: msg.id || generateId(),
        hora: msg.hora || agora,
        enviada: false
      }));
      
      // Atualizar a conversa com as novas mensagens
      const todasMensagens = [...mensagensAtualizadas, ...mensagensProximaEtapa];
      const ultimaMensagemBot = mensagensProximaEtapa[mensagensProximaEtapa.length - 1].texto;
      
      // Atualizar estado final da conversa
      const conversaFinal = {
        ...conversa,
        mensagens: todasMensagens,
        ultimaMensagem: ultimaMensagemBot,
        horaUltimaMensagem: agora,
        etapaAtual: etapaAtual + 1
      };
      
      // Salvar conversa final
      salvarConversaLocal(email, matchId, conversaFinal);
    }, 1000); // Esperar 1 segundo antes de mostrar a resposta
  }

  return novaMensagem;
};

/**
 * Verifica se um usuário está online (simulado)
 */
export const isOnline = (userId) => {
  
  // Simula usuários online/offline baseado no ID
  const onlineIds = [1, 3, 5, 7, 9, 11, 13];
  return onlineIds.includes(parseInt(userId));
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
    
    
    // Inicializar conversa com a primeira etapa do fluxo
    const novaConversa = inicializarConversa(perfil);
    
    // Armazenar no localStorage
    const userId = getUserEmail() || userEmail;
    salvarConversaLocal(userId, perfil.id, novaConversa);
    
    
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
  isOnline,
  adicionarNovoMatch
}; 