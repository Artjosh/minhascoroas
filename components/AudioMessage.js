import { useState, useEffect } from 'react';

/**
 * Componente que simula uma mensagem de áudio no estilo WhatsApp
 * @param {Object} props
 * @param {Object} props.mensagem - Objeto da mensagem de áudio
 * @param {boolean} props.enviada - Se a mensagem foi enviada pelo usuário
 */
const AudioMessage = ({ mensagem, enviada = false }) => {
  
  
  // Garantir que mensagem é um objeto válido
  const mensagemSegura = mensagem || {};
  
  
  // Verificar se a mensagem é realmente do tipo áudio
  if (mensagemSegura.tipo !== 'audio') {
    console.warn('[AudioMessage] ALERTA: Mensagem não é do tipo áudio:', mensagemSegura);
  }
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  
  // Converter a duração do formato "0:30" para segundos
  const getDurationInSeconds = (duration) => {
    
    if (!duration) return 30; // Padrão de 30 segundos
    const parts = duration.split(':');
    if (parts.length !== 2) return 30;
    
    try {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } catch (e) {
      console.error('[AudioMessage] Erro ao converter duração:', e);
      return 30;
    }
  };
  
  const durationInSeconds = getDurationInSeconds(mensagemSegura.duracao);
  
  
  // Limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    
    return () => {
      
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);
  
  // Simular reprodução de áudio sem reproduzir áudio real
  const togglePlay = () => {
    
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalId) {
        
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setProgress(0);
    } else {
      
      setIsPlaying(true);
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 1;
        const progressPercent = (currentProgress / durationInSeconds) * 100;
        
        setProgress(progressPercent);
        
        if (currentProgress >= durationInSeconds) {
          
          setIsPlaying(false);
          setProgress(0);
          clearInterval(interval);
          setIntervalId(null);
        }
      }, 1000);
      
      setIntervalId(interval);
    }
  };
  
  
  
  return (
    <div style={{
      backgroundColor: enviada ? '#DCF8C6' : 'white',
      borderRadius: '10px',
      padding: '8px 12px',
      maxWidth: '250px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <button 
          onClick={togglePlay}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginRight: '10px',
            color: '#075E54'
          }}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4H6V20H10V4Z" fill="#075E54" />
              <path d="M18 4H14V20H18V4Z" fill="#075E54" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="#075E54" />
            </svg>
          )}
        </button>
        
        <div style={{ flex: 1 }}>
          <div style={{
            height: '4px',
            backgroundColor: '#E2E2E2',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#075E54',
              borderRadius: '2px'
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '2px'
          }}>
            {mensagemSegura.duracao || "0:30"}
          </div>
        </div>
      </div>
      
      {mensagemSegura.texto && (
        <p style={{ 
          margin: '5px 0 0 0', 
          fontSize: '14px', 
          lineHeight: 1.4,
          fontStyle: 'italic',
          color: '#555'
        }}>
          "{mensagemSegura.texto}"
        </p>
      )}
      
      <span style={{ 
        fontSize: '10px', 
        color: '#999',
        display: 'block',
        textAlign: 'right',
        marginTop: '5px'
      }}>
        {mensagemSegura.hora || "Agora"}
      </span>
    </div>
  );
};

export default AudioMessage; 