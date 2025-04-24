import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import { isUserLoggedIn, getUserData, getAuthHeaders } from '../../lib/auth';
import dadosContatos from './contatos-data.json';

export default function Contatos() {
  const { redirectWithUtm } = useUtmParams();
  const [contatoAtivo, setContatoAtivo] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [contatosLista, setContatosLista] = useState([]);
  const [showMobile, setShowMobile] = useState('lista'); // 'lista' ou 'chat'
  const [currentMatch, setCurrentMatch] = useState(null);
  const [userId, setUserId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [perfisMock, setPerfisMock] = useState([]);
  
  // Função para obter uma mensagem inicial aleatória
  const getMensagemInicial = () => {
    const mensagensIniciais = dadosContatos.mensagensIniciais;
    const indice = Math.floor(Math.random() * mensagensIniciais.length);
    return mensagensIniciais[indice];
  };
  
  // Carregar dados do usuário e perfis mockados
  useEffect(() => {
    // Perfis mockados (a partir do JSON)
    setPerfisMock(dadosContatos.perfis);
    
    // Verificar se o usuário está logado
    if (isUserLoggedIn()) {
      const userInfo = getUserData();
      setUserId(userInfo.id);
      
      // Buscar matches do usuário
      buscarMatches(userInfo.id, dadosContatos.perfis);
    } else {
      // Se não houver usuário logado, redirecionar para login
      redirectWithUtm('/login');
    }
  }, []);
  
  // Verificar se há um novo match no localStorage
  const verificarNovoMatch = () => {
    try {
      // Recuperar o match atual do localStorage
      const matchData = localStorage.getItem('currentMatch');
      
      if (matchData) {
        const matchedProfile = JSON.parse(matchData);
        setCurrentMatch(matchedProfile);
        
        // Obter uma mensagem inicial aleatória
        const mensagemInicial = getMensagemInicial();
        
        // Criar um contato a partir do match
        const novoContato = {
          id: matchedProfile.id,
          nome: matchedProfile.nome.split(',')[0], // Apenas o primeiro nome
          ultimaMensagem: mensagemInicial,
          horaUltimaMensagem: 'Agora',
          imagem: matchedProfile.imagem,
          online: true,
          mensagens: [
            { id: 1, texto: mensagemInicial, enviada: false, hora: 'Agora' }
          ]
        };
        
        // Adicionar à lista de contatos
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
        localStorage.removeItem('currentMatch');
      }
    } catch (error) {
      console.error('Erro ao processar match:', error);
    }
  };
  
  // Função para buscar matches do usuário
  const buscarMatches = async (id, perfis) => {
    try {
      const response = await fetch(`/api/matches?userId=${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar matches');
      }
      
      const data = await response.json();
      const matchIds = data.matches || [];
      
      // Se não houver matches, mostrar apenas o novo match (se houver)
      if (matchIds.length === 0) {
        verificarNovoMatch();
        setCarregando(false);
        return;
      }
      
      // Converter IDs de match em contatos
      const contatosMatches = matchIds.map(matchId => {
        // Encontrar o perfil correspondente
        const perfil = perfis.find(p => p.id === matchId);
        if (!perfil) return null;
        
        // Gerar uma mensagem inicial aleatória
        const mensagemInicial = getMensagemInicial();
        
        return {
          id: perfil.id,
          nome: perfil.nome.split(',')[0], // Apenas o primeiro nome
          ultimaMensagem: mensagemInicial,
          horaUltimaMensagem: 'Hoje',
          imagem: perfil.imagem,
          online: Math.random() > 0.5, // Online aleatório
          mensagens: [
            { id: 1, texto: mensagemInicial, enviada: false, hora: 'Hoje' }
          ]
        };
      }).filter(contato => contato !== null);
      
      setContatosLista(contatosMatches);
      verificarNovoMatch();
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao buscar matches:', error);
      verificarNovoMatch();
      setCarregando(false);
    }
  };
  
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
    
    // Simular resposta automática após 1-3 segundos
    setTimeout(() => {
      // Resposta automática a partir do JSON
      const respostas = dadosContatos.respostasAutomaticas;
      
      const resposta = respostas[Math.floor(Math.random() * respostas.length)];
      
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
      const contatosAtualizados = contatosLista.map(c => 
        c.id === contatoComResposta.id ? contatoComResposta : c
      );
      
      setContatosLista(contatosAtualizados);
      setContatoAtivo(contatoComResposta);
    }, Math.random() * 2000 + 1000);
  };

  // Mostrar carregando
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
          <div>Carregando contatos...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: 'Poppins, sans-serif',
      overflow: 'hidden'
    }}>
      <Head>
        <title>Contatos - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'white',
        position: 'relative'
      }}>
        {/* Cabeçalho */}
        <header style={{
          backgroundColor: '#8319C1',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: showMobile === 'chat' ? 'flex-start' : 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {showMobile === 'chat' && (
            <button 
              onClick={voltarParaLista}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                marginRight: '15px',
                cursor: 'pointer'
              }}
            >
              ←
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: '20px', color: 'white' }}>
            {showMobile === 'lista' ? 'Contatos' : contatoAtivo?.nome}
          </h1>
        </header>
        
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 120px)' // Ajustado para acomodar BottomNavigation
        }}>
          {/* Lista de contatos (visível apenas no desktop ou quando showMobile é 'lista') */}
          <div style={{
            width: '30%',
            borderRight: '1px solid #eee',
            overflowY: 'auto',
            display: (showMobile === 'lista' || window.innerWidth > 768) ? 'block' : 'none',
            flex: showMobile === 'lista' ? 1 : 'none'
          }}>
            {contatosLista.length > 0 ? (
              contatosLista.map(contato => (
                <div 
                  key={contato.id} 
                  onClick={() => selecionarContato(contato.id)}
                  style={{
                    display: 'flex',
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: contatoAtivo?.id === contato.id ? '#f0f0f0' : 'transparent'
                  }}
                >
                  <div style={{ position: 'relative' }}>
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
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#4CAF50',
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: '3px',
                        right: '3px',
                        border: '2px solid white'
                      }} />
                    )}
                  </div>
                  <div style={{ marginLeft: '15px', flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{contato.nome}</div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {contato.ultimaMensagem}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {contato.horaUltimaMensagem}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Você ainda não tem contatos.<br />
                Volte para a página de curtidas e dê match com mais pessoas!
              </div>
            )}
          </div>
          
          {/* Área de conversa (visível apenas no desktop ou quando showMobile é 'chat') */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            display: (showMobile === 'chat' || window.innerWidth > 768) ? 'flex' : 'none'
          }}>
            {contatoAtivo ? (
              <>
                {/* Área de mensagens */}
                <div style={{
                  flex: 1,
                  padding: '15px',
                  overflowY: 'auto',
                  backgroundColor: '#e5e5e5',
                  backgroundImage: 'url(/images/chat-bg.png)',
                  backgroundSize: 'cover'
                }}>
                  {contatoAtivo.mensagens.map(msg => (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.enviada ? 'flex-end' : 'flex-start',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{
                        padding: '10px 15px',
                        borderRadius: '18px',
                        maxWidth: '70%',
                        backgroundColor: msg.enviada ? '#DCF8C6' : 'white',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontSize: '15px' }}>{msg.texto}</div>
                        <div style={{ fontSize: '11px', color: '#999', textAlign: 'right' }}>
                          {msg.hora}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Área de envio de mensagem */}
                <form 
                  onSubmit={enviarMensagem}
                  style={{
                    display: 'flex',
                    padding: '10px',
                    borderTop: '1px solid #eee',
                    backgroundColor: 'white'
                  }}
                >
                  <input 
                    type="text"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    style={{
                      flex: 1,
                      padding: '10px 15px',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#8319C1',
                      color: 'white',
                      border: 'none',
                      marginLeft: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '18px'
                    }}
                  >
                    →
                  </button>
                </form>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                padding: '20px',
                textAlign: 'center'
              }}>
                <p>Selecione um contato para começar a conversar.</p>
                {contatosLista.length === 0 && (
                  <button
                    onClick={() => redirectWithUtm('/curtidas')}
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
                    Encontrar Matches
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Adicionar o BottomNavigation */}
        <BottomNavigation />
      </main>
    </div>
  );
} 