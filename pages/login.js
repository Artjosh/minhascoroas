import { useState } from 'react';
import Head from 'next/head';
import { useUtmParams } from '../components/UtmManager';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabase';
import { saveUserData } from '../lib/auth';

export default function Login() {
  const { redirectWithUtm } = useUtmParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chamar API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Login bem-sucedido
      // Salvar dados do usuário usando nossa função de utilidade
      saveUserData({
        token: data.token,
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        foto: data.usuario.foto
      });

      // Redirecionar para a página principal
      redirectWithUtm('/curtidas');
    } catch (error) {
      console.error('Erro de login:', error);
      setError(error.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu email para redefinir a senha');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar redefinição de senha');
      }

      setResetEmailSent(true);
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      setError(error.message || 'Falha ao solicitar redefinição de senha.');
    } finally {
      setResetLoading(false);
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
        <title>Login - Minha Coroa</title>
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
          Login
        </h1>
        
        {resetEmailSent ? (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Instruções para redefinição de senha foram enviadas para seu email.
          </div>
        ) : error ? (
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
        ) : null}
        
        <form onSubmit={handleSubmit}>
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
          
          <div style={{ marginBottom: '10px', textAlign: 'left' }}>
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
              placeholder="Sua senha"
            />
          </div>
          
          <div style={{ 
            marginBottom: '25px', 
            textAlign: 'right',
            fontSize: '14px',
            color: '#666'
          }}>
            <span
              onClick={handleResetPassword}
              style={{
                color: '#8319C1',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
            </span>
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          Não tem uma conta?{' '}
          <span
            onClick={() => redirectWithUtm('/cadastro')}
            style={{
              color: '#8319C1',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Cadastre-se
          </span>
        </div>
      </div>
    </div>
  );
} 