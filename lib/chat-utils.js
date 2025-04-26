/**
 * Utility functions for managing chat conversations between users and matches
 */
import { mulheres, getRespostaAutomatica } from '../data/mock/index';

// Function to get current time in HH:MM format
const getCurrentTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to generate a unique ID for messages
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

/**
 * Get all chats for a specific user
 * @param {string|number} userId - The ID of the user
 * @returns {Object} - Object containing all chats for the user
 */
export const getConversas = (userId) => {
  try {
    const conversas = {};
    if (typeof window === 'undefined') return conversas;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`chat_${userId}_`)) {
        const matchId = key.split('_')[2];
        conversas[matchId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return conversas;
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return {};
  }
};

/**
 * Get a specific chat between a user and a match
 * @param {string|number} userId - The ID of the user
 * @param {string|number} matchId - The ID of the match
 * @returns {Object|null} - The chat object or null if not found
 */
export const getConversa = (userId, matchId) => {
  try {
    if (typeof window === 'undefined') return null;
    
    const key = `chat_${userId}_${matchId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    return null;
  }
};

/**
 * Save a chat between a user and a match
 * @param {string|number} userId - The ID of the user
 * @param {string|number} matchId - The ID of the match
 * @param {Object} conversa - The chat object to save
 * @returns {boolean} - Whether the save was successful
 */
export const salvarConversa = (userId, matchId, conversa) => {
  try {
    if (typeof window === 'undefined') return false;
    
    const key = `chat_${userId}_${matchId}`;
    localStorage.setItem(key, JSON.stringify(conversa));
    return true;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return false;
  }
};

/**
 * Initialize a new chat for a match
 * @param {Object} perfil - The profile object of the match
 * @returns {Object} - A new chat object
 */
export const inicializarConversa = (perfil) => {
  if (!perfil || !perfil.id) {
    console.error('Invalid profile for initializing conversation');
    return {
      etapaAtual: 0,
      mensagens: [],
      ultimaMensagem: "",
      horaUltimaMensagem: getCurrentTime(),
      perfilId: null,
      ultimaAtualizacao: Date.now()
    };
  }

  // Find the match profile in the mulheres array
  const matchProfile = mulheres.find(m => m.id === parseInt(perfil.id));
  
  if (!matchProfile) {
    console.warn(`No match profile found for ID ${perfil.id}`);
    return {
      etapaAtual: 0,
      mensagens: [],
      ultimaMensagem: "",
      horaUltimaMensagem: getCurrentTime(),
      perfilId: perfil.id,
      ultimaAtualizacao: Date.now(),
      nome: perfil.nome || "Match",
      foto: perfil.foto || perfil.imagem || "/images/avatar.jpg"
    };
  }

  // Create initial message
  const initialMessage = {
    id: generateId(),
    tipo: 'texto',
    texto: "Oi, tudo bem? Gostei do seu perfil!",
    enviada: false,
    hora: getCurrentTime()
  };

  return {
    etapaAtual: 0,
    mensagens: [initialMessage],
    perfilId: perfil.id,
    ultimaAtualizacao: Date.now(),
    nome: matchProfile.nome,
    foto: matchProfile.foto || matchProfile.imagem,
    ultimaMensagem: initialMessage.texto,
    horaUltimaMensagem: initialMessage.hora
  };
};

/**
 * Send a message in a conversation and handle automatic responses
 * @param {string|number} userId - The ID of the user
 * @param {string|number} matchId - The ID of the match
 * @param {string} texto - The message text
 * @returns {Object|null} - The sent message object or null if failed
 */
export const enviarMensagem = (userId, matchId, texto) => {
  try {
    if (!userId || !matchId || !texto) return null;
    
    // Get current conversation or initialize a new one
    let conversa = getConversa(userId, matchId);
    if (!conversa) {
      const matchProfile = mulheres.find(m => m.id === parseInt(matchId));
      if (!matchProfile) return null;
      
      conversa = inicializarConversa(matchProfile);
    }

    // Create user message
    const userMessage = {
      id: generateId(),
      tipo: 'texto',
      texto,
      enviada: true,
      hora: getCurrentTime()
    };

    // Add user message to conversation
    const updatedMessages = [...(conversa.mensagens || []), userMessage];
    
    // Update conversation with user message
    conversa = {
      ...conversa,
      mensagens: updatedMessages,
      ultimaMensagem: texto,
      horaUltimaMensagem: userMessage.hora,
      ultimaAtualizacao: Date.now()
    };
    
    // Save conversation with user message
    salvarConversa(userId, matchId, conversa);
    
    // Handle automatic response based on current stage
    setTimeout(() => {
      // Get current conversation (it might have been updated)
      const currentConversation = getConversa(userId, matchId);
      if (!currentConversation) return;
      
      // Get current stage
      const currentStage = currentConversation.etapaAtual;
      const nextStage = currentStage + 1;
      
      // Create response message
      let responseMessage;
      
      // If it's the first response (etapaAtual is 0), send an audio message
      if (currentStage === 0) {
        const matchProfile = mulheres.find(m => m.id === parseInt(matchId));
        const audioMessages = matchProfile?.audios || [];
        
        if (audioMessages.length > 0) {
          // Get a greeting audio (type: saudacao) or a random one
          const greetingAudio = audioMessages.find(a => a.tipo === 'saudacao') || 
                               audioMessages[Math.floor(Math.random() * audioMessages.length)];
          
          responseMessage = {
            id: generateId(),
            tipo: 'audio',
            texto: greetingAudio.texto || "Olá! Que bom falar com você!",
            duracao: "0:30",
            enviada: false,
            hora: getCurrentTime()
          };
        } else {
          // Fallback to text if no audio messages are available
          responseMessage = {
            id: generateId(),
            tipo: 'texto',
            texto: "Olá! Que bom falar com você!",
            enviada: false,
            hora: getCurrentTime()
          };
        }
      } else {
        // For other stages, use automatic responses from the match profile
        const responseText = getRespostaAutomatica(matchId);
        
        responseMessage = {
          id: generateId(),
          tipo: 'texto',
          texto: responseText,
          enviada: false,
          hora: getCurrentTime()
        };
      }
      
      // Add response message to conversation
      const allMessages = [...currentConversation.mensagens, responseMessage];
      
      // Update conversation with response
      const updatedConversation = {
        ...currentConversation,
        mensagens: allMessages,
        ultimaMensagem: responseMessage.texto,
        horaUltimaMensagem: responseMessage.hora,
        etapaAtual: nextStage,
        ultimaAtualizacao: Date.now()
      };
      
      // Save updated conversation
      salvarConversa(userId, matchId, updatedConversation);
    }, 1000); // Wait 1 second before showing the response
    
    return userMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Check if a user is online (simulated)
 * @param {string|number} userId - The ID of the user to check
 * @returns {boolean} - Whether the user is online
 */
export const isOnline = (userId) => {
  // Simulate online/offline status based on ID
  const onlineIds = [1, 3, 5, 7, 9, 11, 13];
  return onlineIds.includes(parseInt(userId));
};

/**
 * Add a new match and initialize a conversation
 * @param {string|number} userId - The ID of the user
 * @param {Object} perfil - The profile object of the match
 * @returns {boolean} - Whether the match was added successfully
 */
export const adicionarNovoMatch = (userId, perfil) => {
  try {
    if (!userId || !perfil || !perfil.id) {
      console.error('Invalid data for adding match');
      return false;
    }
    
    // Check if conversation already exists
    const existingConversation = getConversa(userId, perfil.id);
    if (existingConversation) {
      return true; // Conversation already exists
    }
    
    // Initialize new conversation
    const newConversation = inicializarConversa(perfil);
    
    // Save conversation
    salvarConversa(userId, perfil.id, newConversation);
    
    // Update user's matches in localStorage if needed
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        if (!userObj.idmatches) {
          userObj.idmatches = [];
        }
        
        if (!userObj.idmatches.includes(parseInt(perfil.id))) {
          userObj.idmatches.push(parseInt(perfil.id));
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      }
    } catch (error) {
      console.error('Error updating user matches:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding new match:', error);
    return false;
  }
};

/**
 * Check and create chats for all matches of a user
 * @param {string|number} userId - The ID of the user
 * @param {Array} matchIds - Array of match IDs
 */
export const verificarECriarChatsParaMatches = (userId, matchIds) => {
  if (!userId || !matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
    return;
  }
  
  matchIds.forEach(matchId => {
    // Check if conversation already exists
    const existingConversation = getConversa(userId, matchId);
    if (!existingConversation) {
      // Find match profile
      const matchProfile = mulheres.find(p => p.id.toString() === matchId.toString());
      if (matchProfile) {
        // Initialize and save new conversation
        adicionarNovoMatch(userId, matchProfile);
      }
    }
  });
};

export default {
  getConversas,
  getConversa,
  salvarConversa,
  inicializarConversa,
  enviarMensagem,
  isOnline,
  adicionarNovoMatch,
  verificarECriarChatsParaMatches
};
