# Guia para Implementação de "Esqueci a Senha" com Supabase

Este documento explica como configurar completamente o fluxo de recuperação de senha no seu projeto Minha Coroa usando Supabase.

## Visão Geral do Fluxo

1. Usuário clica em "Esqueci minha senha" na tela de login
2. Usuário fornece seu email
3. Sistema verifica se o email existe
4. Sistema envia email com link para redefinição de senha
5. Usuário recebe email e clica no link
6. Usuário é redirecionado para página de redefinição de senha
7. Usuário define nova senha e envia
8. Sistema atualiza a senha e redireciona para login

## Configuração no Painel do Supabase

### 1. Ativar Serviço de Email

1. Acesse o Painel do Supabase
2. Navegue até **Authentication > Email Templates**
3. Escolha um provedor de email:
   - **Integração com SendGrid, Mailgun, etc.**: Recomendado para produção
   - **SMTP personalizado**: Se você já possui um serviço de email
   - **Serviço de teste do Supabase**: Limitado a poucos emails por dia (bom para desenvolvimento)

### 2. Configurar Template de Email

1. Em **Authentication > Email Templates**
2. Edite o template "Reset Password"
3. Personalize o assunto e conteúdo do email
4. Certifique-se de que o link de redefinição contém o token e redireciona para sua aplicação:
   ```
   https://sua-app.com/redefinir-senha?token={{token}}
   ```

### 3. Configurar Redirecionamentos

1. Em **Authentication > URL Configuration**
2. Adicione seu domínio aos sites permitidos
3. Configure o URL base para redirecionamentos

### 4. Permissões de API

Certifique-se de que as seguintes APIs estão habilitadas:
- Auth API para reset de senha 
- Database API para atualizações de usuários

## Implementação no Código

### 1. Atualizar a API de Reset de Senha

No arquivo `/api/auth/reset-password.js`, descomente e atualize o código para usar a auth API do Supabase:

```javascript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha`,
});

if (error) throw error;
```

### 2. Atualizar o arquivo .env

Adicione ou atualize as seguintes variáveis no arquivo `.env`:

```
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
JWT_SECRET=seu_segredo_jwt_muito_seguro_e_complexo
```

## Testando o Fluxo

1. Execute o fluxo de "Esqueci minha senha" em ambiente de desenvolvimento
2. Verifique os logs do Supabase para certificar-se de que os emails estão sendo enviados
3. Confirme se o redirecionamento para a página de redefinição de senha funciona
4. Teste a redefinição de senha com token válido e inválido

## Considerações de Segurança

- Os tokens de redefinição de senha devem expirar em um tempo razoável (1 hora recomendado)
- Emails de redefinição não devem revelar se um usuário existe ou não no sistema
- Implementar rate limiting para evitar ataques de força bruta
- Manter logs de todas as tentativas de redefinição de senha

## Troubleshooting

### Email não está sendo enviado
- Verifique as configurações do provedor de email
- Verifique se o email não está caindo na pasta de spam
- Verifique o painel do Supabase para logs de erros

### Token inválido
- Verifique se o token está sendo corretamente passado na URL
- Confirme se o tempo de expiração não foi ultrapassado
- Verifique se o JWT_SECRET está configurado corretamente 