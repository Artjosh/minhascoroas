// Arquivo centralizado para todos os dados mockados
// Combina os dados de perfis, notificações, respostas, contatos, chats e likes

// Perfis de usuários
export const perfis = [
  {
    id: 1,
    nome: "Carolina, 32",
    idade: 32,
    cidade: "São Paulo",
    estado: "SP",
    bio: "Adoro compartilhar bons momentos com pessoas interessantes. Busco alguém que goste de aventura e seja divertido!",
    distancia: "5km",
    descricao: "Adoro compartilhar bons momentos com pessoas interessantes. Busco alguém que goste de aventura e seja divertido!",
    foto: "/images/1.jpg",
    imagem: "/images/1.jpg",
    interesses: ["Cinema", "Viagens", "Gastronomia"]
  },
  {
    id: 2,
    nome: "Patrícia, 35",
    idade: 35,
    cidade: "Rio de Janeiro",
    estado: "RJ",
    bio: "Bem resolvida, independente e com desejo de conhecer pessoas novas. Gosto de viajar, ler e ir ao cinema.",
    distancia: "7km",
    descricao: "Bem resolvida, independente e com desejo de conhecer pessoas novas. Gosto de viajar, ler e ir ao cinema.",
    foto: "/images/2.jpg",
    imagem: "/images/2.jpg",
    interesses: ["Leitura", "Vinhos", "Passeios"]
  },
  {
    id: 3,
    nome: "Amanda, 37",
    idade: 37,
    cidade: "Belo Horizonte",
    estado: "MG",
    bio: "Empresária, gosto de música, academia e bons drinks. Procuro companhia para momentos agradáveis.",
    distancia: "3km",
    descricao: "Empresária, gosto de música, academia e bons drinks. Procuro companhia para momentos agradáveis.",
    foto: "/images/3.jpg",
    imagem: "/images/3.jpg",
    interesses: ["Música", "Fitness", "Festas"]
  },
  {
    id: 4,
    nome: "Juliana, 40",
    idade: 40,
    cidade: "Curitiba",
    estado: "PR",
    bio: "Médica, adoro praia, viagens e boas conversas. Buscando alguém para dividir experiências.",
    distancia: "8km",
    descricao: "Médica, adoro praia, viagens e boas conversas. Buscando alguém para dividir experiências.",
    foto: "/images/4.jpg",
    imagem: "/images/4.jpg",
    interesses: ["Praia", "Viagens", "Arte"]
  },
  {
    id: 5,
    nome: "Fernanda, 36",
    idade: 36,
    cidade: "Brasília",
    estado: "DF",
    bio: "Advogada, adoro teatro, vinhos e uma boa conversa. Procuro alguém para compartilhar momentos especiais.",
    distancia: "7km",
    descricao: "Advogada, adoro teatro, vinhos e uma boa conversa. Procuro alguém para compartilhar momentos especiais.",
    foto: "/images/5.jpg",
    imagem: "/images/5.jpg",
    interesses: ["Teatro", "Vinhos", "Gastronomia"]
  },
  {
    id: 6,
    nome: "Beatriz, 33",
    idade: 33,
    cidade: "Salvador",
    estado: "BA",
    bio: "Empreendedora, gosto de esportes, natureza e viagens. Busco alguém com energia para viver!",
    distancia: "11km",
    descricao: "Empreendedora, gosto de esportes, natureza e viagens. Busco alguém com energia para viver!",
    foto: "/images/6.png",
    imagem: "/images/6.png",
    interesses: ["Esportes", "Natureza", "Viagens"]
  },
  {
    id: 7,
    nome: "Luciana, 39",
    idade: 39,
    cidade: "Fortaleza",
    estado: "CE",
    bio: "Professora, aprecio arte, cinema e boa literatura. Procuro companhia para momentos culturais.",
    distancia: "8km",
    descricao: "Professora, aprecio arte, cinema e boa literatura. Procuro companhia para momentos culturais.",
    foto: "/images/7.jpg",
    imagem: "/images/7.jpg",
    interesses: ["Arte", "Cinema", "Literatura"]
  },
  {
    id: 8,
    nome: "Camila, 34",
    idade: 34,
    cidade: "Porto Alegre",
    estado: "RS",
    bio: "Arquiteta, amo design, fotografia e gastronomia. Busco alguém para compartilhar experiências criativas.",
    distancia: "4km",
    descricao: "Arquiteta, amo design, fotografia e gastronomia. Busco alguém para compartilhar experiências criativas.",
    foto: "/images/8.jpg",
    imagem: "/images/8.jpg",
    interesses: ["Design", "Fotografia", "Gastronomia"]
  },
  {
    id: 9,
    nome: "Eduarda, 30",
    idade: 30,
    cidade: "Recife",
    estado: "PE",
    bio: "Jornalista, adoro música, dança e viagens. Procuro alguém divertido para momentos especiais.",
    distancia: "4km",
    descricao: "Jornalista, adoro música, dança e viagens. Procuro alguém divertido para momentos especiais.",
    foto: "/images/9.jpg",
    imagem: "/images/9.jpg",
    interesses: ["Música", "Dança", "Viagens"]
  },
  {
    id: 10,
    nome: "Gabriela, 38",
    idade: 38,
    cidade: "Manaus",
    estado: "AM",
    bio: "Psicóloga, gosto de yoga, meditação e natureza. Busco conexões genuínas e profundas.",
    distancia: "13km",
    descricao: "Psicóloga, gosto de yoga, meditação e natureza. Busco conexões genuínas e profundas.",
    foto: "/images/10.png",
    imagem: "/images/10.png",
    interesses: ["Yoga", "Meditação", "Natureza"]
  },
  {
    id: 11,
    nome: "Renata, 36",
    idade: 36,
    cidade: "Florianópolis",
    estado: "SC",
    bio: "Empresária, adoro festas, eventos sociais e networking. Procuro alguém animado para me acompanhar.",
    distancia: "9km",
    descricao: "Empresária, adoro festas, eventos sociais e networking. Procuro alguém animado para me acompanhar.",
    foto: "/images/011.jpg",
    imagem: "/images/011.jpg",
    interesses: ["Festas", "Eventos", "Networking"]
  },
  {
    id: 12,
    nome: "Mariana, 31",
    idade: 31,
    cidade: "Natal",
    estado: "RN",
    bio: "Nutricionista, amo culinária saudável, esportes e vida ao ar livre. Busco parceria para aventuras.",
    distancia: "6km",
    descricao: "Nutricionista, amo culinária saudável, esportes e vida ao ar livre. Busco parceria para aventuras.",
    foto: "/images/12.jpg",
    imagem: "/images/12.jpg",
    interesses: ["Culinária", "Esportes", "Natureza"]
  },
  {
    id: 13,
    nome: "Vanessa, 33",
    idade: 33,
    cidade: "Goiânia",
    estado: "GO",
    bio: "Designer, apaixonada por arte, moda e tecnologia. Procuro alguém criativo e interessante.",
    distancia: "11km",
    descricao: "Designer, apaixonada por arte, moda e tecnologia. Procuro alguém criativo e interessante.",
    foto: "/images/13.jpg",
    imagem: "/images/13.jpg",
    interesses: ["Arte", "Moda", "Tecnologia"]
  }
];

