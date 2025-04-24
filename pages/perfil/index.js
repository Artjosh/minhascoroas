import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import { isUserLoggedIn, getUserData, getAuthHeaders } from '../../lib/auth';

export default function Perfil() {
  const { redirectWithUtm } = useUtmParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interesses, setInteresses] = useState([]);
  const [bio, setBio] = useState('');
  const [fotos, setFotos] = useState([]);
  const [fotoPrincipal, setFotoPrincipal] = useState('');
  const [novaFoto, setNovaFoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  // Lista de interesses disponíveis
  const interessesDisponiveis = [
    'Cinema', 'Música', 'Leitura', 'Viagens', 'Gastronomia', 'Esportes', 
    'Teatro', 'Dança', 'Arte', 'Fotografia', 'Tecnologia', 'Moda', 
    'Vinhos', 'Natureza', 'Fitness', 'Yoga', 'Meditação', 'Culinária'
  ];
  
  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Verificar se o usuário está logado
        if (!isUserLoggedIn()) {
          redirectWithUtm('/login');
          return;
        }
        
        // Obter dados do usuário do localStorage
        const userInfo = getUserData();
        setUser(userInfo);
        
        // Buscar dados atualizados do usuário da API
        const response = await fetch(`/api/users/${userInfo.id}`, {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.data) {
            setBio(userData.data.bio || '');
            setInteresses(userData.data.interesses || []);
            setFotoPrincipal(userData.data.foto || '');
            setFotos(userData.data.fotos || []);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Função para adicionar/remover interesse
  const toggleInteresse = (interesse) => {
    if (interesses.includes(interesse)) {
      setInteresses(interesses.filter(i => i !== interesse));
    } else {
      // Limitar a 5 interesses
      if (interesses.length < 5) {
        setInteresses([...interesses, interesse]);
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Você pode selecionar até 5 interesses' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    }
  };
  
  // Função para abrir seletor de arquivos
  const handleFotoClick = () => {
    fileInputRef.current.click();
  };
  
  // Função para processar a seleção de arquivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ 
        type: 'error', 
        text: 'Por favor, selecione uma imagem válida (JPG, PNG)' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    // Verificar tamanho (limitar a 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ 
        type: 'error', 
        text: 'A imagem deve ter menos de 5MB' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    // Mostrar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setNovaFoto({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Função para fazer upload da foto
  const uploadFoto = async () => {
    if (!novaFoto || !user) return;
    
    setUploading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('foto', novaFoto.file);
      
      // Fazer upload para a API
      const response = await fetch(`/api/users/upload/${user.id}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const data = await response.json();
      
      // Adicionar nova foto à lista
      if (data.url) {
        // Se é a primeira foto, definir como foto principal
        if (!fotoPrincipal) {
          setFotoPrincipal(data.url);
        }
        
        // Adicionar às fotos (limitando a 3)
        if (fotos.length < 3) {
          setFotos([...fotos, data.url]);
        } else {
          // Substituir a primeira foto
          const newFotos = [...fotos];
          newFotos.shift();
          newFotos.push(data.url);
          setFotos(newFotos);
        }
        
        setMessage({ 
          type: 'success', 
          text: 'Foto enviada com sucesso!' 
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao fazer upload da imagem. Tente novamente.' 
      });
    } finally {
      setUploading(false);
      setNovaFoto(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };
  
  // Função para definir uma foto como principal
  const setFotoPrincipalHandler = (url) => {
    setFotoPrincipal(url);
  };
  
  // Função para salvar perfil
  const salvarPerfil = async () => {
    if (!user) return;
    
    setSalvando(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio,
          interesses,
          foto: fotoPrincipal,
          fotos
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Perfil atualizado com sucesso!' 
      });
      
      // Atualizar dados do usuário no localStorage
      const updatedUser = {
        ...user,
        bio,
        interesses,
        foto: fotoPrincipal,
        fotos
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao atualizar perfil. Tente novamente.' 
      });
    } finally {
      setSalvando(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };
  
  // Exibir carregando
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
          <div>Carregando perfil...</div>
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
        <title>Meu Perfil - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <main style={{
        paddingBottom: '70px', // Espaço para o BottomNavigation
        paddingTop: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <header style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '0 15px'
        }}>
          <h1 style={{ 
            color: '#8319C1', 
            fontSize: '24px',
            margin: '0 0 5px 0'
          }}>
            Meu Perfil
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '14px',
            margin: 0
          }}>
            Edite suas informações e personalize seu perfil
          </p>
        </header>
        
        {/* Mensagem de feedback */}
        {message.text && (
          <div style={{
            backgroundColor: message.type === 'error' ? '#ffdddd' : '#ddffdd',
            color: message.type === 'error' ? '#ff0000' : '#007700',
            padding: '10px 15px',
            borderRadius: '5px',
            margin: '0 15px 15px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}
        
        {/* Seção de Fotos */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          margin: '0 15px 20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#8319C1', 
            fontSize: '18px',
            marginTop: 0,
            marginBottom: '15px'
          }}>
            Suas Fotos
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '15px'
          }}>
            {/* Foto principal */}
            <div style={{
              flex: '1.5',
              position: 'relative',
              height: '180px',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              {fotoPrincipal ? (
                <>
                  <img 
                    src={fotoPrincipal} 
                    alt="Foto principal" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(131, 25, 193, 0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px'
                  }}>
                    Principal
                  </div>
                </>
              ) : (
                <div style={{
                  color: '#999',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '5px' }}>
                    📷
                  </div>
                  Foto Principal
                </div>
              )}
            </div>
            
            {/* Lista de fotos secundárias */}
            <div style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Outras fotos (até 2) */}
              {[0, 1].map((index) => (
                <div 
                  key={index}
                  onClick={() => fotos[index] && setFotoPrincipalHandler(fotos[index])}
                  style={{
                    flex: 1,
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    cursor: fotos[index] ? 'pointer' : 'default'
                  }}
                >
                  {fotos[index] ? (
                    <img 
                      src={fotos[index]} 
                      alt={`Foto ${index + 1}`} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      color: '#999',
                      fontSize: '12px'
                    }}>
                      Foto {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Upload de fotos */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
            
            {novaFoto ? (
              <div style={{
                marginTop: '10px',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={novaFoto.preview} 
                  alt="Preview" 
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => setNovaFoto(null)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={uploadFoto}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      border: 'none',
                      backgroundColor: '#8319C1',
                      color: 'white',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      opacity: uploading ? 0.7 : 1
                    }}
                  >
                    {uploading ? 'Enviando...' : 'Enviar Foto'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleFotoClick}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  backgroundColor: '#8319C1',
                  color: 'white',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Adicionar Nova Foto
              </button>
            )}
            
            <p style={{
              color: '#999',
              fontSize: '12px',
              textAlign: 'center',
              margin: '10px 0 0'
            }}>
              Você pode adicionar até 3 fotos. A primeira será usada como foto principal.
            </p>
          </div>
        </section>
        
        {/* Seção de Bio */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          margin: '0 15px 20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#8319C1', 
            fontSize: '18px',
            marginTop: 0,
            marginBottom: '15px'
          }}>
            Sobre Você
          </h2>
          
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você, seus gostos e o que busca..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
            maxLength={300}
          />
          
          <p style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#999',
            margin: '5px 0 0'
          }}>
            {bio.length}/300 caracteres
          </p>
        </section>
        
        {/* Seção de Interesses */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          margin: '0 15px 20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#8319C1', 
            fontSize: '18px',
            marginTop: 0,
            marginBottom: '5px'
          }}>
            Seus Interesses
          </h2>
          
          <p style={{
            color: '#999',
            fontSize: '14px',
            margin: '0 0 15px'
          }}>
            Selecione até 5 interesses para mostrar no seu perfil
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {interessesDisponiveis.map(interesse => (
              <button
                key={interesse}
                onClick={() => toggleInteresse(interesse)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: interesses.includes(interesse) ? '#8319C1' : '#f0f0f0',
                  color: interesses.includes(interesse) ? 'white' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {interesse}
              </button>
            ))}
          </div>
        </section>
        
        {/* Botão Salvar */}
        <div style={{
          padding: '0 15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={salvarPerfil}
            disabled={salvando}
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
              opacity: salvando ? 0.7 : 1
            }}
          >
            {salvando ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
} 