import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import UtmProvider from '../components/UtmManager';
import { validateUserExists, isUserLoggedIn } from '../lib/auth';

// Lista de rotas que não devem mostrar a barra de navegação
const noNavRoutes = ['/login', '/cadastro', '/redefinir-senha'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Validar usuário a cada mudança de rota
    const validateUser = async () => {
      if (isUserLoggedIn()) {
        const isValid = await validateUserExists();
        
        // Se o usuário não for válido e estiver em uma rota protegida, 
        // redirecionar para a página inicial
        if (!isValid && !noNavRoutes.includes(router.pathname)) {
          router.push('/');
        }
      }
    };
    
    validateUser();
  }, [router.pathname]);
  
  return (
    <UtmProvider>
      <div className="app-container">
        <Component {...pageProps} />
      </div>
    </UtmProvider>
  );
}

export default MyApp; 