// Notificações 
export const notificacoes = [
  {
    id: 1,
    nome: "Eduarda",
    distancia: "4 km",
    mensagem: "Te enviou uma curtida",
    tempo: "Agora mesmo",
    imagem: "/images/2.jpg",
    foto: "/images/2.jpg"
  },
  {
    id: 2,
    nome: "Camila",
    distancia: "2 km",
    mensagem: "Te enviou uma mensagem",
    tempo: "Agora mesmo",
    imagem: "/images/3.jpg",
    foto: "/images/3.jpg"
  }
];

// Respostas automáticas
export const respostasAutomaticas = [
  // Respostas para interações com usuários
  "Isso é interessante!",
  "Me conta mais sobre isso...",
  "Adorei sua mensagem!",
  "Que legal! 😊",
  "Entendi. E o que mais?",
  "Que legal! Gostei da sua mensagem.",
  "Estou gostando de falar com você!",
  "Me fala mais sobre você?",
  "Você parece ser uma pessoa interessante.",
  "Acho que temos muito em comum.",
  "Podemos marcar de nos encontrar algum dia?",
  "O que você faz no seu tempo livre?",
  "Adorei conversar com você!",
  "Você tem algum hobby interessante?",
  "Estou pensando em ir ao cinema esse fim de semana, quer vir?",
  "Me conte mais sobre o seu trabalho.",
  "Você gosta de viajar?"
];

