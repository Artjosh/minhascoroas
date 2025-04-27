import { useState, useEffect } from 'react';
import Head from 'next/head';

import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import { isUserLoggedIn, getUserData, getAuthHeaders } from '../../lib/auth';
import { mulheres } from '../../data/mock';
import { 
  obterNotificacoes, 
  adicionarNotificacao, 
  marcarNotificacaoComoLida, 
  obterDadosUsuario, 
  salvarDadosUsuario
} from '../../lib/likes-utils';

export default function Curtidas() {
  const { redirectWithUtm } = useUtmParams();
  const [showNotification, setShowNotification] = useState(false);
  const [perfilAtual, setPerfilAtual] = useState(0);
  const [showHeart, setShowHeart] = useState(false); 
  const [showX, setShowX] = useState(false);
  const [perfilEncontrado, setPerfilEncontrado] = useState(true);
  const [showCurtidasPopup, setShowCurtidasPopup] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showAlternativePremiumPopup, setShowAlternativePremiumPopup] = useState(false);
  const [matches, setMatches] = useState([]);
  const [likeCount, setLikeCount] = useState(0); // Contador de likes
  const [likesAteMatch, setLikesAteMatch] = useState(0); // Número aleatório de likes até o match
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [userPhoto, setUserPhoto] = useState('/images/11.jpg'); // Foto do usuário logado
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [userId, setUserId] = useState(null);
  const [notificacaoAtual, setNotificacaoAtual] = useState(null); // Estado para armazenar a notificação atual
  const [notificacoesUsuario, setNotificacoesUsuario] = useState([]); // Estado para armazenar todas as notificações
  const [userData, setUserData] = useState(null); // Estado para armazenar os dados do usuário
  const [hasVenda1, setHasVenda1] = useState(false); // Novo estado para verificar se tem venda1
  
  let timer1, timer2;

  // Função auxiliar para atualizar os dados do usuário
  const atualizarDadosUsuario = (novoDado) => {
    // Busca os dados atuais do usuário
    const dadosAtuais = obterDadosUsuario();
    if (!dadosAtuais) return false;
    
    // Mescla os dados atuais com os novos dados
    const dadosAtualizados = {
      ...dadosAtuais,
      ...novoDado
    };
    
    // Salva no localStorage
    return salvarDadosUsuario(dadosAtualizados);
  };

  // Definir o número de likes até o match ao carregar o componente
  useEffect(() => {
    // Verifica se o usuário está logado
    if (isUserLoggedIn()) {
      const userInfo = getUserData();      
      if (userInfo) {
        setUserId(userInfo.id);        
        setUserPhoto(userInfo.photo || '/images/11.jpg');
        
        // Adicionar verificação de venda1
        const checkPermission = async () => {
          try {
            const response = await fetch(`/api/users/${userInfo.id}`);
            const data = await response.json();
            
            setHasVenda1(data.data?.venda1 === true);
          } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            setHasVenda1(false); // Por segurança, define como false em caso de erro
          }
        };

        checkPermission(); // Chamar a verificação
        
        // Buscar matches do usuário para remover perfis já curtidos
        buscarMatches(userInfo.id);
        
        // Obter dados completos do usuário
        const dadosUsuario = obterDadosUsuario();
        if (dadosUsuario) {
          setUserData(dadosUsuario);
          
          // Verificar e inicializar o array de notificações se não existir
          if (!dadosUsuario.notificacoes) {
            atualizarDadosUsuario({ notificacoes: [] });
          } else {
            setNotificacoesUsuario(dadosUsuario.notificacoes);
          }
        }
        
        // Define os perfisDisponiveis com mulheres
        setPerfisDisponiveis(mulheres);
      } else {
        redirectWithUtm('/login');      
      }
    } else {
      redirectWithUtm('/login');
    }

    // Gerar número aleatório entre 1 e 3 para likes até match
    const randomLikes = Math.floor(Math.random() * 3) + 1;   
    setLikesAteMatch(randomLikes);
  }, []);
  
  // Gerenciador de notificações
  useEffect(() => {
    if (perfisDisponiveis.length > 0 && userData) {
      // Função para agendar a próxima notificação
      const agendarProximaNotificacao = () => {
        // Pegar todas as notificações disponíveis de todos os perfis
        const todasNotificacoes = perfisDisponiveis.flatMap(perfil => 
          perfil.notificacoes?.map(notif => ({...notif, perfilId: perfil.id})) || []
        );
        
        if (todasNotificacoes.length > 0) {
          // Contador de notificações global
          if (typeof window !== 'undefined') {
            window.notificacoesExibidas = window.notificacoesExibidas || 0;
          }
          
          // Determinar o intervalo com base no número de notificações já exibidas
          let intervalo;
          if (window.notificacoesExibidas === 0) {
            intervalo = 5000; // Primeira notificação após 5s
          } else if (window.notificacoesExibidas < 3) {
            intervalo = 10000; // Segunda e terceira notificações a cada 10s
          } else {
            intervalo = 30000; // Notificações seguintes a cada 30s
          }
          
          // Debug para mostrar quando será a próxima notificação
          
          
          timer1 = setTimeout(() => {
            // Seleciona uma notificação aleatória
            const randomIndex = Math.floor(Math.random() * todasNotificacoes.length);
            const notificacaoRandom = todasNotificacoes[randomIndex];
            
            // Armazenar a notificação no localStorage do usuário
            const notificacaoParaSalvar = {
              ...notificacaoRandom,
              id: Date.now(), // Identificador único
              dataCriacao: new Date().toISOString(),
              tipo: 'curtida', // Tipo de notificação
              lida: false
            };
            
            // Adicionar ao localStorage e atualizar notificações do usuário
            adicionarNotificacao(notificacaoParaSalvar);
            
            // Atualizar o estado local
            const notificacoesAtualizadas = obterNotificacoes();
            setNotificacoesUsuario(notificacoesAtualizadas);
            
            // Mostrar a notificação na interface
            setNotificacaoAtual(notificacaoRandom);
            setShowNotification(true);
            window.notificacoesExibidas += 1;
            
            
            
            // Timer para esconder a notificação
            timer2 = setTimeout(() => {
              setShowNotification(false); // Esconder notificação
              
              // Agendar próxima notificação após esta desaparecer
              agendarProximaNotificacao();
            }, 5000); // Manter visível por 5 segundos
          }, intervalo);
        }
      };
      
      // Iniciar o ciclo de notificações
      agendarProximaNotificacao();
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [perfisDisponiveis, userData]);
  
  // Função para lidar com o clique na notificação
  const handleNotificationClick = () => {
    if (!hasVenda1) {
      setShowCurtidasPopup(true);
      return;
    }

    // Se tiver venda1, redireciona para /likes
    redirectWithUtm('/likes');
  };
  
  // Função para abrir o modal premium a partir do modal de curtidas
  const handleOpenPremiumModal = () => {
    setShowCurtidasPopup(false);
    // Sempre abrir a versão alternativa do modal premium (14,90)
    setShowAlternativePremiumPopup(true);
  };

  // Função para buscar matches do usuário
  const buscarMatches = async (id) => {
    try {
      const response = await fetch(`/api/matches?userId=${id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar matches');
      }
      
      const data = await response.json();      
      let matchIds = data.matches;

      // Verificar e atualizar o localStorage com os ids de matches
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        if (!userObj.idmatches) {
          // Se não existir idmatches, criar e popular
          userObj.idmatches = matchIds;
          localStorage.setItem('user', JSON.stringify(userObj));
          
        }
      }
      
      //se nao tiver matches
      if (!data || !data.matches) {
        matchIds = [];
        setPerfisDisponiveis(mulheres);
        setCarregando(false);
        return;
      }
      if(matchIds.length == 0){
        setPerfisDisponiveis(mulheres);
      }else{
      const perfisRestantes = mulheres.filter(perfil => !matchIds.includes(perfil.id));
        setPerfisDisponiveis(perfisRestantes);
      }
      
      setMatches(data.matches)
      setCarregando(false);
    
    } catch (error) {
      console.error('Erro ao buscar matches:', error);
      setMatches([]);
      setPerfisDisponiveis([]);
      setCarregando(false);
    }

  };

  // Função para registrar match no banco de dados
  const registrarMatch = async (matchId) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/matches/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
          userId: userId,
          matchId: matchId
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao registrar match');
      }
      
      const data = await response.json();
      setMatches(data.matches);
      
      // Atualizar o localStorage com o novo match
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        if (userObj.idmatches) {
          // Se já existir, adicionar o novo match se não estiver lá
          if (!userObj.idmatches.includes(matchId)) {
            userObj.idmatches.push(matchId);
          }
        } else {
          // Se não existir, criar com o novo match
          userObj.idmatches = [matchId];
        }
        localStorage.setItem('user', JSON.stringify(userObj));
        
      }
      
      // Adicionando notificação de novo match
      const perfilMatch = perfisDisponiveis.find(p => p.id === matchId);
      if (perfilMatch) {
        const notificacaoMatch = {
          tipo: 'match',
          mensagem: `Você deu match com ${perfilMatch.nome}!`,
          imagem: perfilMatch.imagem || '/images/default.jpg',
          nome: perfilMatch.nome,
          perfilId: perfilMatch.id,
          distancia: perfilMatch.distancia || 'desconhecida',
          tempo: 'agora',
          dataCriacao: new Date().toISOString(),
          lida: false
        };
        
        adicionarNotificacao(notificacaoMatch);
      }
    } catch (error) {
      console.error('Erro ao registrar match:', error);
    } 
  };
  
  // Função para dar like em um perfil
  const handleLike = () => {
    if (carregando || perfisDisponiveis.length === 0) return;
    
    setShowHeart(true);
    
    // Incrementar o contador de likes
    const newLikeCount = likeCount + 1;
    setLikeCount(newLikeCount);
    
    // Verificar se deve ser um match 
    // Quando o contador atinge o número definido para o match
    const shouldMatch = newLikeCount === likesAteMatch;
    
    
    if (shouldMatch) {
      const perfilMatch = perfisDisponiveis[perfilAtual];
      setCurrentMatch(perfilMatch);
      
      // Registrar match no banco de dados
      registrarMatch(perfilMatch.id);
      
      setTimeout(() => {
        setShowHeart(false);
        setShowMatch(true);
        
        // Após 3 segundos, fecha o popup de match e redireciona para chat
        setTimeout(() => {
          setShowMatch(false);
          
          // Resetar o contador após um match
          setLikeCount(0);
          
          // Definir um novo número de likes até o próximo match
          const newRandomLikes = Math.floor(Math.random() * 3) + 1;
          
          setLikesAteMatch(newRandomLikes);
          
          // Redirecionar para chat
          redirectToChat(perfilMatch);
        }, 3000);        
      }, 500);
    } else {
      setTimeout(() => {
        setShowHeart(false);
        // Em um app real, aqui enviaria o like para o servidor
        nextPerfil();
      }, 500);
    }
  };
  
  // Função para dar dislike em um perfil
  const handleDislike = () => {
    if (carregando || perfisDisponiveis.length === 0) return;
    
    setShowX(true);
    
    setTimeout(() => {
      setShowX(false);
      // Em um app real, aqui enviaria o dislike para o servidor
      nextPerfil();
    }, 500);
  };
  
  // Função para ir para o próximo perfil
  const nextPerfil = () => {
    if (perfilAtual < perfisDisponiveis.length - 1) {
      setPerfilAtual(perfilAtual + 1);
    } else {
      // Todos os perfis foram visualizados
      setPerfilEncontrado(false);
      // Depois de 3 segundos, redirecionamos para a página de contatos
      setTimeout(() => {
        redirectWithUtm('/contatos');
      }, 3000);
    }
  };

  // Função para redirecionar para a conversa com o match
  const redirectToChat = (matchedProfile) => {
    // Salvar o perfil de match atual no localStorage para ser recuperado na página de contatos
    localStorage.setItem('currentMatch', JSON.stringify(matchedProfile));
    redirectWithUtm('/contatos');
  };

  // Modificar a função desbloquearPremium
  const desbloquearPremium = () => {
    // Abrir link em nova aba
    window.open("https://pay.kirvano.com/3f46f32c-4963-497b-bdb0-8cc9a88f7b85", "_blank");
    // Não fechamos mais a modal (remover setShowAlternativePremiumPopup(false))
  };

  // Dados para exibir durante o carregamento
  if (carregando) {
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
          <div>Carregando perfis...</div>
        </div>
      </div>
    );
  }

  // Verificar se não há mais perfis disponíveis
  if (perfisDisponiveis.length === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#8319C1', marginBottom: '20px' }}>Não há mais perfis disponíveis no momento!</h2>
        <p>Volte mais tarde ou experimente verificar suas conversas atuais.</p>
        <button
          onClick={() => redirectWithUtm('/contatos')}
          style={{
            backgroundColor: '#8319C1',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Ver Contatos
        </button>
      </div>
    );
  }

  return (
    <div className='container' style={{
      height: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <Head>
        <title>Encontre Coroas - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />        
      </Head>

      {/* Header bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: '#252525',
        boxShadow: '2px 2px 10px rgb(57, 0, 83)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1px 1px',
        height: '45px' // Defina uma altura fixa menor
      }}>
        <img src="/images/logoNome.png" alt="Minha Coroa" width="130px" style={{ marginLeft: '5px', padding: '5px' }} />
        <p style={{ marginRight: '15px', color: 'rgb(255, 255, 255)', fontSize: '11px' }}>
          Saldo <span style={{ border: 'solid 1px rgb(147, 0, 245)', padding: '3px 8px', borderRadius: '20px', fontSize: '13px' }}>
            R$0,00
          </span>
        </p>
      </header>

      <main style={{
        background: `url('/images/fundo.svg') center/cover no-repeat`,
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        color: 'rgb(75, 75, 75)',
        height: '100vh',
        overflow: 'hidden',
        paddingTop: '45px', // Ajustado para o novo header
        paddingBottom: '60px' // Espaço para o BottomNavigation
      }}>
        <div style={{
          width: '95%',
          maxWidth: '500px',
          borderRadius: '10px',
          position: 'relative',
          color: 'rgb(107, 107, 107)'
        }}>
          {perfilEncontrado ? (
            <>
              <div style={{
                position: 'relative',
                backgroundImage: `url(${perfisDisponiveis[perfilAtual].imagem})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '75vh', // Reduzido de 85vh para 75vh (10% menor)
                display: 'flex',
                alignItems: 'flex-end',
                padding: '20px',
                color: 'white',
                marginBottom: '0',
                borderRadius: '15px',
                marginTop: '10px' // Reduzido de 20px para 10px
              }}>
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '15px',
                  borderRadius: '10px',
                  width: '100%'
                }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>{perfisDisponiveis[perfilAtual].nome}</h3>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>{perfisDisponiveis[perfilAtual].distancia} de distância</p>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>{perfisDisponiveis[perfilAtual].descricao}</p>
                  
                  {/* Tags de interesse */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                    {perfisDisponiveis[perfilAtual].interesses.map((interesse, idx) => (
                      <span 
                        key={idx} 
                        style={{
                          backgroundColor: 'rgba(185, 65, 255, 0.7)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '15px',
                          fontSize: '12px'
                        }}
                      >
                        {interesse}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Botões de like/dislike */}
                <div style={{
                  position: 'absolute',
                  bottom: '-85px', // Reduzido para ficar mais próximo
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '20px',
                  zIndex: 10
                }}>
                  <button
                    onClick={handleDislike}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundImage: "url('/images/x.svg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      fontSize: '24px',
                      border: 'none'
                    }}
                  />
                  
                  <button
                    onClick={handleLike}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundImage: "url('/images/coracao.svg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      fontSize: '24px',
                      border: 'none'
                    }}
                  />
                </div>
                
                {/* Ícone de coração (para like) */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '100px',
                  opacity: showHeart ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  color: '#FF4D67'
                }}>
                  ❤️
                </div>
                
                {/* Ícone de X (para dislike) */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '100px',
                  opacity: showX ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  color: 'red'
                }}>
                  💔
                </div>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              textAlign: 'center',
              padding: '0 30px'
            }}>
              <img src="/images/logoCoroa.png" alt="Logo Minha Coroa" width="120px" />
              <h2 style={{ margin: '20px 0', color: '#8319C1' }}>Parabéns!</h2>
              <p style={{ color: '#666' }}>Você já viu todos os perfis disponíveis na sua região. Em instantes você será redirecionado para conversar com quem deu match com você!</p>
            </div>
          )}
        </div>
        
        {/* Notificação estilo celular */}
        {showNotification && notificacaoAtual && (
          <div
            className="mobile-notification"
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '350px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center', 
              zIndex: 999999999999999999999999999999999999999999999999999999999999,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              animation: 'slideIn 0.5s forwards'           
            }}
            onClick={handleNotificationClick}
          >          
            <div style={{ position: 'relative', marginRight: '15px' }}>
              <img 
                src={notificacaoAtual.imagem} 
                alt={notificacaoAtual.nome} 
                className="notification-icon"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  filter: hasVenda1 ? 'none' : 'blur(2px)' // Remover blur se hasVenda1
                }}
              />
              {/* Mostrar cadeado apenas se não tiver venda1 */}
              {!hasVenda1 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '16px',
                  color: 'white'
                }}>
                  🔒
                </div>
              )}
            </div>
            <div className="notification-content" style={{ flex: 1 }}>         
              <div className="notification-title" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {notificacaoAtual.nome} 
                <span className="distance" style={{ fontWeight: 'normal', fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                  {notificacaoAtual.distancia} de distância
                </span>
              </div>
              <div className="notification-message" style={{ fontSize: '14px', marginTop: '3px' }}>
                {notificacaoAtual.mensagem}
              </div>
              <div className="notification-app" style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                {notificacaoAtual.tempo}
              </div>
            </div>
          </div>
        )}
        
        {/* Popup de match */}
        {showMatch && currentMatch && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.5s forwards'
          }}>
            <div style={{ 
              color: 'white', 
              fontSize: '48px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              É um Match! 🎉
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '30px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid white'
              }}>
                <img 
                  src={userPhoto} 
                  alt="Seu perfil" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid white'
              }}>
                <img 
                  src={currentMatch.imagem} 
                  alt={currentMatch.nome} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
            <div style={{ color: 'white', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>
              Vocês se curtiram! Agora é só conversar.
            </div>
            <button
              onClick={() => {
                setShowMatch(false);
                redirectToChat(currentMatch);
              }}
              style={{
                background: 'linear-gradient(to right, #420079, #ae00ff)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Conversar agora
            </button>
          </div>
        )}
        
        {/* Popup de Veja quem curtiu você */}
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
              <p style={{ fontSize: '18px', marginBottom: '15px' }}>3 pessoas curtiram seu perfil recentemente</p>
              <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>Elas estão esperando você responder!</p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '20px'
            }}>
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
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              Assinantes premium recebem média de <b>3x mais matches</b>
            </div>
          </div>
        )}
        
        {/* Popup de Premium (Versão Original) */}
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
              R$ 27,90 <span style={{ fontSize: '16px', opacity: '0.8', fontWeight: 'normal' }}><br/>(pagamento único)</span>
            </div>
            <div style={{ textAlign: 'left', marginLeft: '30px', marginBottom: '40px', fontSize: '14px' }}>
              <p>Ao assinar o pacote você possui acesso a:</p>
              <p><span style={{ color: '#ae00ff' }}>• </span> 100 Curtidas</p>
              <p><span style={{ color: '#ae00ff' }}>• </span> Acesso ilimitado ao chat</p>
              <p><span style={{ color: '#ae00ff' }}>• </span> Ver quem curtiu você</p>
              <p><span style={{ color: '#ae00ff' }}>• </span> Múltiplos matches simultâneos</p>
            </div>
            <button 
              onClick={() => setShowPremiumPopup(false)}
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
            <div style={{ fontSize: '12px', opacity: '0.7', margin: '10px 0' }}>
              Ao prosseguir, você concorda com nossos termos de uso e política de privacidade.
            </div>
          </div>
        )}
        
        {/* Popup de Premium - Versão Alternativa */}
        {showAlternativePremiumPopup && (
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
              onClick={() => setShowAlternativePremiumPopup(false)}
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
      </main>
      
      {/* Adicionar BottomNavigation */}
      <BottomNavigation />
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            top: 30px; /* Ajustado para o header menor */
          }
          to {
            top: 60px; /* Ajustado para o header menor */
          }
        }

        @keyframes slideOut {
          from {
            top: 60px; /* Ajustado para o header menor */
          }
          to {
            top: 30px; /* Ajustado para o header menor */
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
  
};
