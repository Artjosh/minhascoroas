import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';
import BottomNavigation from '../../components/BottomNavigation';
import { isUserLoggedIn, getUserData, getAuthHeaders } from '../../lib/auth';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  
  // Lista de interesses disponíveis
  const interessesDisponiveis = [
    'Cinema', 'Música', 'Leitura', 'Viagens', 'Gastronomia', 'Esportes', 
    'Teatro', 'Dança', 'Arte', 'Fotografia', 'Tecnologia', 'Moda', 
    'Vinhos', 'Natureza', 'Fitness', 'Yoga', 'Meditação', 'Culinária'
  ];
  
  // Carregar dados do usuário
  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = isUserLoggedIn();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // Obter dados do usuário
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      
      // Inicializar estado de interesses
      if (userData.interesses) {
        setInteresses(userData.interesses);
      }
      
      // Inicializar bio se existir
      if (userData.bio) {
        setBio(userData.bio);
      }
      
      // Inicializar fotos se existirem
      if (userData.foto) {
        setFotoPrincipal(userData.foto);
      }
      
      if (userData.fotos && Array.isArray(userData.fotos)) {
        // Garantir que não estamos incluindo a foto principal no array de fotos secundárias
        const fotosSecundarias = userData.fotos.filter(foto => foto !== userData.foto);
        setFotos(fotosSecundarias);
      }
      
      setLoading(false);
    }
  }, [router]);
  
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
        let fotosAtualizadas = [...fotos];
        
        // Se é a primeira foto, definir como foto principal
        if (!fotoPrincipal) {
          setFotoPrincipal(data.url);
        } else {
          // Adicionar às fotos secundárias (limitando a 3)
          if (fotosAtualizadas.length < 3) {
            fotosAtualizadas.push(data.url);
          } else {
            // Substituir a foto mais antiga
            fotosAtualizadas.shift();
            fotosAtualizadas.push(data.url);
          }
          setFotos(fotosAtualizadas);
        }
        
        // Atualizar o localStorage se a API indicar
        if (data.updateLocalStorage) {
          // Obter dados atuais do usuário
          const userData = getUserData();
          if (userData) {
            // Criar um novo objeto de usuário com as fotos atualizadas
            const updatedUserData = {
              ...userData,
              foto: fotoPrincipal || data.url, // Usa a foto principal existente ou a nova foto se não houver principal
              fotos: fotoPrincipal 
                ? fotosAtualizadas // Usa o array atualizado de fotos secundárias
                : [data.url] // Se a foto principal foi definida agora, inicializa o array
            };
            
            // Salvar no localStorage
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          }
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
    }
  };
  
  // Função para definir uma foto como principal
  const setFotoPrincipalHandler = (url) => {
    // Verificar se a URL já está nas fotos secundárias
    if (!fotos.includes(url)) {
      // Se não estiver, adicionar a foto atual principal às fotos secundárias
      if (fotoPrincipal) {
        const fotosAtualizadas = [...fotos.filter(foto => foto !== url)];
        if (fotosAtualizadas.length < 2) {
          fotosAtualizadas.push(fotoPrincipal);
        } else {
          // Se já tiver 2 fotos secundárias, substituir a mais antiga
          fotosAtualizadas.shift();
          fotosAtualizadas.push(fotoPrincipal);
        }
        setFotos(fotosAtualizadas);
      }
    } else {
      // Se a URL estiver nas fotos secundárias, removê-la e adicionar a atual principal
      const fotosAtualizadas = fotos.filter(foto => foto !== url);
      if (fotoPrincipal && fotoPrincipal !== url) {
        fotosAtualizadas.push(fotoPrincipal);
      }
      setFotos(fotosAtualizadas);
    }
    
    // Definir a nova foto principal
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
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
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
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          width: 'auto',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
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
            marginBottom: '15px',
            width: 'fit-content', 
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            justifyContent: 'center'
          }}>
            {/* Foto principal */}
            <div style={{
              width: '240px',
              flexShrink: 0,
              position: 'relative',
              height: '180px',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}>
              {fotoPrincipal ? (
                <>
                  <img 
                    src={fotoPrincipal} 
                    alt="Foto principal" 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
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
                    fontSize: '12px',
                    zIndex: 2
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
              width: '160px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box'
            }}>
              {/* Outras fotos (até 2) */}
              {[0, 1].map((index) => {
                // Filtrar fotos para não incluir a foto principal
                const fotosSecundarias = fotos.filter(foto => foto !== fotoPrincipal);
                return (
                <div 
                  key={index}
                  onClick={() => fotosSecundarias[index] && setFotoPrincipalHandler(fotosSecundarias[index])}
                  style={{
                    width: '160px',
                    height: '85px',
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    cursor: fotosSecundarias[index] ? 'pointer' : 'default',
                    boxSizing: 'border-box'
                  }}
                >
                  {fotosSecundarias[index] ? (
                    <img 
                      src={fotosSecundarias[index]} 
                      alt={`Foto ${index + 1}`} 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
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
              )})}
            </div>
          </div>
          
          {/* Upload de fotos */}
          <div style={{ 
            width: '100%', 
            maxWidth: '100%', 
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
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
                position: 'relative',
                maxWidth: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {/* Preview da imagem */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={novaFoto.preview} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Botões de ação */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '10px 0'
                }}>
                  {/* Botão de Salvar */}
                  <button
                    onClick={uploadFoto}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      border: 'none',
                      backgroundColor: '#8319C1',
                      color: 'white',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      opacity: uploading ? 0.7 : 1,
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {uploading ? 'Salvando foto...' : 'Salvar foto'}
                  </button>

                  {/* Botão de Cancelar */}
                  <button
                    onClick={() => setNovaFoto(null)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      border: '1px solid #8319C1',
                      backgroundColor: 'transparent',
                      color: '#8319C1',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancelar
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