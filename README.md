# Minha Coroa - Next.js

Este é um projeto de migração do site "Minha Coroa" para o framework Next.js. O site original era composto por arquivos HTML estáticos, e agora foi convertido para uma aplicação React moderna usando Next.js.

## Visão Geral

O "Minha Coroa" é uma plataforma de relacionamento que conecta mulheres maduras (acima de 30 anos) com jovens adultos (18+) para relacionamentos.

## Funcionalidades

- Página inicial de apresentação
- Sistema de cadastro de usuários
- Upload de fotos de perfil
- Sistema de "curtidas" estilo Tinder
- Chat entre usuários que deram match

## Tecnologias Utilizadas

- Next.js
- React
- JavaScript
- CSS-in-JS

## Como Executar

1. Certifique-se de ter o Node.js instalado
2. Clone este repositório
3. Instale as dependências:
   ```
   npm install
   ```
4. Execute em ambiente de desenvolvimento:
   ```
   npm run dev
   ```
5. Para build de produção:
   ```
   npm run build
   npm start
   ```

## Estrutura do Projeto

- `/pages` - Páginas da aplicação (página inicial, cadastro, chat, etc.)
- `/components` - Componentes reutilizáveis
- `/public/images` - Imagens e arquivos estáticos
- `/styles` - Arquivos de estilo globais

## Recursos Adicionais

- Totalmente responsivo para dispositivos móveis
- Utiliza hooks personalizados para gerenciamento de parâmetros UTM
- Navegação fluida entre telas
- Design moderno e amigável 