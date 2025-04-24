import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUtmParams } from './UtmManager';
import { isUserLoggedIn, getUserData } from '../lib/auth';

const BottomNavigation = () => {
  const router = useRouter();
  const { redirectWithUtm } = useUtmParams();
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Verificar se o usuário está logado ao montar o componente
    const checkUserLogado = () => {
      if (isUserLoggedIn()) {
        setUserData(getUserData());
      } else {
        setUserData(null);
      }
    };
    
    // Verificar imediatamente
    checkUserLogado();
    
    // Adicionar listener para mudanças de armazenamento (caso o usuário faça login em outra aba)
    window.addEventListener('storage', checkUserLogado);
    
    return () => {
      window.removeEventListener('storage', checkUserLogado);
    };
  }, []);

  // Determinar qual ícone está ativo com base na rota atual
  const isActive = (path) => {
    // Para a página inicial (Timeline), verificar tanto "/" quanto "/curtidas"
    if (path === '/curtidas' && (router.pathname === '/' || router.pathname === '/curtidas')) {
      return true;
    }
    return router.pathname === path;
  };

  // Função para navegar para uma rota
  const navigate = (path) => {
    // Verificar se o usuário está logado para rotas protegidas
    if ((path === '/perfil' || path === '/contatos' || path === '/curtidas') && !userData) {
      redirectWithUtm('/login');
      return;
    }
    
    redirectWithUtm(path);
  };

  // Estilo básico para o container de navegação inferior
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };

  // Estilo para cada item de navegação
  const navItemStyle = (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    color: active ? '#8319C1' : '#666',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={navStyle}>
      {/* Ícone Timeline (antes Início) */}
      <div 
        style={navItemStyle(isActive('/curtidas'))} 
        onClick={() => navigate('/curtidas')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={isActive('/curtidas') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke={isActive('/curtidas') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Timeline</span>
      </div>
      
      {/* Ícone Curtidas */}
      <div 
        style={navItemStyle(isActive('/likes'))} 
        onClick={() => navigate('/likes')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={isActive('/likes') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={isActive('/likes') ? '#8319C1' : 'none'}/>
        </svg>
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Curtidas</span>
      </div>
      
      {/* Ícone Chat */}
      <div 
        style={navItemStyle(isActive('/contatos'))} 
        onClick={() => navigate('/contatos')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={isActive('/contatos') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={isActive('/contatos') ? '#8319C1' : 'none'}/>
        </svg>
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Chat</span>
      </div>
      
      {/* Ícone Perfil */}
      <div 
        style={navItemStyle(isActive('/perfil'))} 
        onClick={() => navigate('/perfil')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={isActive('/perfil') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke={isActive('/perfil') ? '#8319C1' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Perfil</span>
      </div>
    </div>
  );
};

export default BottomNavigation; 