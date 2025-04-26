import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import mockData from '../../data/mock';
import { obterNotificacoes, marcarNotificacaoComoLida, obterDadosUsuario } from '../../lib/likes-utils';

export default function Likes() {
  const { redirectWithUtm } = useUtmParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showCurtidasPopup, setShowCurtidasPopup] = useState(false); // Modal intermediário
  const [curtidas, setCurtidas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesOrdenadas, setNotificacoesOrdenadas] = useState([]);
  
  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        
        // Carregar notificações do localStorage
        const userNotificacoes = obterNotificacoes();
        setNotificacoes(userNotificacoes);
        
        // Ordenar notificações: não lidas primeiro, depois lidas
        ordenarNotificacoes(userNotificacoes);
        
        // Usando dados centralizados do mock para curtidas
        if (mockData && mockData.pessoasQueCurtiraraUsuario) {
          setCurtidas(mockData.pessoasQueCurtiraraUsuario);
        } else {
          // Se não houver dados, inicializar com array vazio
          setCurtidas([]);
        }
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        setCurtidas([]);
      }
    } else {
      // Redirecionar para login se não estiver logado
      redirectWithUtm('/login');
      return;
    }
    
    setLoading(false);
    
    // Mostrar popup premium após 1 segundo - Diretamente a modal premium ao navegar
    const timer = setTimeout(() => {
      setShowPremiumPopup(true); // Mostra diretamente a modal premium ao entrar na página
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Função para ordenar notificações
  const ordenarNotificacoes = (listaNotificacoes) => {
    if (!listaNotificacoes || !Array.isArray(listaNotificacoes)) {
      setNotificacoesOrdenadas([]);
      return;
    }
    
    // Separar em duas listas: não lidas e lidas
    const naoLidas = listaNotificacoes.filter(notif => !notif.lida);
    const lidas = listaNotificacoes.filter(notif => notif.lida);
    
    // Combinar as listas: não lidas primeiro, depois lidas
    setNotificacoesOrdenadas([...naoLidas, ...lidas]);
  };
  
  // Função para marcar notificação como lida - agora abre o modal de curtidas primeiro
  const handleNotificacaoClick = (notificacaoId) => {
    // Ao invés de marcar como lida, abrir modal de curtidas primeiro
    setShowCurtidasPopup(true);
    
    // A lógica abaixo só será executada quando o usuário for premium
    // Por enquanto está comentado/desativado
    /*
    marcarNotificacaoComoLida(notificacaoId);
    
    // Atualizar estado local
    const notificacoesAtualizadas = obterNotificacoes();
    setNotificacoes(notificacoesAtualizadas);
    
    // Reordenar notificações
    ordenarNotificacoes(notificacoesAtualizadas);
    */
  };
  
  // Função para abrir a modal premium a partir da modal de curtidas
  const handleOpenPremiumModal = () => {
    setShowCurtidasPopup(false);
    setShowPremiumPopup(true);
  };
  
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
      fontFamily: 'Poppins, sans-serif',
      position: 'relative', // Para posicionamento absoluto do footer
      paddingBottom: '150px' // Espaço para o footer premium + BottomNavigation
    }}>
      <Head>
        <title>Quem Curtiu Você - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <main style={{
        maxWidth: '1200px', // Aumentado para suportar layout desktop
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
        
        {/* Notificações */}
        {notificacoesOrdenadas && notificacoesOrdenadas.length > 0 && (
          <section style={{
            padding: '10px 15px',
            borderBottom: '1px solid #eee'
          }}>
            <h2 style={{
              fontSize: '18px',
              margin: '10px 0',
              color: '#8319C1'
            }}>
              Notificações
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {notificacoesOrdenadas.slice(0, 7).map((notificacao) => (
                <div 
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: notificacao.lida ? 'white' : 'rgba(131, 25, 193, 0.05)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  {notificacao.imagem && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginRight: '10px',
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      <img 
                        src={notificacao.imagem} 
                        alt="" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(5px)' // Ofuscar imagem (recurso premium)
                        }} 
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '15px'
                      }}>
                        🔒
                      </div>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold', // Sempre em negrito
                      color: 'gray'
                    }}>
                      {notificacao.mensagem || `${notificacao.nome} mostrou interesse`}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '3px'
                    }}>
                      {notificacao.tempo || 'Recentemente'}
                    </div>
                  </div>
                  {!notificacao.lida && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#8319C1',
                      marginLeft: '10px'
                    }}></div>
                  )}
                </div>
              ))}
              {notificacoesOrdenadas.length > 7 && (
                <div 
                  style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#8319C1',
                    marginTop: '5px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowCurtidasPopup(true)}
                >
                  Ver todas ({notificacoesOrdenadas.length})
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Lista de curtidas */}
        <section className="curtidas-container" style={{
          padding: '20px 15px'
        }}>
          <div className="curtidas-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            {curtidas && curtidas.length > 0 ? (
              // Limitar para 4 imagens independente da quantidade de curtidas
              curtidas.slice(0, 4).map((pessoa) => (
              <div 
                key={pessoa.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    aspectRatio: '1 / 1' // Garantir formato quadrado
                }}
                  onClick={() => setShowCurtidasPopup(true)}
              >
                <div style={{
                  position: 'relative',
                    height: '100%',
                    overflow: 'hidden'
                }}>
                  <img 
                    src={pessoa.imagem} 
                    alt={pessoa.nome} 
                    style={{
                      width: '100%',
                      height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(10px)'
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
                <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '15px',
                      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      color: 'white',
                      textAlign: 'left'
                }}>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '16px',
                        fontWeight: 'bold'
                  }}>
                    {pessoa.nome.split(',')[0]}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                        opacity: 0.8
                  }}>
                    {pessoa.distancia} de distância
                  </p>
                </div>
              </div>
                </div>
              ))
            ) : (
              notificacoes && notificacoes.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1', // Ocupa todas as colunas
                  textAlign: 'center',
                  padding: '30px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ 
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Ainda não há curtidas no seu perfil. Continue explorando!
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
      
      {/* Footer com Premium - fixo na parte inferior */}
      <div style={{
        position: 'fixed',
        bottom: '60px', // Posição logo acima do BottomNavigation
        left: 0,
        width: '100%',
        padding: '15px',
        backgroundColor: '#f8f8f8',
        borderTop: '1px solid #eee',
        zIndex: 990
      }}>
          <div style={{
            backgroundColor: 'rgba(131, 25, 193, 0.1)',
            borderRadius: '10px',
            padding: '15px',
            display: 'flex',
          alignItems: 'center',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '10px'
          }}>
            <div style={{ fontSize: '24px', marginRight: '10px' }}>✨</div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              <strong>Premium:</strong> Desbloqueie para ver quem curtiu seu perfil e ter acesso ilimitado às conversas!
            </div>
          </div>
          
          <button
          onClick={() => setShowCurtidasPopup(true)}
            style={{
              width: '100%',
            maxWidth: '600px',
            padding: '12px 0',
              backgroundColor: '#8319C1',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          Desbloqueie o Premium
        </button>
      </div>
      
      {/* Popup de Veja quem curtiu você (Modal intermediário) */}
      {showCurtidasPopup && (
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
          zIndex: 10002,
          boxShadow: '0 0 20px #8319C1',
          width: '90%',
          maxWidth: '350px',
          border: '1px solid #8319C1'
        }}>
          <div style={{
            fontSize: '22px',
            marginBottom: '20px',
            color: '#FF64C5',
            fontWeight: 'bold'
          }}>
            Veja quem curtiu você!
          </div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '18px', marginBottom: '15px' }}>
              {curtidas.length || 3} pessoas curtiram seu perfil recentemente
            </p>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
              Elas estão esperando você responder!
            </p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {/* Mostra 3 perfis de exemplo */}
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #8319C1',
              marginBottom: '15px'
            }}>
              <img 
                src="/images/2.jpg" 
                alt="Perfil" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(5px)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                color: 'white'
              }}>
                🔒
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                fontSize: '10px',
                color: '#ddd',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Eduarda, 34 • 4km
              </div>
            </div>
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #8319C1',
              marginBottom: '15px'
            }}>
              <img 
                src="/images/3.jpg" 
                alt="Perfil" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(5px)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                color: 'white'
              }}>
                🔒
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                fontSize: '10px',
                color: '#ddd',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Camila, 39 • 2km
              </div>
            </div>
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #8319C1',
              marginBottom: '15px'
            }}>
              <img 
                src="/images/6.png" 
                alt="Perfil" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(5px)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                color: 'white'
              }}>
                🔒
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                fontSize: '10px',
                color: '#ddd',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Beatriz, 27 • 11km
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(131, 25, 193, 0.3)',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '24px', marginRight: '10px' }}>✨</div>
            <div style={{ fontSize: '14px', textAlign: 'left' }}>
              As coroas acima já demonstraram interesse em você. Veja quem são e comece a conversar agora!
            </div>
          </div>
          <button 
            onClick={handleOpenPremiumModal}
            style={{
              background: 'linear-gradient(to right, #420079, #ae00ff)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              margin: '10px 0'
            }}
          >
            Ver quem curtiu você
          </button>
          <button 
            onClick={() => setShowCurtidasPopup(false)}
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
          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Assinantes premium recebem média de <b>3x mais matches</b>
          </div>
        </div>
      )}
      
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
      
      <style jsx>{`
        @media (min-width: 768px) {
          .curtidas-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            gap: 20px !important;
          }
          
          .curtidas-container {
            padding: 20px 30px 120px 30px !important;
          }
        }
      `}</style>
      
      <BottomNavigation />
    </div>
  );
} 