// Mensagens iniciais para contatos
export const mensagensIniciais = [
  "Oi, tudo bem? Gostei do seu perfil!",
  "Olá! Que bom que demos match! Como vai?",
  "Oi! Seu perfil me chamou atenção. O que você gosta de fazer?",
  "Oi, tudo bem? Vi que temos alguns interesses em comum!",
  "Olá! Que legal termos dado match! O que você anda fazendo?",
  "Oi! Quais são seus planos para o fim de semana?",
  "Oi! Acabei de ver seu perfil e achei interessante. Podemos conversar mais?",
  "Olá! Que tipo de música você gosta?",
  "Oi! Adorei seu perfil. Você parece ser uma pessoa interessante!",
  "Olá! Acabamos de dar match! Queria te conhecer melhor.",
  "Oi! Vi que temos gostos parecidos. O que você acha de conversarmos?",
  "Olá! Gostei das suas fotos. Você é fotogênico!"
];

// Contatos base para a página de contatos
export const contatosBase = [
  {
    id: 1,
    nome: "Carolina",
    ultimaMensagem: "Oi, tudo bem? Gostei do seu perfil!",
    horaUltimaMensagem: "10:30",
    imagem: "/images/1.jpg",
    foto: "/images/1.jpg",
    online: true,
    mensagens: [
      { id: 1, texto: "Oi, tudo bem? Gostei do seu perfil!", enviada: false, hora: "10:30" },
      { id: 2, texto: "Olá! Tudo ótimo, obrigado por entrar em contato!", enviada: true, hora: "10:35" },
      { id: 3, texto: "Percebi que você gosta de cinema, tem algum filme favorito?", enviada: false, hora: "10:37" },
      { id: 4, texto: "Adoro filmes de suspense e sci-fi! E você?", enviada: true, hora: "10:40" }
    ]
  },
  {
    id: 2,
    nome: "Patrícia",
    ultimaMensagem: "Adorei seu perfil, vamos conversar mais?",
    horaUltimaMensagem: "09:15",
    imagem: "/images/2.jpg",
    foto: "/images/2.jpg",
    online: false,
    mensagens: [
      { id: 1, texto: "Adorei seu perfil, vamos conversar mais?", enviada: false, hora: "09:15" }
    ]
  },
  {
    id: 3,
    nome: "Amanda",
    ultimaMensagem: "Oi, quando podemos nos encontrar?",
    horaUltimaMensagem: "Ontem",
    imagem: "/images/3.jpg",
    foto: "/images/3.jpg",
    online: true,
    mensagens: [
      { id: 1, texto: "Oi, como vai?", enviada: false, hora: "Ontem 18:30" },
      { id: 2, texto: "Estou bem! E você?", enviada: true, hora: "Ontem 18:35" },
      { id: 3, texto: "Também! Adorei conversarmos ontem", enviada: false, hora: "Ontem 18:40" },
      { id: 4, texto: "Eu também! Foi muito legal", enviada: true, hora: "Ontem 18:45" },
      { id: 5, texto: "Oi, quando podemos nos encontrar?", enviada: false, hora: "Ontem 20:15" }
    ]
  }
];

// Dados para a página de likes (pessoas que curtiram o usuário)
export const pessoasQueCurtiraraUsuario = [
  {
    id: 1,
    nome: "Carolina, 32",
    distancia: "5km",
    imagem: "/images/1.jpg",
    foto: "/images/1.jpg"
  },
  {
    id: 2,
    nome: "Patrícia, 35",
    distancia: "7km",
    imagem: "/images/2.jpg",
    foto: "/images/2.jpg"
  },
  {
    id: 3,
    nome: "Amanda, 37",
    distancia: "3km",
    imagem: "/images/3.jpg",
    foto: "/images/3.jpg"
  },
  {
    id: 4,
    nome: "Juliana, 40",
    distancia: "8km",
    imagem: "/images/4.jpg",
    foto: "/images/4.jpg"
  },
  {
    id: 5,
    nome: "Fernanda, 36",
    distancia: "7km",
    imagem: "/images/5.jpg",
    foto: "/images/5.jpg"
  },
  {
    id: 6,
    nome: "Beatriz, 33",
    distancia: "11km",
    imagem: "/images/6.png",
    foto: "/images/6.png"
  }
];

