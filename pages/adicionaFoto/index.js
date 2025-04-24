import { useState } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../../components/UtmManager';

export default function AdicionaFoto() {
  const { redirectWithUtm } = useUtmParams();
  const [fotos, setFotos] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [bio, setBio] = useState('');
  const [interesses, setInteresses] = useState([]);
  
  // Lista de interesses disponíveis
  const listaInteresses = [
    'Cinema', 'Viagens', 'Música', 'Gastronomia', 
    'Vinhos', 'Fitness', 'Leitura', 'Arte',
    'Passeios', 'Festas', 'Praia', 'Natureza'
  ];
  
  // Função para lidar com a seleção de arquivo
  const handleFileChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Atualiza o array de fotos
      const novasFotos = [...fotos];
      novasFotos[index] = file;
      setFotos(novasFotos);
      
      // Criar URL para preview da imagem
      const fileUrl = URL.createObjectURL(file);
      const novosPreviews = [...previews];
      novosPreviews[index] = fileUrl;
      setPreviews(novosPreviews);
    }
  };
  
  // Função para alternar interesse
  const toggleInteresse = (interesse) => {
    if (interesses.includes(interesse)) {
      setInteresses(interesses.filter(item => item !== interesse));
    } else {
      setInteresses([...interesses, interesse]);
    }
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar se pelo menos uma foto foi selecionada
    if (!fotos.some(foto => foto !== null)) {
      alert('Por favor, selecione pelo menos uma foto');
      return;
    }
    
    // Verificar se a bio tem pelo menos 20 caracteres
    if (bio.length < 20) {
      alert('Por favor, escreva uma biografia com pelo menos 20 caracteres');
      return;
    }
    
    // Verificar se pelo menos um interesse foi selecionado
    if (interesses.length === 0) {
      alert('Por favor, selecione pelo menos um interesse');
      return;
    }
    
    // Em um app real, aqui faria o upload das imagens e informações para o servidor
    // Para este exemplo, apenas redirecionamos para a próxima página
    redirectWithUtm('/curtidas');
  };

  return (
    <div style={{
      height: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <Head>
        <title>Adicione sua Foto - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main style={{
        background: `url('/images/fundo3.svg') center/cover no-repeat`,
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 0,
        padding: '0px 20px',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px'
        }}>
          <img src="/images/logoCoroa.png" alt="Logo Minha Coroa" width="100px" />
          <h1 style={{margin: 0, fontSize: '25px', color: '#8319C1'}}>Complete seu perfil</h1>
          <p style={{
            margin: 0,
            fontSize: '10px',
            padding: '0px 25px',
            color: '#999999',
            marginTop: '-5px',
            marginBottom: '20px'
          }}>
            Adicione fotos, uma breve descrição e seus interesses.
          </p>
          
          <form onSubmit={handleSubmit}>
            {/* Área das fotos */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {[0, 1, 2].map((index) => (
                <div 
                  key={index}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  {previews[index] ? (
                    <img 
                      src={previews[index]} 
                      alt={`Preview da foto ${index + 1}`} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999'
                    }}>
                      <span style={{fontSize: '24px'}}>+</span>
                      <span style={{fontSize: '10px'}}>{`Foto ${index + 1}`}</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id={`foto-${index}`} 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Área da biografia */}
            <div style={{marginBottom: '20px', textAlign: 'left', padding: '0 15px'}}>
              <label 
                htmlFor="bio" 
                style={{
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#8319C1',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Biografia
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  resize: 'none',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <span style={{
                display: 'block',
                textAlign: 'right',
                fontSize: '12px',
                color: bio.length < 20 ? '#ff4d4d' : '#999'
              }}>
                {bio.length}/100 caracteres
              </span>
            </div>
            
            {/* Área dos interesses */}
            <div style={{marginBottom: '20px', textAlign: 'left', padding: '0 15px'}}>
              <label 
                style={{
                  display: 'block', 
                  marginBottom: '10px', 
                  color: '#8319C1',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Interesses
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {listaInteresses.map((interesse) => (
                  <button
                    key={interesse}
                    type="button"
                    onClick={() => toggleInteresse(interesse)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: interesses.includes(interesse) ? '#8319C1' : '#f0f0f0',
                      color: interesses.includes(interesse) ? 'white' : '#666',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {interesse}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              type="submit"
              style={{
                background: 'linear-gradient(45deg, #8319C1,#b941ff, #8319C1)',
                color: 'white',
                padding: '10px 70px',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 'bold',
                marginTop: '15px',
                marginBottom: '10px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
