// Funções de utilidade para autenticação

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