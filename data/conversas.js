/**
 * Dados mockados de conversas para usuários
 * Este arquivo serve como fonte de dados para mensagens predefinidas entre usuários e seus matches
 */

/**
 * Sistema de fluxo de conversas dinâmicas
 * Cada perfil de mulher tem seus próprios dados de mensagem
 * - contatosBase: fornece a primeira etapa 
 * - audios: fornece a segunda etapa (sempre 2 áudios)
 * - respostasAutomaticas: constituem as próximas etapas (randomizadas)
 */

import { mulheres } from './mock';

// Função auxiliar para gerar ID único
const generateId = () => Math.floor(Math.random() * 100000);

// Estrutura de mensagem de áudio
const criarMensagemAudio = (duracao = "0:30", texto) => ({
  id: generateId(),
  tipo: "audio",
  texto,
  duracao,
  enviada: false
});

// Função para criar etapa de texto
const criarEtapaTexto = (texto) => ({
  mensagens: [
    {
      id: generateId(),
      tipo: "texto",
      texto,
      enviada: false
    }
  ]
});

// Função para criar etapa de áudio
const criarEtapaAudio = (audio1, audio2) => ({
  mensagens: [
    criarMensagemAudio("0:15", audio1),
    criarMensagemAudio("0:45", audio2)
  ]
});

// Função para obter mensagem inicial do perfil (etapa 1)
const obterMensagemInicial = (perfilId) => {
  
  
  // Garantir que o ID é um número
  const perfilIdNumerico = parseInt(perfilId, 10);
  
  
  if (isNaN(perfilIdNumerico)) {
    
    return null;
  }
  
  const perfil = mulheres.find(m => m.id === perfilIdNumerico);
  
  
  if (!perfil || !perfil.contatosBase || !perfil.contatosBase.length) {
    
    return null;
  }
  
  // Obter a primeira mensagem do contato base (não enviada pelo usuário)
  const mensagensIniciais = perfil.contatosBase[0].mensagens;
  
  
  if (!mensagensIniciais || mensagensIniciais.length === 0) {
    
    return null;
  }
  
  const primeirasMensagens = mensagensIniciais.filter(m => !m.enviada);
  
  
  if (primeirasMensagens.length > 0) {
    // Verificar se há texto na primeira mensagem
    if (!primeirasMensagens[0].texto) {
      
      return criarEtapaTexto("Olá! Que bom conhecer você!");
    }
    
    const etapa = criarEtapaTexto(primeirasMensagens[0].texto);
    
    return etapa;
  }
  
  
  return null;
};

// Função para obter áudios do perfil (etapa 2)
const obterAudios = (perfilId) => {
  
  // Garantir que o ID é um número
  const perfilIdNumerico = parseInt(perfilId, 10);
  
  if (isNaN(perfilIdNumerico)) {
    console.warn(`[obterAudios] ID de perfil inválido: ${perfilId}`);
    // Retornar uma mensagem de texto como fallback
    return criarEtapaTexto("Oi! Que bom receber sua mensagem. Como está seu dia?");
  }
  
  const perfil = mulheres.find(m => m.id === perfilIdNumerico);
  
  if (!perfil) {
    console.warn(`[obterAudios] Perfil não encontrado para ID: ${perfilId}`);
    // Retornar uma mensagem de texto como fallback
    return criarEtapaTexto("Olá! Adorei receber sua mensagem. Me conte mais sobre você!");
  }
  
  // Verificar se o perfil tem áudios definidos
  if (!perfil.audios || perfil.audios.length === 0) {
    console.warn(`[obterAudios] Perfil ID ${perfilId} não tem áudios definidos`);
    // Retornar uma mensagem de texto como fallback
    return criarEtapaTexto("Oi! Adorei receber sua mensagem. Vamos conversar mais?");
  }
  
  // Obter dois áudios para a segunda etapa
  const audioSaudacao = perfil.audios.find(a => a.tipo === "saudacao");
  const audiosDisponiveis = perfil.audios.filter(a => a.tipo !== "saudacao"); // Evitar áudio de saudação
  
  // Garantir textos padrão caso não haja texto definido nos áudios
  const textoAudioPadrao = "Mensagem de áudio";
  
  let audio1 = textoAudioPadrao;
  let audio2 = textoAudioPadrao;
  
  // Definir o primeiro áudio (preferência para áudio de saudação)
  if (audioSaudacao && audioSaudacao.texto) {
    audio1 = audioSaudacao.texto;
  } else if (perfil.audios.length > 0 && perfil.audios[0].texto) {
    audio1 = perfil.audios[0].texto;
  }
  
  // Definir o segundo áudio (usar o primeiro disponível que não seja de saudação)
  if (audiosDisponiveis.length > 0 && audiosDisponiveis[0].texto) {
    audio2 = audiosDisponiveis[0].texto;
  } else if (perfil.audios.length > 1 && perfil.audios[1].texto) {
    audio2 = perfil.audios[1].texto;
  }
  
  // Se não temos dois áudios diferentes, usar o mesmo texto para ambos
  if (audio1 === audio2 && perfil.audios.length === 1) {
    audio2 = "Adorei receber sua mensagem. Me conta mais sobre você!";
  }
  
  const etapa = criarEtapaAudio(audio1, audio2);
  
  return etapa;
};

