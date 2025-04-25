import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import LoadingSpinner from '../../components/LoadingSpinner';
import { isUserLoggedIn, getUserData, getAuthHeaders } from '../../lib/auth';
import mockData from '../../data/mock';
import BottomNavigation from '../../components/BottomNavigation';
import { 
  getCurrentMatch, 
  clearCurrentMatch,
  processMatchIds,
  extractContactInfo,
  getMatchesFromDatabase
} from '../../lib/match-utils';
import {
  getConversas,
  salvarConversa,
  getConversa,
  inicializarConversa,
  isOnline
} from '../../lib/chat-utils';
import { contatosBase } from '../../data/mock';
import { obterTodasConversasLocal } from '../../data/conversas';

// Tempo entre verificações automáticas em milissegundos (aumentado para reduzir requests)
const POLLING_INTERVAL = 30000; // 30 segundos
// Tempo de expiração do cache em milissegundos (10 minutos)
const CACHE_EXPIRY = 10 * 60 * 1000;

// Funções de cache para matches
const saveMatchesToCache = (userId, matches) => {
  try {
    const cacheData = {
      matches,
      timestamp: Date.now()
    };
    localStorage.setItem(`matches_cache_${userId}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
};

const getMatchesFromCache = (userId) => {
  try {
    const cacheData = localStorage.getItem(`matches_cache_${userId}`);
    if (!cacheData) return null;
    
    const { matches, timestamp } = JSON.parse(cacheData);
    const agora = Date.now();
    
    // Verificar se o cache expirou
    if (agora - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`matches_cache_${userId}`);
      return null;
    }
    
    return matches;
  } catch (error) {
    console.error('Erro ao recuperar cache:', error);
    return null;
  }
};

// Componente de estilos global
function GlobalStyles() {
  return (
    <style jsx global>{`
      body {
        margin: 0;
        padding: 0;
        font-family: 'Poppins', sans-serif;
      }
      * {
        box-sizing: border-box;
      }
    `}</style>
  );
}

export default function Contatos() {
  const { redirectWithUtm } = useUtmParams();
  const [contatoAtivo, setContatoAtivo] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [contatosLista, setContatosLista] = useState([]);
  const [showMobile, setShowMobile] = useState('lista'); // 'lista' ou 'chat'
  const [currentMatch, setCurrentMatch] = useState(null);
  const [userId, setUserId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ultimaVerificacao, setUltimaVerificacao] = useState(0);
  
  // Função para verificar se há um novo match no localStorage
  const verificarNovoMatch = useCallback(async () => {
    try {
      // Recuperar o match atual do localStorage
      const matchedProfile = getCurrentMatch();
      
      if (matchedProfile) {
        console.log('Novo match encontrado:', matchedProfile.nome);
        setCurrentMatch(matchedProfile);
        
        // Extrair apenas primeiro nome
        const nomePrimeiro = matchedProfile.nome.includes(',') 
          ? matchedProfile.nome.split(',')[0] 
          : matchedProfile.nome;
        
        // Verificar se já existe uma conversa com este match
        const conversaExistente = getConversa(userId, matchedProfile.id);
        
        // Criar um contato a partir do match
        const novoContato = {
          id: matchedProfile.id,
          nome: nomePrimeiro,
          imagem: matchedProfile.foto || matchedProfile.imagem,
          online: isOnline(matchedProfile.id) // Status online consistente
        };
        
        // Adicionar dados da conversa
        if (conversaExistente) {
          // Usar conversa existente
          novoContato.mensagens = conversaExistente.mensagens;
          novoContato.ultimaMensagem = conversaExistente.ultimaMensagem;
          novoContato.horaUltimaMensagem = conversaExistente.horaUltimaMensagem;
        } else {
          // Inicializar nova conversa
          const novaConversa = inicializarConversa(matchedProfile);
          novoContato.mensagens = novaConversa.mensagens;
          novoContato.ultimaMensagem = novaConversa.ultimaMensagem;
          novoContato.horaUltimaMensagem = novaConversa.horaUltimaMensagem;
        }
        
        // Adicionar à lista de contatos se não existir
        setContatosLista(contatos => {
          // Verificar se já existe
          const contatoExistente = contatos.find(c => c.id === novoContato.id);
          if (contatoExistente) return contatos;
          
          return [novoContato, ...contatos];
        });
        
        // Ativar automaticamente a conversa com o match
        setContatoAtivo(novoContato);
        setShowMobile('chat');
        
        // Remover do localStorage para não mostrar novamente
        clearCurrentMatch();
        
        return true; // Indica que um novo match foi processado
      }
      
      return false; // Nenhum novo match encontrado
    } catch (error) {
      console.error('Erro ao processar novo match:', error);
      return false;
    }
  }, [userId]);
  
  // Função principal para verificar matches e atualizar a lista de contatos
  const verificarMatches = useCallback(async (userId, forceUpdate = false) => {
    try {
      // Skip se foi verificado recentemente e não é update forçado
      const agora = Date.now();
      const tempoDecorrido = agora - ultimaVerificacao;
      
      if (!forceUpdate && tempoDecorrido < POLLING_INTERVAL && contatosLista.length > 0) {
        return;
      }
      
      // Limitar a frequência de requisições mesmo com forceUpdate
      if (tempoDecorrido < 2000) {
        return; // Não permitir mais de uma requisição a cada 2 segundos
      }
      
      // Definir estado de carregamento
      setCarregando(true);
      
      // Tentar usar dados em cache primeiro se não for uma atualização forçada
      if (!forceUpdate) {
        const cachedMatches = getMatchesFromCache(userId);
        if (cachedMatches && cachedMatches.length > 0) {
          console.log('Usando matches do cache:', cachedMatches.length);
          
          // Criar objetos de contato a partir dos matchIds em cache
          const perfilMatches = processMatchIds(cachedMatches);
          
          // Processar contatos como normalmente faria
          const contatosMatches = perfilMatches.map(perfil => {
            // Info básica do contato
            const infoContato = extractContactInfo(perfil);
            
            // Definir status online de forma consistente
            infoContato.online = isOnline(perfil.id);
            
            // Verificar se já existe uma conversa salva para este contato
            const conversaExistente = getConversa(userId, perfil.id);
            
            if (conversaExistente) {
              // Usar dados da conversa existente
              return {
                ...infoContato,
                ultimaMensagem: conversaExistente.ultimaMensagem,
                horaUltimaMensagem: conversaExistente.horaUltimaMensagem,
                mensagens: conversaExistente.mensagens
              };
            }
            
            // Verificar se já existe na lista atual para preservar mensagens
            const contatoExistente = contatosLista.find(c => c.id === perfil.id);
            
            if (contatoExistente) {
              return {
                ...infoContato,
                ultimaMensagem: contatoExistente.ultimaMensagem,
                horaUltimaMensagem: contatoExistente.horaUltimaMensagem,
                mensagens: contatoExistente.mensagens
              };
            }
            
            // Caso seja um novo contato, inicializar conversa
            const novaConversa = inicializarConversa(perfil);
            return {
              ...infoContato,
              ultimaMensagem: novaConversa.ultimaMensagem,
              horaUltimaMensagem: novaConversa.horaUltimaMensagem,
              mensagens: novaConversa.mensagens
            };
          });
          
          setContatosLista(contatosMatches);
          await verificarNovoMatch();
          setCarregando(false);
          setUltimaVerificacao(agora);
          
          // Fazer uma verificação em background para atualizar o cache
          setTimeout(() => {
            verificarMatchesBackground(userId);
          }, 1000);
          
          return;
        }
      }
      
      console.log('Verificando matches para usuário:', userId);
      
      // Buscar matches diretamente do banco de dados
      const matchIds = await getMatchesFromDatabase(userId);
      console.log('IDs de match encontrados:', matchIds);
      
      // Atualizar o timestamp da última verificação
      setUltimaVerificacao(agora);
      
      // Salvar no cache
      if (matchIds && matchIds.length > 0) {
        saveMatchesToCache(userId, matchIds);
      }
      
      // Se não houver matches, verificar apenas os da localStorage
      if (!matchIds || matchIds.length === 0) {
        await verificarNovoMatch();
        setCarregando(false);
        return;
      }
      
      // Processar os IDs de match para obter objetos de perfil completos
      const perfilMatches = processMatchIds(matchIds);
      console.log('Perfis de match processados:', perfilMatches.length);
      
      // Criar objetos de contato a partir dos perfis
      const contatosMatches = perfilMatches.map(perfil => {
        // Info básica do contato
        const infoContato = extractContactInfo(perfil);
        
        // Definir status online de forma consistente
        infoContato.online = isOnline(perfil.id);
        
        // Verificar se já existe uma conversa salva para este contato
        const conversaExistente = getConversa(userId, perfil.id);
        
        if (conversaExistente) {
          // Usar dados da conversa existente
          return {
            ...infoContato,
            ultimaMensagem: conversaExistente.ultimaMensagem,
            horaUltimaMensagem: conversaExistente.horaUltimaMensagem,
            mensagens: conversaExistente.mensagens
          };
        }
        
        // Verificar se já existe na lista atual para preservar mensagens
        const contatoExistente = contatosLista.find(c => c.id === perfil.id);
        
        if (contatoExistente) {
          return {
            ...infoContato,
            ultimaMensagem: contatoExistente.ultimaMensagem,
            horaUltimaMensagem: contatoExistente.horaUltimaMensagem,
            mensagens: contatoExistente.mensagens
          };
        }
        
        // Caso seja um novo contato, inicializar conversa
        const novaConversa = inicializarConversa(perfil);
        return {
          ...infoContato,
          ultimaMensagem: novaConversa.ultimaMensagem,
          horaUltimaMensagem: novaConversa.horaUltimaMensagem,
          mensagens: novaConversa.mensagens
        };
      });
      
      // Atualizar lista de contatos
      setContatosLista(contatosMatches);
      
      // Verificar também se há um novo match no localStorage
      await verificarNovoMatch();
      
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao verificar matches:', error);
      setCarregando(false);
    }
  }, [verificarNovoMatch, contatosLista, ultimaVerificacao]);
  
  // Função para verificar matches em background (sem atualizar UI)
  const verificarMatchesBackground = async (userId) => {
    try {
      console.log('Verificando matches em background...');
      const matchIds = await getMatchesFromDatabase(userId);
      
      if (matchIds && matchIds.length > 0) {
        // Apenas atualizar o cache
        saveMatchesToCache(userId, matchIds);
        console.log('Cache atualizado em background');
      }
    } catch (error) {
      console.error('Erro ao verificar matches em background:', error);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    if (isUserLoggedIn()) {
      console.log("Contatos: Usuário logado, carregando dados...");
      const userInfo = getUserData();
      setUserId(userInfo.id);
      
      console.log("Contatos: Carregando conversas do localStorage...");
      // Carregar conversas do localStorage
      const conversas = obterTodasConversasLocal(userInfo.id);
      console.log("Contatos: Conversas locais carregadas:", Object.keys(conversas).length);
      
      // Combinar dados mockados com conversas salvas
      const contatosAtualizados = contatosBase.map(contato => {
        const conversaSalva = conversas[contato.id];
        if (conversaSalva) {
          console.log(`Contatos: Conversa salva encontrada para ${contato.nome}`);
          return {
            ...contato,
            ...conversaSalva
          };
        }
        return contato;
      });
      
      console.log("Contatos: Contatos atualizados:", contatosAtualizados.length);
      setContatosLista(contatosAtualizados);
      
      // Fazer a primeira verificação de matches aqui
      if (!window.matchesCarregados) {
        console.log("Contatos: Primeira carga de matches...");
        window.matchesCarregados = true;
        verificarMatches(userInfo.id, true);
      }
      
      setCarregando(false);
    } else {
      console.log("Contatos: Usuário não logado, redirecionando...");
      redirectWithUtm('/login');
    }
  }, []);
  
  // Modificar o useEffect de polling
  useEffect(() => {
    if (!userId) return;
    
    // Remover verificação inicial aqui, já que foi movida para o primeiro useEffect
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        verificarMatches(userId, false);
      }
    }, POLLING_INTERVAL * 5);
    
    return () => clearInterval(pollInterval);
  }, [userId, verificarMatches]);
  
  // Função para selecionar um contato
  const selecionarContato = (id) => {
    setContatoAtivo(contatosLista.find(c => c.id === id));
    setShowMobile('chat');
  };
  
  // Voltar para a lista em modo mobile
  const voltarParaLista = () => {
    setShowMobile('lista');
  };
  
  // Função para enviar mensagem
  const enviarMensagem = (e) => {
    e.preventDefault();
    
    if (mensagem.trim() === '' || !contatoAtivo) return;
    
    const novaMensagem = {
      id: contatoAtivo.mensagens.length + 1,
      texto: mensagem,
      enviada: true,
      hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    // Atualizando o contato ativo com a nova mensagem
    const contatoAtualizado = {
      ...contatoAtivo,
      mensagens: [...contatoAtivo.mensagens, novaMensagem],
      ultimaMensagem: mensagem,
      horaUltimaMensagem: novaMensagem.hora
    };
    
    // Atualizando a lista de contatos
    const novosContatos = contatosLista.map(c => 
      c.id === contatoAtivo.id ? contatoAtualizado : c
    );
    
    setContatosLista(novosContatos);
    setContatoAtivo(contatoAtualizado);
    setMensagem('');
    
    // Salvar conversa no localStorage
    if (userId) {
      salvarConversa(
        userId, 
        contatoAtivo.id, 
        contatoAtualizado.mensagens, 
        contatoAtualizado.ultimaMensagem, 
        contatoAtualizado.horaUltimaMensagem
      );
    }
    
    // Simular resposta automática após 1-3 segundos
    setTimeout(() => {
      // Resposta automática a partir do mockData
      const resposta = mockData.getRespostaAutomatica();
      
      const respostaMensagem = {
        id: contatoAtualizado.mensagens.length + 1,
        texto: resposta,
        enviada: false,
        hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      // Atualizar o contato ativo com a resposta
      const contatoComResposta = {
        ...contatoAtualizado,
        mensagens: [...contatoAtualizado.mensagens, respostaMensagem],
        ultimaMensagem: resposta,
        horaUltimaMensagem: respostaMensagem.hora
      };
      
      // Atualizar a lista de contatos
      const novosContatosComResposta = contatosLista.map(c => 
        c.id === contatoAtivo.id ? contatoComResposta : c
      );
      
      setContatosLista(novosContatosComResposta);
      
      if (contatoAtivo.id === contatoAtualizado.id) {
        setContatoAtivo(contatoComResposta);
      }
      
      // Salvar conversa atualizada no localStorage
      if (userId) {
        salvarConversa(
          userId, 
          contatoAtivo.id, 
          contatoComResposta.mensagens, 
          contatoComResposta.ultimaMensagem, 
          contatoComResposta.horaUltimaMensagem
        );
      }
    }, Math.random() * 2000 + 1000); // Entre 1 e 3 segundos
  };

  // Função para renderizar os contatos
  const renderContatos = () => {
    if (contatosLista.length === 0) {
      return (
        <div className="sem-contatos" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '20px',
          textAlign: 'center',
          color: '#666'
        }}>
          <img 
            src="/images/empty-chat.svg" 
            alt="Sem contatos" 
            style={{ width: '80px', marginBottom: '20px', opacity: 0.5 }}
          />
          <h3 style={{ margin: '0 0 10px', color: '#8319C1' }}>Sem matches ainda</h3>
          <p>
            Volte para a timeline e dê likes em mais perfis para conseguir matches!
          </p>
          <button
            onClick={() => redirectWithUtm('/curtidas')}
            style={{
              backgroundColor: '#8319C1',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              marginTop: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ir para Timeline
          </button>
        </div>
      );
    }
    
    return contatosLista.map(contato => (
      <div 
        key={contato.id} 
        className={`contato-item ${contatoAtivo?.id === contato.id ? 'ativo' : ''}`}
        onClick={() => selecionarContato(contato.id)}
        style={{
          display: 'flex',
          padding: '15px',
          cursor: 'pointer',
          backgroundColor: 'black',          
        }}
      >
        <div className="contato-foto" style={{
          position: 'relative',
          marginRight: '15px'
        }}>
          <img 
            src={contato.imagem} 
            alt={contato.nome} 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          {contato.online && (
            <span style={{
              position: 'absolute',
              bottom: '3px',
              right: '3px',
              width: '12px',
              height: '12px',
              backgroundColor: '#4CAF50',
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          )}
        </div>
        <div className="contato-info" style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold'
            }}>{contato.nome}</h3>
            <span style={{
              fontSize: '12px',
              color: '#999'
            }}>{contato.horaUltimaMensagem}</span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#666',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{contato.ultimaMensagem}</p>
        </div>
      </div>
    ));
  };
  
  // Função para renderizar as mensagens do chat ativo
  const renderMensagens = () => {
    if (!contatoAtivo) return null;
    
    return (
      <div className="mensagens-container" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '15px',
        paddingBottom: '80px', // Espaço para o input não cobrir as mensagens
        overflow: 'auto',
        flex: 1,
        backgroundImage: `url('/images/fundoConversa.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {contatoAtivo.mensagens.map(msg => (
          <div 
            key={msg.id} 
            className={`mensagem ${msg.enviada ? 'enviada' : 'recebida'}`}
            style={{
              alignSelf: msg.enviada ? 'flex-end' : 'flex-start',
              backgroundColor: msg.enviada ? '#DCF8C6' : 'white',
              color: msg.enviada ? '#333' : '#333',
              padding: '10px 15px',
              borderRadius: msg.enviada ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              margin: '5px 0',
              maxWidth: '80%',
              position: 'relative',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontSize: '14px' }}>{msg.texto}</div>
            <div style={{
              fontSize: '10px',
              opacity: 0.7,
              textAlign: 'right',
              marginTop: '5px'
            }}>{msg.hora}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Função para renderizar o formulário de envio de mensagem
  const renderFormulario = () => {
    if (!contatoAtivo) return null;
    
    return (
      <div 
        id="input-container2" 
        className="input-container2"
        style={{
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          gap: '10px',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '15px',
          padding: '10px',
          borderRadius: '42px',
          zIndex: 99,
          backgroundColor: 'rgb(34, 34, 34)'
        }}
      >
        <form 
          onSubmit={enviarMensagem}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            id="user-input2"
            className="user-input2"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            style={{
              background: 'none',
              color: 'white',
              fontSize: '16px',
              boxShadow: 'none',
              border: 'none',
              outline: 'none',
              flex: 1,
              padding: '10px 15px'
            }}
          />
          <button
            type="submit"
            disabled={mensagem.trim() === ''}
            style={{
              background: mensagem.trim() === '' ? '#555' : 'linear-gradient(to bottom, #801AB8, #C922FC, #801AB8)',
              padding: '10px',
              borderRadius: '100%',
              border: 'none',
              marginLeft: '-20px',
              cursor: mensagem.trim() === '' ? 'default' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: mensagem.trim() === '' ? 0.5 : 1
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    );
  };
  
  // Interface principal
  return (
    <div style={{
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif',
      backgroundImage: `url('/images/fundoConversa.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <Head>
        <title>Meus Matches - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        background: 'linear-gradient(45deg, #8319C1, #b941ff, #8319C1)',
        color: 'white',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: showMobile === 'chat' ? 'flex-start' : 'center'
      }}>
        {showMobile === 'chat' && (
          <button
            onClick={voltarParaLista}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              padding: '10px',
              marginRight: '5px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {showMobile === 'chat' && contatoAtivo ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={contatoAtivo.imagem} 
              alt={contatoAtivo.nome} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '10px'
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', color: 'white' }}>{contatoAtivo.nome}</h2>
              <span style={{ 
                fontSize: '12px', 
                color: contatoAtivo.online ? '#4CAF50' : '#e0e0e0' 
              }}>
                {contatoAtivo.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ) : (
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px',
            color: 'white'
          }}>
            Meus Matches
          </h1>
        )}
        
        {showMobile === 'chat' && (
          <div style={{ width: '20px' }} /* Espaço para centralizar o título */
          ></div>
        )}
      </header>
      
      {/* Conteúdo principal */}
      <main style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        backgroundImage: `url('/images/fundoConversa.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Lista de contatos (visível apenas em desktop ou mobile lista) */}
        <div className="contatos-lista" style={{
          width: '100%',
          overflowY: 'auto',
          display: showMobile === 'lista' ? 'block' : 'none'
        }}>
          {carregando ? (
            <LoadingSpinner />
          ) : (
            renderContatos()
          )}
        </div>
        
        {/* Chat (visível apenas em desktop ou mobile chat) */}
        <div className="chat-area" style={{
          flex: 1,
          display: showMobile === 'chat' ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundImage: `url('/images/fundoConversa.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {contatoAtivo ? (
            <>
              {renderMensagens()}
              {renderFormulario()}
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <img 
                src="/images/select-chat.svg" 
                alt="Selecione um chat" 
                style={{ width: '80px', marginBottom: '20px', opacity: 0.5 }}
              />
              <p>Selecione um chat para começar a conversar</p>
            </div>
          )}
        </div>
      </main>
      {showMobile === 'lista' && <BottomNavigation />}
      {/* Estilos globais */}
      <GlobalStyles />
    </div>
  );
} 