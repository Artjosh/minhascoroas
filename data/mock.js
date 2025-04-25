// Perfis para a timeline de curtidas
const perfis = [
  {
    id: 1,
    nome: "Carolina, 32",
    foto: "/images/perfis/carolina.jpg",
    descricao: "Apaixonada por cinema e viagens",
    interesses: ["Cinema", "Viagens", "Música"],
    cidade: "São Paulo, SP"
  },
  {
    id: 2,
    nome: "Patrícia, 35",
    foto: "/images/perfis/patricia.jpg",
    descricao: "Advogada, amo viajar e conhecer lugares novos",
    interesses: ["Viagens", "Gastronomia", "Vinhos"],
    cidade: "Rio de Janeiro, RJ"
  },
  {
    id: 3,
    nome: "Amanda, 33",
    foto: "/images/perfis/amanda.jpg",
    descricao: "Empresária e pianista nas horas vagas",
    interesses: ["Música", "Arte", "Teatro"],
    cidade: "Curitiba, PR"
  }
];

// Notificações para a timeline
const notificacoes = [
  {
    id: 1,
    texto: "Carolina curtiu seu perfil!",
    foto: "/images/perfis/carolina.jpg"
  },
  {
    id: 2,
    texto: "Patrícia quer te conhecer!",
    foto: "/images/perfis/patricia.jpg"
  }
];

// Dados mockados para o chat
const chatData = {
  usuarios: {
    1: {
      id: 1,
      nome: "Carolina",
      foto: "/images/perfis/carolina.jpg",
      online: true
    },
    2: {
      id: 2,
      nome: "Patrícia",
      foto: "/images/perfis/patricia.jpg",
      online: false
    }
  },
  mensagensPorConversa: {
    1: [
      {
        id: 1,
        texto: "Olá! Tudo bem?",
        enviada: false,
        hora: "14:30"
      }
    ],
    2: [
      {
        id: 1,
        texto: "Oi! Como vai?",
        enviada: false,
        hora: "15:45"
      }
    ]
  }
};

// Respostas automáticas para simular interação
const respostasAutomaticas = [
  "Que legal! Me conta mais sobre isso...",
  "Interessante! E o que você acha?",
  "Adorei sua perspectiva!",
  "Sim, concordo com você!",
  "Que tal marcarmos algo então?",
  "Isso me parece ótimo!"
];

// Função para obter uma resposta aleatória
const getRespostaAutomatica = () => {
  const indice = Math.floor(Math.random() * respostasAutomaticas.length);
  return respostasAutomaticas[indice];
};

export default {
  perfis,
  notificacoes,
  chatData,
  getRespostaAutomatica
}; 