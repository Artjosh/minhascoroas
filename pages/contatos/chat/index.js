import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dadosChat from './chat-data.json';

export default function Chat() {
  const router = useRouter();
  const { id } = router.query;
  const [mensagens, setMensagens] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const chatRef = useRef(null);
  
  // Carregar dados da conversa quando o ID estiver disponível
  useEffect(() => {
    if (id && dadosChat.usuarios[id]) {
      setUsuario(dadosChat.usuarios[id]);
      setMensagens(dadosChat.mensagensPorConversa[id] || []);
    }
  }, [id]);
  
  // Rolar para o final do chat quando novas mensagens forem adicionadas
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);
  
  // Função para enviar uma nova mensagem
  const enviarMensagem = (e) => {
    e.preventDefault();
    
    if (novaMensagem.trim() === '') return;
    
    const novaMensagemObj = {
      id: mensagens.length + 1,
      texto: novaMensagem,
      remetente: 'eu',
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMensagens([...mensagens, novaMensagemObj]);
    setNovaMensagem('');
    
    // Simular resposta automática depois de 1 segundo
    setTimeout(() => {
      const respostas = dadosChat.respostasAutomaticas;
      
      const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)];
      
      const respostaObj = {
        id: mensagens.length + 2,
        texto: respostaAleatoria,
        remetente: 'outro',
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMensagens(prevMensagens => [...prevMensagens, respostaObj]);
    }, 1000);
  };
  
  // Voltar para a lista de contatos
  const voltarParaContatos = () => {
    router.push('/contatos');
  };

  // Se não tiver usuário ainda, mostrar carregando
  if (!usuario) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <Head>
        <title>Chat com {usuario.nome} - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main style={{
        fontFamily: 'Poppins, sans-serif',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabeçalho do chat */}
        <div style={{
          backgroundColor: '#8319C1',
          color: 'white',
          padding: '10px 15px',
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
            <img src="/images/flecha.png" alt="Voltar" width="20px" height="20px" />
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
        
        {/* Área de mensagens */}
        <div 
          ref={chatRef}
          style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            backgroundImage: `url('/images/fundoConversa.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 'calc(100vh - 120px)'
          }}
        >
          {mensagens.map(mensagem => (
            <div 
              key={mensagem.id} 
              style={{
                display: 'flex',
                justifyContent: mensagem.remetente === 'eu' ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
              }}
            >
              <div style={{
                backgroundColor: mensagem.remetente === 'eu' ? '#DCF8C6' : 'white',
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
                  {mensagem.horario}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Área de digitação */}
        <form 
          onSubmit={enviarMensagem}
          style={{
            display: 'flex',
            padding: '10px 15px',
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            position: 'sticky',
            bottom: 0
          }}
        >
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite uma mensagem..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: '#f0f0f0',
              borderRadius: '20px',
              padding: '10px 15px',
              fontSize: '14px',
              marginRight: '10px'
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#8319C1',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            &gt;
          </button>
        </form>
      </main>
    </div>
  );
}