// Função para obter respostas automáticas (etapas 3+)
const obterRespostasAutomaticas = (perfilId) => {
  
  
  // Garantir que o ID é um número
  const perfilIdNumerico = parseInt(perfilId, 10);
  
  
  if (isNaN(perfilIdNumerico)) {
    
    return [];
  }
  
  const perfil = mulheres.find(m => m.id === perfilIdNumerico);
  
  
  if (!perfil || !perfil.respostasAutomaticas || !perfil.respostasAutomaticas.length) {
    
    return [];
  }
  
  // Criar uma etapa de texto para cada resposta automática
  const etapas = perfil.respostasAutomaticas.map(resposta => {
    if (!resposta) {
      
      return criarEtapaTexto("Estou gostando da nossa conversa!");
    }
    return criarEtapaTexto(resposta);
  });
  
  
  return etapas;
};

// Construção dinâmica dos fluxos de conversa
export const fluxosConversa = {};

// Gerar fluxos de conversa para cada perfil de mulher
mulheres.forEach(mulher => {
  const perfilId = String(mulher.id);
  
  
  // Criar array de etapas para este perfil
  const etapas = [];
  
  // Etapa 1: Mensagem inicial do contatosBase
  const etapa1 = obterMensagemInicial(mulher.id);
  if (etapa1) {
    
    etapas.push(etapa1);
  }
  
  // Etapa 2: Áudios
  const etapa2 = obterAudios(mulher.id);
  if (etapa2) {
    
    etapas.push(etapa2);
  }
  
  // Etapas 3+: Respostas automáticas
  const etapasAdicionais = obterRespostasAutomaticas(mulher.id);
  
  etapas.push(...etapasAdicionais);
  
  // Armazenar fluxo completo para este perfil
  fluxosConversa[perfilId] = { etapas };
  
});

// Função para obter uma resposta automática aleatória para uso nas próximas etapas
export const getRespostaAutomaticaRandom = (perfilId) => {
  
  
  // Garantir que perfilId seja um valor válido
  if (!perfilId) {
    
    return "Que interessante! Me conta mais sobre você.";
  }
  
  // Converter para número se for string
  const perfilIdNumerico = parseInt(perfilId, 10);
  
  
  if (isNaN(perfilIdNumerico)) {
    
    return "Estou adorando nossa conversa! Me conte mais.";
  }
  
  const perfil = mulheres.find(m => m.id === perfilIdNumerico);
  
  
  if (!perfil || !perfil.respostasAutomaticas || !perfil.respostasAutomaticas.length) {
    
    return "Isso é muito interessante! O que mais você gosta de fazer?";
  }
  
  const indice = Math.floor(Math.random() * perfil.respostasAutomaticas.length);
  
  const resposta = perfil.respostasAutomaticas[indice];
  
  return resposta;
};