// Dados para a página de chat
export const chatData = {
  usuarios: {
    "1": {
      id: 1,
      nome: "Carolina",
      foto: "/images/1.jpg",
      online: true
    },
    "2": {
      id: 2,
      nome: "Patrícia",
      foto: "/images/2.jpg",
      online: false
    },
    "3": {
      id: 3,
      nome: "Amanda",
      foto: "/images/3.jpg",
      online: true
    },
    "4": {
      id: 4,
      nome: "Juliana",
      foto: "/images/4.jpg",
      online: false
    }
  },
  mensagensPorConversa: {
    "1": [
      { id: 1, texto: "Oi, tudo bem? Gostei do seu perfil!", remetente: "outro", horario: "14:30" },
      { id: 2, texto: "Oi! Tudo ótimo, também gostei do seu perfil. O que você gosta de fazer?", remetente: "eu", horario: "14:32" },
      { id: 3, texto: "Adoro cinema, restaurantes e viajar. E você?", remetente: "outro", horario: "14:35" },
      { id: 4, texto: "Também gosto dessas coisas! Que tipo de filmes você curte?", remetente: "eu", horario: "14:40" },
      { id: 5, texto: "Gosto de filmes de suspense, romance e comédia. Poderíamos ir ao cinema qualquer dia desses.", remetente: "outro", horario: "14:45" }
    ],
    "2": [
      { id: 1, texto: "Quando vamos nos encontrar?", remetente: "outro", horario: "12:15" },
      { id: 2, texto: "Podemos marcar para essa semana, que tal?", remetente: "eu", horario: "12:20" },
      { id: 3, texto: "Perfeito! Quinta-feira à noite está bom para você?", remetente: "outro", horario: "12:25" },
      { id: 4, texto: "Quinta é perfeito! Onde podemos nos encontrar?", remetente: "eu", horario: "12:28" }
    ],
    "3": [
      { id: 1, texto: "Adorei conversar com você ontem.", remetente: "outro", horario: "Ontem" },
      { id: 2, texto: "Eu também! Foi um papo muito agradável.", remetente: "eu", horario: "Ontem" },
      { id: 3, texto: "Queria te conhecer melhor. Qual sua cor favorita?", remetente: "outro", horario: "Ontem" },
      { id: 4, texto: "Azul! E a sua?", remetente: "eu", horario: "Ontem" },
      { id: 5, texto: "Roxo. E comida favorita?", remetente: "outro", horario: "Hoje" }
    ],
    "4": [
      { id: 1, texto: "Me manda o local do nosso encontro.", remetente: "outro", horario: "Seg" },
      { id: 2, texto: "Vamos ao restaurante Delícias da Terra, fica na Av. Principal, 123", remetente: "eu", horario: "Seg" },
      { id: 3, texto: "Perfeito! Já sei onde é. Nos vemos lá às 20h?", remetente: "outro", horario: "Seg" },
      { id: 4, texto: "Combinado! Estou ansioso para te conhecer pessoalmente.", remetente: "eu", horario: "Seg" }
    ]
  }
};

// Função para obter uma mensagem inicial aleatória
export function getMensagemInicial() {
  const indice = Math.floor(Math.random() * mensagensIniciais.length);
  return mensagensIniciais[indice];
}

// Função para obter uma resposta automática aleatória
export function getRespostaAutomatica() {
  const indice = Math.floor(Math.random() * respostasAutomaticas.length);
  return respostasAutomaticas[indice];
}

// Função para encontrar perfil por ID - útil para o sistema de matches
export function encontrarPerfilPorId(id) {
  const perfil = perfis.find(p => p.id === parseInt(id));
  return perfil || null;
}

// Exporta todos os dados em um objeto único para quem preferir importar tudo de uma vez
export default {
  perfis,
  notificacoes,
  respostasAutomaticas,
  mensagensIniciais,
  contatosBase,
  pessoasQueCurtiraraUsuario,
  chatData,
  getMensagemInicial,
  getRespostaAutomatica,
  encontrarPerfilPorId
}; 