// Funções de utilidade para autenticação
import { supabaseClient } from './supabase';
import mockData from '../data/mock';
import { adicionarNovoMatch } from './chat-utils';

// Salvar dados do usuário no localStorage
export const saveUserData = (userData) => {
  if (!userData) return false;
  
  const { token, id, nome, email, foto } = userData;
  
  // Salvar token de autenticação
  localStorage.setItem('authToken', token);
  
  // Salvar id do usuário
  localStorage.setItem('userId', id);
  
  // Salvar foto do usuário (ou foto padrão)
  localStorage.setItem('userPhoto', foto || '/images/11.jpg');
  
  // Salvar objeto de usuário completo para compatibilidade
  const userObject = {
    id,
    nome,
    email,
    foto: foto || '/images/11.jpg',
    token
  };
  
  localStorage.setItem('user', JSON.stringify(userObject));
  
  // Disparar evento para notificar outras partes do app
  window.dispatchEvent(new Event('storage'));
  
  return true;
};

// Verificar se o usuário está logado
export const isUserLoggedIn = () => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  return !!(token && userId);
};

// Validar se o usuário ainda existe no servidor
export const validateUserExists = async () => {
  if (!isUserLoggedIn()) return false;
  
  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    
    // Verificar validade do token e existência do usuário
    const response = await fetch('/api/auth/validate-user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Se o usuário não existir mais, fazer logout
      logoutUser();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao validar usuário:', error);
    return false;
  }
};

// Obter dados do usuário logado
export const getUserData = () => {
  if (!isUserLoggedIn()) return null;
  
  // Tentar obter do objeto completo primeiro
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
    }
  }
  
  // Caso contrário, construir objeto básico
  return {
    id: localStorage.getItem('userId'),
    token: localStorage.getItem('authToken'),
    photo: localStorage.getItem('userPhoto') || '/images/11.jpg'
  };
};

// Logout do usuário
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userPhoto');
  localStorage.removeItem('user');
  
  // Disparar evento para notificar outras partes do app
  window.dispatchEvent(new Event('storage'));
  
  return true;
};

// Obter cabeçalhos de autorização para requisições
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
};

/**
 * Função para registrar um novo usuário
 * @param {Object} userData - Dados do usuário para registro 
 * @returns {Promise<Object>} - Resultado do registro
 */
export async function registerUser(userData) {
  try {
    // Simular registro de usuário
    // Em uma aplicação real, isso usaria o Supabase ou outro serviço
    
    // Criar objeto de usuário
    const user = {
      id: Date.now().toString(),
      email: userData.email,
      nome: userData.nome,
      // outros dados do usuário
    };
    
    // Salvar no localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Inicializar algumas conversas fictícias para o usuário
    inicializarConversasNovoUsuario(user.email);
    
    return { success: true, user };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inicializa conversas para um novo usuário
 * @param {string} userEmail - Email do usuário
 */
function inicializarConversasNovoUsuario(userEmail) {
  if (!userEmail) return;
  
  // Selecionar alguns perfis aleatórios para serem matches iniciais
  const perfisAleatorios = mockData.perfis
    .sort(() => Math.random() - 0.5)
    .slice(0, 3); // Pegar 3 perfis aleatórios
  
  // Adicionar como matches
  perfisAleatorios.forEach(perfil => {
    adicionarNovoMatch(userEmail, perfil);
  });
} 