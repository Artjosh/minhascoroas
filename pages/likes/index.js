import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import mockData from '../../data/mock';

export default function Likes() {
  const { redirectWithUtm } = useUtmParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  
  // Usando dados centralizados do mock
  const curtidas = mockData.pessoasQueCurtiraraUsuario;
  
  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
      }
    } else {
      // Redirecionar para login se não estiver logado
      redirectWithUtm('/login');
      return;
    }
    
    setLoading(false);
    
    // Mostrar popup premium após 1 segundo
    const timer = setTimeout(() => {
      setShowPremiumPopup(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Função para desbloqueio premium (mockada)
  const desbloquearPremium = () => {
    setShowPremiumPopup(false);
    // Aqui teria a lógica para processar o pagamento
    // e atualizar o status premium do usuário
  };
  
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        color: '#8319C1'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>Carregando curtidas...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      backgroundColor: '#f8f8f8',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <Head>
        <title>Quem Curtiu Você - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <main style={{
        paddingBottom: '70px', // Espaço para o BottomNavigation
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <header style={{
          background: 'linear-gradient(to right, #8319C1, #b941ff)',
          color: 'white',
          padding: '15px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '22px',
            margin: '0 0 5px 0'
          }}>
            Quem Curtiu Você
          </h1>
          <p style={{ 
            fontSize: '14px',
            margin: 0,
            opacity: 0.9
          }}>
            Estas coroas demonstraram interesse em você
          </p>
        </header>
        
        {/* Lista de curtidas */}
        <section style={{
          padding: '20px 15px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
          }}>
            {curtidas.map((pessoa) => (
              <div 
                key={pessoa.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'relative',
                  height: '180px',
                  overflow: 'hidden',
                  filter: 'blur(10px)'
                }}>
                  <img 
                    src={pessoa.imagem} 
                    alt={pessoa.nome} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      fontSize: '36px'
                    }}>
                      🔒
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {pessoa.nome.split(',')[0]}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {pessoa.distancia} de distância
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            backgroundColor: 'rgba(131, 25, 193, 0.1)',
            borderRadius: '10px',
            padding: '15px',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '24px', marginRight: '10px' }}>✨</div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              <strong>Premium:</strong> Desbloqueie para ver quem curtiu seu perfil e ter acesso ilimitado às conversas!
            </div>
          </div>
          
          <button
            onClick={() => setShowPremiumPopup(true)}
            style={{
              width: '100%',
              padding: '15px 0',
              backgroundColor: '#8319C1',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Desbloqueie o Premium
          </button>
        </section>
      </main>
      
      {/* Popup de Premium */}
      {showPremiumPopup && (
        <div style={{
          display: 'block',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#252525',
          color: 'white',
          padding: '25px 20px',
          borderRadius: '15px',
          textAlign: 'center',
          zIndex: 10003,
          boxShadow: '0 0 20px #8319C1',
          width: '90%',
          maxWidth: '350px',
          border: '1px solid #8319C1'
        }}>
          <div style={{
            fontSize: '22px',
            marginBottom: '15px',
            color: '#FF64C5',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/images/logoCoroa.png" alt="" width="100px" />
          </div>
          <div style={{
            fontSize: '15px',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            Desbloqueie agora o acesso total ao APP, use sem limitações, e tenha a experiência completa!
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ae00ff',
            margin: '15px 0 5px'
          }}>
            R$ 14,90 <span style={{ fontSize: '16px', opacity: '0.8', fontWeight: 'normal' }}><br/>(pagamento único)</span>
          </div>
          <div style={{ textAlign: 'left', marginLeft: '30px', marginBottom: '40px', fontSize: '14px' }}>
            <p>Ao assinar o pacote você possui acesso a:</p>
            <p><span style={{ color: '#ae00ff' }}>• </span> 100 Curtidas</p>
            <p><span style={{ color: '#ae00ff' }}>• </span> Acesso ilimitado ao chat</p>
            <p><span style={{ color: '#ae00ff' }}>• </span> Ver quem curtiu você</p>
            <p><span style={{ color: '#ae00ff' }}>• </span> Múltiplos matches simultâneos</p>
          </div>
          <button 
            onClick={desbloquearPremium}
            style={{
              backgroundColor: '#ae24fd',
              background: 'linear-gradient(to right, #420079, #ae00ff)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              margin: '10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Obter Premium
          </button>
          <button 
            onClick={() => setShowPremiumPopup(false)}
            style={{
              backgroundColor: 'transparent',
              color: '#999',
              border: 'none',
              padding: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              margin: '5px 0'
            }}
          >
            Agora não
          </button>
          <div style={{ fontSize: '12px', opacity: '0.7', margin: '10px 0' }}>
            Ao prosseguir, você concorda com nossos termos de uso e política de privacidade.
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
} 