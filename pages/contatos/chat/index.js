import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUtmParams } from '../../../components/UtmManager';
import { isUserLoggedIn, getUserData } from '../../../lib/auth';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { getConversa, salvarConversa, isOnline } from '../../../lib/chat-utils';
import { 
  obterConversaLocal, 
  salvarConversaLocal, 
  obterProximaEtapa,
  getEstadoInicialConversa,
  isAudioMessage
} from '../../../data/conversas';
import { perfis } from '../../../data/mock';

export default function Chat() {
  const router = useRouter();
  const { redirectWithUtm } = useUtmParams();
  const { id } = router.query;
  const [mensagens, setMensagens] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const [perfilMatch, setPerfilMatch] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  
  // Dados do chat centralizados
  const dadosChat = mockData.chatData;
  
  // Carregar dados da conversa quando o ID estiver disponível
  useEffect(() => {
    if (!isUserLoggedIn()) {
      redirectWithUtm('/login');
      return;
    }
    
    const userInfo = getUserData();
    setUserId(userInfo.id);
    
    if (id && dadosChat.usuarios[id]) {
      // Verificar se existe uma conversa salva
      if (userInfo.id) {
        const conversaSalva = getConversa(userInfo.id, id);
        
        if (conversaSalva) {
          // Usar conversa salva
          setMensagens(conversaSalva.mensagens);
          setUsuario({
            ...dadosChat.usuarios[id],
            online: isOnline(id)
          });
          setLoading(false);
          return;
        }
      }
      
      // Se não houver conversa salva, usar dados mockados
      setUsuario({
        ...dadosChat.usuarios[id],
        online: isOnline(id)
      });
      setMensagens(dadosChat.mensagensPorConversa[id] || []);
      setLoading(false);
    }
  }, [id, dadosChat, router]);
  
  // Focar no input quando o chat carregar
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);
  
  // Rolar para o final do chat quando novas mensagens forem adicionadas
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);
  
  // Função para enviar uma nova mensagem
  const enviarMensagem = async (texto) => {
    if (!userId || !perfilMatch) return;

    const novaMensagem = {
      id: Date.now(),
      texto,
      enviada: true,
      hora: new Date().toLocaleTimeString()
    };

    const novasMensagens = [...mensagens, novaMensagem];
    setMensagens(novasMensagens);

    // Salvar conversa atualizada
    salvarConversaLocal(userId, perfilMatch.id, {
      mensagens: novasMensagens,
      etapaAtual,
      perfilId: perfilMatch.id,
      ultimaAtualizacao: Date.now()
    });

    // Processar próxima etapa do fluxo
    const proximaEtapa = obterProximaEtapa(perfilMatch.id, etapaAtual);
    if (proximaEtapa) {
      setTimeout(() => {
        const mensagensAtualizadas = [...novasMensagens, ...proximaEtapa.mensagens];
        setMensagens(mensagensAtualizadas);
        setEtapaAtual(etapaAtual + 1);
        
        salvarConversaLocal(userId, perfilMatch.id, {
          mensagens: mensagensAtualizadas,
          etapaAtual: etapaAtual + 1,
          perfilId: perfilMatch.id,
          ultimaAtualizacao: Date.now()
        });
      }, 1000);
    }
  };
  
  // Voltar para a lista de contatos
  const voltarParaContatos = () => {
    router.push('/contatos');
  };

  // Se não tiver usuário ainda, mostrar carregando
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000',
      backgroundImage: `url('/images/fundoConversa.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative'
    }}>
      <Head>
        <title>Chat com {usuario.nome} - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Cabeçalho do chat */}
      <div style={{
        background: 'linear-gradient(45deg, #8319C1, #b941ff, #8319C1)',
        color: 'white',
        padding: '12px 15px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div 
          onClick={voltarParaContatos}
          style={{ marginRight: '15px', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1
        }}>
          <div style={{ position: 'relative', marginRight: '10px' }}>
            <img 
              src={usuario.foto} 
              alt={usuario.nome} 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            {usuario.online && (
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                border: '2px solid #8319C1'
              }} />
            )}
          </div>
          
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 'bold' 
            }}>
              {usuario.nome}
            </h2>
            <span style={{ 
              fontSize: '12px', 
              opacity: 0.8 
            }}>
              {usuario.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div>
          <img src="/images/tresPontos.png" alt="Menu" width="20px" height="20px" />
        </div>
      </div>
      
      {/* Overlay roxo/lilás escuro sobre o fundo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(34, 0, 85, 0.95)',
        zIndex: 0
      }}></div>
      
      {/* Área de mensagens */}
      <div 
        ref={chatRef}
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 130px)',
          paddingBottom: '80px' // Espaço para o input
        }}
      >
        {mensagens.map(mensagem => (
          <div 
            key={mensagem.id} 
            style={{
              display: 'flex',
              justifyContent: mensagem.enviada || mensagem.remetente === 'eu' ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
            }}
          >
            <div style={{
              backgroundColor: mensagem.enviada || mensagem.remetente === 'eu' ? '#DCF8C6' : 'white',
              borderRadius: '10px',
              padding: '8px 12px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                lineHeight: 1.4
              }}>
                {mensagem.texto}
              </p>
              <span style={{ 
                fontSize: '10px', 
                color: '#999',
                display: 'block',
                textAlign: 'right',
                marginTop: '2px'
              }}>
                {mensagem.hora || mensagem.horario}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Área de digitação - novo estilo conforme solicitado */}
      <div 
        id="input-container2" 
        className="input-container2"
        style={{
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          position: 'fixed',
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
          transition: 'all 0.3s ease',
          zIndex: 99999,
          backgroundColor: 'rgb(34, 34, 34)'
        }}
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensagem(novaMensagem);
          }}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            id="user-input2"
            className="user-input2"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
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
            style={{
              background: 'linear-gradient(to bottom, #801AB8, #C922FC, #801AB8)',
              padding: '10px',
              borderRadius: '100%',
              border: 'none',
              marginLeft: '-20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