// Função para obter a próxima etapa de uma conversa
export const obterProximaEtapa = (perfilId, etapaAtual) => {
  // Garantir que etapaAtual é um número
  const etapaAtualNum = parseInt(etapaAtual, 10);
  console.log(`[obterProximaEtapa] ID: ${perfilId}, Etapa: ${etapaAtualNum}`);
  
  // Garantir que perfilId seja um valor válido
  if (!perfilId) {
    console.log('[obterProximaEtapa] perfilId inválido, retornando resposta padrão');
    return criarEtapaTexto("Que legal! Me conte mais sobre você.");
  }
  
  // Garantir que perfilId seja uma string
  const perfilIdString = String(perfilId);
  
  // Se estamos na etapa 0, devemos fornecer a etapa 1 (primeira mensagem)
  if (etapaAtualNum === 0) {
    console.log('[obterProximaEtapa] Etapa 0 → Etapa 1 (primeira mensagem)');
    // Obter a primeira etapa (mensagem de texto)
    const primeiraMensagem = criarEtapaTexto("Olá! Que bom conhecer você. Como está seu dia?");
    return primeiraMensagem;
  }
  
  // Se estamos na etapa 1, a próxima deve ser a etapa 2 (áudios)
  if (etapaAtualNum === 1) {
    console.log('[obterProximaEtapa] Etapa 1 → Etapa 2 (áudios)');
    const etapaAudios = obterAudios(perfilId);
    if (etapaAudios) {
      return etapaAudios;
    }
  }
  
  // Buscar no fluxo de conversa
  const perfil = fluxosConversa[perfilIdString];
  
  // Se não encontrar o perfil ou se já passamos de todas as etapas, retornar uma resposta aleatória
  if (!perfil || etapaAtualNum >= perfil.etapas.length) {
    console.log('[obterProximaEtapa] Etapa além do fluxo ou perfil não encontrado, usando resposta aleatória');
    const respostaRandom = getRespostaAutomaticaRandom(perfilId);
    const etapa = criarEtapaTexto(respostaRandom);
    return etapa;
  }
  
  console.log(`[obterProximaEtapa] Retornando etapa ${etapaAtualNum} do fluxo`);
  return perfil.etapas[etapaAtualNum];
};

// Função para obter o estado inicial de uma conversa
export const getEstadoInicialConversa = (perfilId) => {
  console.log(`[getEstadoInicialConversa] Criando estado inicial para perfilId: ${perfilId}`);
  return {
    etapaAtual: 0, // Começar na etapa 1, não na etapa 0
  mensagens: [],
  perfilId,
  ultimaAtualizacao: Date.now()
  };
};

// Funções de localStorage
export const salvarConversaLocal = (userId, matchId, conversa) => {
  try {
    // Garantir que a etapaAtual está sendo preservada e nunca é 0
    if (conversa) {
      if (!conversa.hasOwnProperty('etapaAtual') || conversa.etapaAtual < 1) {
        conversa.etapaAtual = 1; // Valor mínimo garantido
      }
    }
    
    const key = `chat_${userId}_${matchId}`;
    localStorage.setItem(key, JSON.stringify(conversa));
  } catch (error) {
    console.error('[salvarConversaLocal] Erro ao salvar conversa:', error);
  }
};

export const obterConversaLocal = (userId, matchId) => {
  try {
    
    const key = `chat_${userId}_${matchId}`;
    const data = localStorage.getItem(key);
    let conversa = data ? JSON.parse(data) : null;
    
    // Corrigir a conversa se ela existir mas tiver etapa 0
    if (conversa && (!conversa.etapaAtual || conversa.etapaAtual < 1)) {
      conversa.etapaAtual = 1;
      // Salvar a conversa corrigida
      salvarConversaLocal(userId, matchId, conversa);
      console.log('[obterConversaLocal] Conversa corrigida para etapa mínima 1');
    }
    
    return conversa;
  } catch (error) {
    console.error('[obterConversaLocal] Erro ao recuperar conversa:', error);
    return null;
  }
};

export const obterTodasConversasLocal = (userId) => {
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

export default {
  fluxosConversa,
  obterProximaEtapa,
  getEstadoInicialConversa,
  salvarConversaLocal,
  obterConversaLocal,
  obterTodasConversasLocal,
  getRespostaAutomaticaRandom
}; 