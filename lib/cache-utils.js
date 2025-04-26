// lib/cache-utils.js
import mockData from '../data/mock/index.js';
const { mulheres, perfis } = mockData;

const CACHE_EXPIRY = 10 * 60 * 1000;

// Função para obter o mockData
const getMockData = () => {
  return mockData.mulheres;
};

// Criando o objeto fluxoConversa
const fluxoConversa = getMockData().map(perfil => ({
  id: perfil.id,
  nome: perfil.nome,
  etapas: perfil.contatosBase.length > 0 ? perfil.contatosBase[0].mensagens.map((msg, index) => ({
    id: index + 1,
    mensagens: [
      {
        id: msg.id,
        tipo: "texto",
        texto: msg.texto,
        enviada: msg.enviada,
        hora: msg.hora,
      }
    ]
  })) : []
}));

const getConversationKey = (userId, perfilId) => {
  console.log('[getConversationKey] Gerando chave de conversa para userId:', userId, 'perfilId:', perfilId);
  if (!userId || !perfilId){
    console.error("Erro: userId e perfilId são obrigatórios para a chave de conversa.");
    return null; // Retorna null ou uma string vazia, dependendo da sua preferência de tratamento de erro
  }
  return `conversa_${userId}_${perfilId}`;
};

export const saveMatchesToCache = (userId, matches) => {
  console.log('[saveMatchesToCache] Iniciando salvamento de matches em cache para userId:', userId);
  try {
    const cacheData = {
      matches,
      timestamp: Date.now()
    };
    console.log('[saveMatchesToCache] Dados a serem salvos:', cacheData);
    localStorage.setItem(`matches_cache_${userId}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  } 
};

export const getMatchesFromCache = (userId) => {
  try {
    console.log('[getMatchesFromCache] Tentando recuperar matches do cache para userId:', userId);
    const cacheData = localStorage.getItem(`matches_cache_${userId}`);
    if (!cacheData) { console.log('[getMatchesFromCache] Nenhum dado encontrado no cache.'); return null; }

    const { matches, timestamp } = JSON.parse(cacheData);
    console.log('[getMatchesFromCache] Dados encontrados no cache:', { matches, timestamp });
    const agora = Date.now();

    if (agora - timestamp > CACHE_EXPIRY) {
      console.log('[getMatchesFromCache] Cache expirado. Removendo e retornando null.');
      localStorage.removeItem(`matches_cache_${userId}`);
      return null;
    }

    return matches;
  } catch (error) {
    console.error('Erro ao recuperar cache:', error);
    return null;
  }
};


export const obterConversaLocal = (userId, perfilId) => {
  console.log('[obterConversaLocal] Buscando conversa local para userId:', userId, 'perfilId:', perfilId);
  try {
    const key = getConversationKey(userId, perfilId);
    if (!key) return null;
    console.log('[obterConversaLocal] Chave da conversa:', key);
    const conversa = localStorage.getItem(key); console.log('[obterConversaLocal] Dados recuperados do localStorage:', conversa);
    return conversa ? JSON.parse(conversa) : null;
  } catch (error) {
    console.error('Erro ao obter conversa local:', error);
    return null;
  }
};


export const salvarConversaLocal = (userId, perfilId, conversa) => {
  console.log('[salvarConversaLocal] Salvando conversa local para userId:', userId, 'perfilId:', perfilId);
  try {
    const key = getConversationKey(userId, perfilId);
    if (!key) return;
    console.log('[salvarConversaLocal] Chave da conversa:', key, 'Dados a serem salvos:', conversa);
    localStorage.setItem(key, JSON.stringify(conversa));
  } catch (error) {
    console.error('Erro ao salvar conversa local:', error);
  }
};

export const obterTodasConversasLocal = (userId) => {
  console.log('[obterTodasConversasLocal] Buscando todas as conversas locais para userId:', userId);
  const conversas = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`conversa_${userId}_`)) {
      console.log('[obterTodasConversasLocal] Encontrada chave de conversa:', key);
      try {
        // Extrai o perfilId da chave
        const perfilId = key.split('_').pop();
        
        // Recupera a conversa e a adiciona ao objeto
        const conversa = localStorage.getItem(key);
        conversas[perfilId] = conversa ? JSON.parse(conversa) : null;
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
      }
    }
  }
  
  return conversas;
};


// Mover a função obterProximaEtapa para este arquivo, e fazer as devidas correções de referencia se necessario. A função está atualmente no arquivo data/mock/index.js
export const obterProximaEtapa = (conversaExistente) => {
  console.log('[obterProximaEtapa] Obtendo proxima etapa para a conversa:', conversaExistente);
  if(!conversaExistente){
    console.log('[obterProximaEtapa] Conversa inexistente');
    return null;
  }
  const perfilId = conversaExistente.perfilId;
  const etapaAtual = conversaExistente.etapaAtual;
  
  
    const perfil = fluxoConversa.find(p => p.id === parseInt(perfilId)); console.log('[obterProximaEtapa] Perfil encontrado:', perfil);
    if (!perfil) return null;
  
    const proximaEtapa = perfil.etapas.find(e => e.id === etapaAtual + 1);
    return proximaEtapa || null;
  };




// Funcao obter estado inicial
export const getEstadoInicialConversa = (perfilId) => {  
  console.log('[getEstadoInicialConversa] Obtendo estado inicial da conversa para perfilId:', perfilId);
  const perfil = getMockData().find(p => p.id === parseInt(perfilId));
  if (!perfil) {
    console.log('\[getEstadoInicialConversa] Perfil não encontrado:', perfilId);
    return null;
  }

  // Busca a primeira etapa de conversa do perfil pelo ID, caso encontre
  const etapaInicial = fluxoConversa.find(p => p.id === parseInt(perfilId))?.etapas.find(e => e.id === 1);

  // Monta o estado inicial, caso a etapa inicial exista
  return {
    etapaAtual: 0, // Inicia na primeira etapa
    mensagens: etapaInicial ? etapaInicial.mensagens : [],
    perfilId: String(perfilId) || null,
    ultimaAtualizacao: Date.now(),
    nome: perfil.nome.split(',')[0], // Pegando apenas o nome sem a idade
    foto: perfil.foto || perfil.imagem // Pegando a foto
  };
};

// Funcao is online
export const isOnline = (perfilId) => {
  console.log('[isOnline] Verificando status online para perfilId:', perfilId);
  const perfil = mulheres.find(p => p.id === parseInt(perfilId));
  if (!perfil) return false; // Se não encontrar o perfil, considera offline

  return perfil.online || false; // Retorna true se estiver online, false caso contrário
};


// Funcao sanitizar Mensagens
export const sanitizarMensagens = (mensagens) => {
  console.log('[sanitizarMensagens] Iniciando sanitização de mensagens');
  if (!Array.isArray(mensagens)) {
    console.log('[sanitizarMensagens] Não é um array, retornando array vazio');
    return [];
  } 

  return mensagens.map(msg => {
    if (!msg) return null;

    // Garantir tipo correto
    const tipoValido = msg.tipo === 'texto' || msg.tipo === 'audio' ? msg.tipo : 'texto';

    // Objeto base com campos obrigatórios
    const mensagemSanitizada = {
      id: msg.id || Date.now() + Math.floor(Math.random() * 1000),
      tipo: tipoValido,
      texto: msg.texto || (tipoValido === 'audio' ? "Mensagem de áudio" : "..."),
      enviada: typeof msg.enviada === 'boolean' ? msg.enviada : false,
      hora: msg.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Adicionar campo duracao apenas para áudio
    if (tipoValido === 'audio') {
      mensagemSanitizada.duracao = msg.duracao || "0:30";
    }

    return mensagemSanitizada;
  }).filter(Boolean); // Remover mensagens nulas
};

// Adicionar novo match
export const adicionarNovoMatch = (userId, newMatchId, matchData) => {
  console.log('[adicionarNovoMatch] Adicionando novo match para userId:', userId, 'newMatchId:', newMatchId);
  try {
    const matches = getMatchesFromCache(userId) || [];

    // Verificar se o match já existe
    const matchExistente = matches.find(match => String(match.id) === String(newMatchId));

    if (!matchExistente) {
      const newMatch = {
        id: newMatchId,
        nome: matchData.nome,
        idade: matchData.idade,
        imagem: matchData.imagem,
        timestamp: Date.now(),
        etapaAtual:0,
      };
      const novosMatches = [newMatch, ...matches];
      saveMatchesToCache(userId, novosMatches);
      return novosMatches;
    } else {
      return matches;
    }
  } catch (error) {
    console.error('Erro ao adicionar novo match:', error);
    return null;
  }
};









