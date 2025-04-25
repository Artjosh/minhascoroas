import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUtmParams } from '../components/UtmManager';
import { isUserLoggedIn } from '../lib/auth';

export default function Home() {
  const router = useRouter();
  const { redirectWithUtm } = useUtmParams();
  const [userLogado, setUserLogado] = useState(false);
  
  useEffect(() => {
    // Verificar se o usuário está logado ao montar o componente
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserLogado(true);
        
        // Redirecionar para a página de timeline automaticamente
        // Pequeno delay para garantir que o state seja atualizado
        setTimeout(() => {
          redirectWithUtm('/curtidas');
        }, 300);
      } catch (error) {
        console.error('Erro ao verificar login:', error);
      }
    }
  }, []);

  return (
    <div style={{
      height: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <Head>
        <title>Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main style={{
        background: `url('/images/fundo2.svg') center/cover no-repeat`,
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        zIndex: 0,
        color: 'white',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/images/logoCoroa.png" alt="Logo Minha Coroa" width="150px" />
          <h1 style={{ margin: 0, fontSize: '20px', marginBottom: '10px' }}>
            Bem-vindo ao <span style={{ color: '#b941ff' }}>Minha Coroa</span>
          </h1>
          <p style={{ margin: 0, fontSize: '10px', padding: '0px 25px', color: '#c4c4c4' }}>
            Onde o charme da maturidade encontra o desejo da juventude.
            Aqui, mulheres incríveis com mais de 30 anos se conectam com 
            jovens de 18+ em uma relação leve, envolvente e vantajosa.
          </p>
          
          {userLogado ? (
            <div>
              <button 
                style={{
                  background: 'linear-gradient(45deg, #8319C1,#b941ff, #8319C1)',
                  color: 'white',
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
                onClick={() => redirectWithUtm('/curtidas')}
              >
                Timeline
              </button>
              
              <button 
                style={{
                  background: 'linear-gradient(45deg, #8319C1,#b941ff, #8319C1)',
                  color: 'white',
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
                onClick={() => redirectWithUtm('/contatos')}
              >
                Meus Matches
              </button>
            </div>
          ) : (
            <>
              <button 
                style={{
                  background: 'linear-gradient(45deg, #8319C1,#b941ff, #8319C1)',
                  color: 'white',
                  padding: '10px 70px',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
                onClick={() => redirectWithUtm('/cadastro')}
              >
                Cadastre-se
              </button>
              <br />
              <p style={{ color: '#c4c4c4', fontSize: '10px' }}>
                Já tem uma conta? <span 
                  style={{ color: '#b941ff', cursor: 'pointer' }}
                  onClick={() => redirectWithUtm('/login')}
                > Entrar</span>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 