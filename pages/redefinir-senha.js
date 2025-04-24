import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUtmParams } from '../components/UtmManager';

export default function RedefinirSenha() {
  const router = useRouter();
  const { redirectWithUtm } = useUtmParams();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extrair token da URL se presente
    const { token } = router.query;
    if (token) {
      setToken(token);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações básicas
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Token de redefinição inválido');
      setLoading(false);
      return;
    }

    try {
      // Esta é uma implementação de exemplo - você precisará criar esta API
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          novaSenha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      setSuccess(true);
      
      // Limpar campos
      setNovaSenha('');
      setConfirmarSenha('');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        redirectWithUtm('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError(error.message || 'Falha ao redefinir a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: 'Poppins, sans-serif',
      background: `url('/images/fundo.svg') center/cover no-repeat`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Head>
        <title>Redefinir Senha - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

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
          Redefinir Senha
        </h1>
        
        {success ? (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <p>Senha redefinida com sucesso!</p>
            <p>Você será redirecionado para a página de login em instantes...</p>
          </div>
        ) : (
          <>
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
            
            {!token && (
              <div style={{
                backgroundColor: '#fff3e0',
                color: '#e65100',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                Link de redefinição inválido. Por favor, verifique se você usou o link correto enviado ao seu email.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label 
                  htmlFor="novaSenha" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontSize: '14px', 
                    color: '#666' 
                  }}
                >
                  Nova Senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Digite sua nova senha"
                />
              </div>
              
              <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label 
                  htmlFor="confirmarSenha" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontSize: '14px', 
                    color: '#666' 
                  }}
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Confirme sua nova senha"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !token}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '30px',
                  background: 'linear-gradient(to right, #420079, #ae00ff)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !token) ? 0.7 : 1
                }}
              >
                {loading ? 'Processando...' : 'Redefinir Senha'}
              </button>
            </form>
          </>
        )}
        
        <div style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          <span
            onClick={() => redirectWithUtm('/login')}
            style={{
              color: '#8319C1',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Voltar para o login
          </span>
        </div>
      </div>
    </div>
  );
} 