import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../components/UtmManager';
import { supabaseClient } from '../lib/supabase';
import { saveUserData } from '../lib/auth';

export default function Cadastro() {
  const { redirectWithUtm } = useUtmParams();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para segunda etapa
  const [step, setStep] = useState(1); // 1: Cadastro básico, 2: Completar perfil
  const [fotos, setFotos] = useState([]);
  const [previewFotos, setPreviewFotos] = useState([]);
  const [bio, setBio] = useState('');
  const [interesses, setInteresses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  
  // Opções de interesses disponíveis
  const interessesOptions = [
    'Esportes', 'Música', 'Cinema', 'Leitura', 'Viagens', 
    'Gastronomia', 'Arte', 'Tecnologia', 'Natureza', 'Moda'
  ];
  
  const fileInputRef = useRef(null);

  // Função para lidar com a seleção de fotos
  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limitar a 3 fotos
    const selectedFiles = files.slice(0, 3 - fotos.length);
    
    if (selectedFiles.length > 0) {
      // Atualizar array de fotos
      setFotos([...fotos, ...selectedFiles]);
      
      // Criar previews
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewFotos(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Função para remover uma foto
  const handleRemoveFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setPreviewFotos(previewFotos.filter((_, i) => i !== index));
  };

  // Função para acionar o input de arquivo
  const handleAddFotoClick = () => {
    fileInputRef.current.click();
  };
  
  // Função para alternar interesses
  const toggleInteresse = (interesse) => {
    if (interesses.includes(interesse)) {
      setInteresses(interesses.filter(item => item !== interesse));
    } else {
      setInteresses([...interesses, interesse]);
    }
  };

  // Função para lidar com o envio do formulário da primeira etapa
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos
    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }
    
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Registrar usuário com Supabase
      const response = await fetch('/api/auth/register-step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nome, 
          email, 
          senha 
        }),
      });
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Resposta da API:', data); // Para depuração
      
      // Verificar se a resposta está no formato esperado
      if (!data.usuario) {
        throw new Error('Resposta do servidor inválida: usuário não encontrado');
      }
      
      if (!data.token) {
        throw new Error('Resposta do servidor inválida: token não encontrado');
      }
      
      // Usuário criado com sucesso, salvar ID e token
      setUserId(data.usuario.id);
      setToken(data.token);
      
      // Salvar token no localStorage para manter a sessão
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.usuario.id);
      
      console.log('Dados salvos:', {
        userId: data.usuario.id,
        token: data.token ? 'presente' : 'ausente'
      });
      
      // Avançar para a próxima etapa
      setStep(2);
    } catch (error) {
      console.error('Erro de cadastro:', error);
      setError(error.message || 'Falha ao registrar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para finalizar o cadastro com as informações do perfil
  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validações para a segunda etapa
    if (bio.length < 20) {
      setError('Sua bio deve ter pelo menos 20 caracteres');
      setLoading(false);
      return;
    }
    
    if (interesses.length === 0) {
      setError('Selecione pelo menos um interesse');
      setLoading(false);
      return;
    }
    
    try {
      // Recuperar dados do estado ou do localStorage como fallback
      let userIdToUse = userId;
      let tokenToUse = token;
      
      // Se não tiver no estado, tenta recuperar do localStorage
      if (!userIdToUse) {
        userIdToUse = localStorage.getItem('userId');
        console.log('userId recuperado do localStorage:', userIdToUse);
      }
      
      if (!tokenToUse) {
        tokenToUse = localStorage.getItem('authToken');
        console.log('token recuperado do localStorage:', tokenToUse ? 'presente' : 'ausente');
      }
      
      if (!userIdToUse) {
        console.error("ID do usuário não disponível");
        setError("Erro de autenticação. Por favor, volte para a etapa anterior.");
        setLoading(false);
        return;
      }
      
      if (!tokenToUse) {
        console.error("Token não disponível");
        setError("Erro de autenticação. Por favor, volte para a etapa anterior.");
        setLoading(false);
        return;
      }
      
      // Verificar se temos fotos para adicionar
      if (fotos.length === 0) {
        setError("Adicione pelo menos uma foto de perfil");
        setLoading(false);
        return;
      }
      
      // Criar FormData para enviar fotos
      const formData = new FormData();
      formData.append('userId', userIdToUse);
      formData.append('bio', bio);
      formData.append('interesses', JSON.stringify(interesses));
      
      // Adicionar fotos ao FormData - manter o mesmo nome 'foto' para todas
      fotos.forEach(foto => {
        formData.append('foto', foto);
      });
      
      console.log('Enviando dados de perfil:', {
        userId: userIdToUse,
        bio,
        interesses,
        fotos: fotos.length,
        token: tokenToUse ? 'presente' : 'ausente'
      });
      
      // Enviar dados para a API
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
          // Não incluir 'Content-Type' aqui pois o navegador configurará automaticamente
          // para FormData com a boundary correta
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao completar perfil');
      }
      
      // Perfil completado com sucesso
      // Salvar dados do usuário no localStorage usando a mesma função que é usada no login
      // Utilize o token existente junto com os dados do usuário atualizados
      if (data.usuario) {
        saveUserData({
          token: tokenToUse,
          id: data.usuario.id,
          nome: data.usuario.nome,
          email: data.usuario.email,
          foto: data.usuario.foto || '/images/user-placeholder.jpg'
        });
        
        console.log('Dados do usuário salvos no localStorage após completar perfil');
      }
      
      // Redirecionar para a página principal
      redirectWithUtm('/curtidas');
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      setError(error.message || 'Falha ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para voltar à etapa 1
  const handleBackToStep1 = () => {
    setStep(1);
  };
  
  // Renderizar etapa 1 - Cadastro básico
  const renderStep1 = () => (
    <div style={{
      width: '90%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      padding: '30px 20px',
      textAlign: 'center'
    }}>
      <img 
        src="/images/logoCoroa.png" 
        alt="Minha Coroa" 
        style={{ 
          width: '120px', 
          marginBottom: '20px' 
        }} 
      />
      
      <h1 style={{ 
        fontSize: '24px', 
        color: '#8319C1', 
        marginBottom: '20px' 
      }}>
        Criar Conta
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmitStep1}>
        {/* Nome */}
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label 
            htmlFor="nome" 
            style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="Seu nome"
          />
        </div>
        
        {/* Email */}
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="seu@email.com"
          />
        </div>
        
        {/* Senha */}
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label 
            htmlFor="senha" 
            style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="Crie uma senha"
          />
        </div>
        
        {/* Confirmar Senha */}
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label 
            htmlFor="confirmSenha" 
            style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Confirmar Senha
          </label>
          <input
            id="confirmSenha"
            type="password"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="Confirme sua senha"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '30px',
            background: 'linear-gradient(to right, #420079, #ae00ff)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processando...' : 'Avançar'}
        </button>
      </form>
      
      <div style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Já tem uma conta?{' '}
        <span
          onClick={() => redirectWithUtm('/login')}
          style={{
            color: '#8319C1',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          Entrar
        </span>
      </div>
    </div>
  );
  
  // Renderizar etapa 2 - Completar perfil
  const renderStep2 = () => (
    <div style={{
      width: '90%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      padding: '30px 20px',
      textAlign: 'center'
    }}>
      <img 
        src="/images/logoCoroa.png" 
        alt="Minha Coroa" 
        style={{ 
          width: '120px', 
          marginBottom: '20px' 
        }} 
      />
      
      <h1 style={{ 
        fontSize: '24px', 
        color: '#8319C1', 
        marginBottom: '10px' 
      }}>
        Complete seu Perfil
      </h1>
      
      <p style={{ 
        fontSize: '14px', 
        color: '#666',
        marginBottom: '20px'
      }}>
        Mostre sua melhor versão! Adicione fotos e conte mais sobre você.
      </p>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmitStep2}>
        {/* Upload de fotos */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '14px', 
              color: '#666',
              textAlign: 'left'
            }}
          >
            Fotos de Perfil (1-3)
          </label>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '10px'
          }}>
            {/* Mostrar previews das fotos selecionadas */}
            {previewFotos.map((previewUrl, index) => (
              <div 
                key={index}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <img 
                  src={previewUrl}
                  alt={`Foto ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFoto(index)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Botão para adicionar foto se tiver menos de 3 */}
            {previewFotos.length < 3 && (
              <div
                onClick={handleAddFotoClick}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '2px dashed #8319C1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#8319C1',
                  fontSize: '24px'
                }}
              >
                +
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFotoChange}
          />
          
          <p style={{ 
            fontSize: '12px', 
            color: '#999',
            marginTop: '5px',
            textAlign: 'left'
          }}>
            Adicione até 3 fotos para mostrar seu melhor lado
          </p>
        </div>
        
        {/* Bio */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label 
            htmlFor="bio" 
            style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Sobre Você
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Conte um pouco sobre você..."
          />
          <p style={{ 
            fontSize: '12px', 
            color: bio.length < 20 ? '#ff4444' : '#999',
            marginTop: '5px'
          }}>
            Mínimo de 20 caracteres ({bio.length}/20)
          </p>
        </div>
        
        {/* Interesses */}
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label 
            style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '14px', 
              color: '#666' 
            }}
          >
            Interesses
          </label>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {interessesOptions.map(interesse => (
              <button
                key={interesse}
                type="button"
                onClick={() => toggleInteresse(interesse)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  background: interesses.includes(interesse) 
                    ? '#8319C1' 
                    : '#f0f0f0',
                  color: interesses.includes(interesse) 
                    ? 'white' 
                    : '#333',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {interesse}
              </button>
            ))}
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: interesses.length === 0 ? '#ff4444' : '#999',
            marginTop: '5px'
          }}>
            Selecione pelo menos um interesse ({interesses.length} selecionado{interesses.length !== 1 ? 's' : ''})
          </p>
        </div>
        
        <div style={{ 
          display: 'flex',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={handleBackToStep1}
            style={{
              flex: '1',
              padding: '14px',
              borderRadius: '30px',
              background: '#f0f0f0',
              color: '#333',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: '2',
              padding: '14px',
              borderRadius: '30px',
              background: 'linear-gradient(to right, #420079, #ae00ff)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: 'Poppins, sans-serif',
      background: `url('/images/fundo.svg') center/cover no-repeat`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '20px',
      paddingBottom: '20px'
    }}>
      <Head>
        <title>{`${step === 1 ? 'Cadastro' : 'Complete seu Perfil'} - Minha Coroa`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
} 