// Arquivo centralizado para todos os dados mockados
// Combina os dados de perfis, notificações, respostas, contatos, chats e likes

// Perfis de mulheres
export const mulheres = [
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
    interesses: ["Cinema", "Viagens", "Gastronomia"],
    respostasAutomaticas: ["Que legal! Vi que voce gosta de cinema, qual seu filme favorito?", "Me conte mais sobre você! O que você faz?"],
    audios: [
      { id: 1, texto: "Oi, tudo bem? É tão bom falar com você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Estou muito animada para nos conhecermos melhor!", tipo: "randomizado" },
      { id: 3, texto: "Estava lendo sobre você e me identifiquei bastante!", tipo: "randomizado" },
      { id: 4, texto: "Quais são seus planos para hoje?", tipo: "randomizado" },
      { id: 5, texto: "Mal posso esperar para saber mais sobre você.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Carolina",
        distancia: "5km",
        mensagem: "Te enviou uma curtida",
        tempo: "Agora mesmo",
        imagem: "/images/1.jpg",
        foto: "/images/1.jpg"
      }
    ],
    contatosBase: [
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
      }
    ],
    dadosCurtida: [
      {
        id: 1,
        nome: "Carolina, 32",
        distancia: "5km",
        imagem: "/images/1.jpg",
        foto: "/images/1.jpg"
      }
    ]
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
    interesses: ["Leitura", "Vinhos", "Passeios"],
    respostasAutomaticas: ["Nossa, seu gosto por leitura é fascinante!", "Estou curiosa para saber mais sobre suas viagens, me conta!"],
    audios: [
      { id: 1, texto: "Oi, tudo bem? É um prazer falar com você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que temos muito em comum, estou bem animada!", tipo: "randomizado" },
      { id: 3, texto: "Estava vendo suas fotos e amei!", tipo: "randomizado" },
      { id: 4, texto: "Você tem planos para o fim de semana?", tipo: "randomizado" },
      { id: 5, texto: "Espero que possamos nos conhecer melhor!", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Patrícia",
        distancia: "7km",
        mensagem: "Te enviou uma curtida",
        tempo: "Agora mesmo",
        imagem: "/images/2.jpg",
        foto: "/images/2.jpg"
      }
    ],
    contatosBase: [
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
      }
    ],
    dadosCurtida: [
      {
        id: 2,
        nome: "Patrícia, 35",
        distancia: "7km",
        imagem: "/images/2.jpg",
        foto: "/images/2.jpg"
      }
    ]
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
    interesses: ["Música", "Fitness", "Festas"],
    respostasAutomaticas: ["Que demais! Eu amo sair para dançar. Vamos um dia?", "Fico feliz em saber que você também é fitness!"],
    audios: [
      { id: 1, texto: "Olá! Estou tão contente que nos encontramos! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que temos muita coisa pra compartilhar.", tipo: "randomizado" },
      { id: 3, texto: "Sinto que nos daremos super bem!", tipo: "randomizado" },
      { id: 4, texto: "O que você acha de marcarmos algo?", tipo: "randomizado" },
      { id: 5, texto: "Estou realmente interessada em te conhecer.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Amanda",
        distancia: "3km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Agora mesmo",
        imagem: "/images/3.jpg",
        foto: "/images/3.jpg"
      }
    ],
    contatosBase: [
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
    ],
    dadosCurtida: [
      {
        id: 3,
        nome: "Amanda, 37",
        distancia: "3km",
        imagem: "/images/3.jpg",
        foto: "/images/3.jpg"
      }
    ]
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
    interesses: ["Praia", "Viagens", "Arte"],
    respostasAutomaticas: ["Me conta mais sobre seu lugar favorito no mundo!", "Que demais saber que também gosta de arte!"],
    audios: [
      { id: 1, texto: "Oi! Que prazer te conhecer, estou animada! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que vamos ter muitas histórias para compartilhar.", tipo: "randomizado" },
      { id: 3, texto: "Estou começando a achar que fomos feitos um para o outro!", tipo: "randomizado" },
      { id: 4, texto: "Podemos combinar de fazer algo diferente um dia desses.", tipo: "randomizado" },
      { id: 5, texto: "Tenho a sensação de que vamos nos dar muito bem.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Juliana",
        distancia: "8km",
        mensagem: "Te enviou uma curtida",
        tempo: "Há 5 minutos",
        imagem: "/images/4.jpg",
        foto: "/images/4.jpg"
      }
    ],
    contatosBase: [
       {
        id: 4,
        nome: "Juliana",
        ultimaMensagem: "Oi! Vi que você curtiu meu perfil.",
        horaUltimaMensagem: "11:00",
        imagem: "/images/4.jpg",
        foto: "/images/4.jpg",
        online: false,
        mensagens: [
          { id: 1, texto: "Oi! Vi que você curtiu meu perfil.", enviada: false, hora: "11:00" },
          { id: 2, texto: "Olá Juliana! Adorei suas fotos de viagem.", enviada: true, hora: "11:05" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 4,
        nome: "Juliana, 40",
        distancia: "8km",
        imagem: "/images/4.jpg",
        foto: "/images/4.jpg"
      }
    ]
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
    interesses: ["Teatro", "Vinhos", "Gastronomia"],
    respostasAutomaticas: ["Que incrível! Também sou fascinada por vinho.", "Adoro descobrir novos restaurantes, vamos juntos?"],
    audios: [
      { id: 1, texto: "Oi, tudo bem? Que bom que nos encontramos! 😊", tipo: "saudacao" },
      { id: 2, texto: "Já estou me sentindo bem próxima de você.", tipo: "randomizado" },
      { id: 3, texto: "Você é exatamente o tipo de pessoa que eu estava procurando.", tipo: "randomizado" },
      { id: 4, texto: "Estou pensando em fazer algo diferente, o que acha de se juntar a mim?", tipo: "randomizado" },
      { id: 5, texto: "Estou ansiosa para saber mais sobre você.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Fernanda",
        distancia: "7km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Há 10 minutos",
        imagem: "/images/5.jpg",
        foto: "/images/5.jpg"
      }
    ],
    contatosBase: [
      {
        id: 5,
        nome: "Fernanda",
        ultimaMensagem: "Que legal que você gosta de teatro também!",
        horaUltimaMensagem: "14:20",
        imagem: "/images/5.jpg",
        foto: "/images/5.jpg",
        online: true,
        mensagens: [
          { id: 1, texto: "Oi Fernanda! Adorei seu perfil.", enviada: true, hora: "14:15" },
          { id: 2, texto: "Olá! Obrigada! Vi que você também curte teatro.", enviada: false, hora: "14:18" },
          { id: 3, texto: "Sim! Qual foi a última peça que você viu?", enviada: true, hora: "14:19" },
          { id: 4, texto: "Que legal que você gosta de teatro também!", enviada: false, hora: "14:20" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 5,
        nome: "Fernanda, 36",
        distancia: "7km",
        imagem: "/images/5.jpg",
        foto: "/images/5.jpg"
      }
    ]
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
    interesses: ["Esportes", "Natureza", "Viagens"],
    respostasAutomaticas: ["Que legal! Também amo natureza.", "Adoro viajar! Qual seu destino dos sonhos?"],
    audios: [
      { id: 1, texto: "Oi, que bom que temos a chance de conversar! 😊", tipo: "saudacao" },
      { id: 2, texto: "Sinto que temos tudo a ver!", tipo: "randomizado" },
      { id: 3, texto: "Você me parece ser uma pessoa muito legal.", tipo: "randomizado" },
      { id: 4, texto: "Estou a fim de sair da rotina, o que acha de fazermos algo juntos?", tipo: "randomizado" },
      { id: 5, texto: "Estou curiosa para te conhecer melhor.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Beatriz",
        distancia: "11km",
        mensagem: "Te enviou uma curtida",
        tempo: "Há 15 minutos",
        imagem: "/images/6.png",
        foto: "/images/6.png"
      }
    ],
    contatosBase: [
       {
        id: 6,
        nome: "Beatriz",
        ultimaMensagem: "Vamos marcar uma trilha?",
        horaUltimaMensagem: "Ontem 10:00",
        imagem: "/images/6.png",
        foto: "/images/6.png",
        online: false,
        mensagens: [
          { id: 1, texto: "Oi Beatriz, vi que você gosta de esportes!", enviada: true, hora: "Ontem 09:50" },
          { id: 2, texto: "Oii! Sim, adoro! Principalmente ao ar livre.", enviada: false, hora: "Ontem 09:55" },
          { id: 3, texto: "Vamos marcar uma trilha?", enviada: false, hora: "Ontem 10:00" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 6,
        nome: "Beatriz, 33",
        distancia: "11km",
        imagem: "/images/6.png",
        foto: "/images/6.png"
      }
    ]
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
    interesses: ["Arte", "Cinema", "Literatura"],
    respostasAutomaticas: ["Nossa, você é muito culto!", "Me indique um livro que você goste!"],
    audios: [
      { id: 1, texto: "Oi! É tão bom encontrar alguém como você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que podemos ter conversas muito interessantes.", tipo: "randomizado" },
      { id: 3, texto: "Você parece ser o tipo de pessoa que eu procurava!", tipo: "randomizado" },
      { id: 4, texto: "Vamos fazer algo cultural juntos qualquer dia desses?", tipo: "randomizado" },
      { id: 5, texto: "Estou ansiosa para nos conhecermos pessoalmente.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Luciana",
        distancia: "8km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Há 20 minutos",
        imagem: "/images/7.jpg",
        foto: "/images/7.jpg"
      }
    ],
    contatosBase: [
      {
        id: 7,
        nome: "Luciana",
        ultimaMensagem: "Qual seu livro favorito?",
        horaUltimaMensagem: "08:45",
        imagem: "/images/7.jpg",
        foto: "/images/7.jpg",
        online: true,
        mensagens: [
          { id: 1, texto: "Olá Luciana, tudo bem? Vi que você gosta de literatura.", enviada: true, hora: "08:40" },
          { id: 2, texto: "Oi! Tudo sim! Adoro ler.", enviada: false, hora: "08:42" },
          { id: 3, texto: "Qual seu livro favorito?", enviada: false, hora: "08:45" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 7,
        nome: "Luciana, 39",
        distancia: "8km",
        imagem: "/images/7.jpg",
        foto: "/images/7.jpg"
      }
    ]
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
    interesses: ["Design", "Fotografia", "Gastronomia"],
    respostasAutomaticas: ["Nossa, design é tão legal!", "Que bom que também gosta de gastronomia! Temos muito em comum!"],
    audios: [
      { id: 1, texto: "Oi! Que prazer conhecer você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Tenho a sensação de que seremos bons amigos.", tipo: "randomizado" },
      { id: 3, texto: "Você é a pessoa que eu estava esperando conhecer!", tipo: "randomizado" },
      { id: 4, texto: "O que acha de fazermos algo divertido juntos?", tipo: "randomizado" },
      { id: 5, texto: "Estou muito feliz por te conhecer.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Camila",
        distancia: "4km",
        mensagem: "Te enviou uma curtida",
        tempo: "Há 25 minutos",
        imagem: "/images/8.jpg",
        foto: "/images/8.jpg"
      }
    ],
    contatosBase: [
       {
        id: 8,
        nome: "Camila",
        ultimaMensagem: "Adorei suas fotos! Você tem talento.",
        horaUltimaMensagem: "15:00",
        imagem: "/images/8.jpg",
        foto: "/images/8.jpg",
        online: false,
        mensagens: [
          { id: 1, texto: "Oi Camila! Vi que você curte fotografia.", enviada: true, hora: "14:55" },
          { id: 2, texto: "Oii! Sim, é uma paixão.", enviada: false, hora: "14:58" },
          { id: 3, texto: "Adorei suas fotos! Você tem talento.", enviada: false, hora: "15:00" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 8,
        nome: "Camila, 34",
        distancia: "4km",
        imagem: "/images/8.jpg",
        foto: "/images/8.jpg"
      }
    ]
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
    interesses: ["Música", "Dança", "Viagens"],
    respostasAutomaticas: ["Que incrível! Eu amo dançar!", "Que legal que gosta de viajar! Temos tanto a conversar!"],
    audios: [
      { id: 1, texto: "Oi! É tão bom ter você por aqui! 😊", tipo: "saudacao" },
      { id: 2, texto: "Sinto que podemos ter muitos momentos especiais juntos.", tipo: "randomizado" },
      { id: 3, texto: "Você é tudo que eu estava procurando.", tipo: "randomizado" },
      { id: 4, texto: "Vamos planejar algo divertido para fazermos?", tipo: "randomizado" },
      { id: 5, texto: "Estou muito contente por termos nos encontrado.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Eduarda",
        distancia: "4km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Há 30 minutos",
        imagem: "/images/9.jpg",
        foto: "/images/9.jpg"
      }
    ],
    contatosBase: [
      {
        id: 9,
        nome: "Eduarda",
        ultimaMensagem: "Vamos sair pra dançar um dia?",
        horaUltimaMensagem: "16:30",
        imagem: "/images/9.jpg",
        foto: "/images/9.jpg",
        online: true,
        mensagens: [
          { id: 1, texto: "Oi Eduarda! Que energia boa no seu perfil!", enviada: true, hora: "16:25" },
          { id: 2, texto: "Oii! Obrigada! Adoro me divertir.", enviada: false, hora: "16:28" },
          { id: 3, texto: "Vi que você gosta de dançar...", enviada: true, hora: "16:29" },
          { id: 4, texto: "Amo! Vamos sair pra dançar um dia?", enviada: false, hora: "16:30" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 9,
        nome: "Eduarda, 30",
        distancia: "4km",
        imagem: "/images/9.jpg",
        foto: "/images/9.jpg"
      }
    ]
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
    interesses: ["Yoga", "Meditação", "Natureza"],
    respostasAutomaticas: ["Nossa, que legal! Também amo meditar!", "Amo natureza, vamos fazer trilhas juntos?"],
    audios: [
      { id: 1, texto: "Oi! É maravilhoso falar com você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que nossos estilos combinam muito.", tipo: "randomizado" },
      { id: 3, texto: "Você é exatamente o tipo de pessoa que eu queria encontrar!", tipo: "randomizado" },
      { id: 4, texto: "O que acha de nos conectarmos ainda mais?", tipo: "randomizado" },
      { id: 5, texto: "Estou animada para te conhecer melhor.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Gabriela",
        distancia: "13km",
        mensagem: "Te enviou uma curtida",
        tempo: "Há 35 minutos",
        imagem: "/images/10.png",
        foto: "/images/10.png"
      }
    ],
    contatosBase: [
       {
        id: 10,
        nome: "Gabriela",
        ultimaMensagem: "Que ótimo encontrar alguém que também gosta de meditação!",
        horaUltimaMensagem: "09:00",
        imagem: "/images/10.png",
        foto: "/images/10.png",
        online: false,
        mensagens: [
          { id: 1, texto: "Oi Gabriela, paz e luz!", enviada: true, hora: "08:55" },
          { id: 2, texto: "Olá! Paz! Que ótimo encontrar alguém que também gosta de meditação!", enviada: false, hora: "09:00" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 10,
        nome: "Gabriela, 38",
        distancia: "13km",
        imagem: "/images/10.png",
        foto: "/images/10.png"
      }
    ]
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
    interesses: ["Festas", "Eventos", "Networking"],
    respostasAutomaticas: ["Que demais! Também amo eventos!", "Amo fazer networking! Podemos trocar contatos?"],
    audios: [
      { id: 1, texto: "Oi! Estou muito feliz em ter você por aqui! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que temos muito a conversar.", tipo: "randomizado" },
      { id: 3, texto: "Você parece ser a pessoa perfeita para mim!", tipo: "randomizado" },
      { id: 4, texto: "Vamos animar um pouco e nos divertir?", tipo: "randomizado" },
      { id: 5, texto: "Estou muito contente por te conhecer.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Renata",
        distancia: "9km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Há 40 minutos",
        imagem: "/images/011.jpg",
        foto: "/images/011.jpg"
      }
    ],
    contatosBase: [
      {
        id: 11,
        nome: "Renata",
        ultimaMensagem: "Adoro festas! Qual a próxima que você vai?",
        horaUltimaMensagem: "17:10",
        imagem: "/images/011.jpg",
        foto: "/images/011.jpg",
        online: true,
        mensagens: [
          { id: 1, texto: "Oi Renata! Seu perfil é super animado!", enviada: true, hora: "17:05" },
          { id: 2, texto: "Oii! Obrigada! Gosto de agito!", enviada: false, hora: "17:08" },
          { id: 3, texto: "Adoro festas! Qual a próxima que você vai?", enviada: false, hora: "17:10" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 11,
        nome: "Renata, 36",
        distancia: "9km",
        imagem: "/images/011.jpg",
        foto: "/images/011.jpg"
      }
    ]
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
    interesses: ["Culinária", "Esportes", "Natureza"],
    respostasAutomaticas: ["Que demais! Amo cozinhar coisas saudáveis!", "Adoro viver na natureza! Vamos fazer trilhas?"],
    audios: [
      { id: 1, texto: "Oi! Que legal te encontrar por aqui! 😊", tipo: "saudacao" },
      { id: 2, texto: "Parece que temos tudo a ver um com o outro!", tipo: "randomizado" },
      { id: 3, texto: "Você é tudo que eu estava buscando!", tipo: "randomizado" },
      { id: 4, texto: "O que acha de fazermos algo diferente juntos?", tipo: "randomizado" },
      { id: 5, texto: "Estou realmente interessada em nos conhecermos.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Mariana",
        distancia: "6km",
        mensagem: "Te enviou uma curtida",
        tempo: "Há 45 minutos",
        imagem: "/images/12.jpg",
        foto: "/images/12.jpg"
      }
    ],
    contatosBase: [
       {
        id: 12,
        nome: "Mariana",
        ultimaMensagem: "Que bom! Adoro cozinhar também.",
        horaUltimaMensagem: "10:50",
        imagem: "/images/12.jpg",
        foto: "/images/12.jpg",
        online: false,
        mensagens: [
          { id: 1, texto: "Oi Mariana! Vi que você é nutri e curte culinária saudável.", enviada: true, hora: "10:45" },
          { id: 2, texto: "Oii! Sim, é minha paixão!", enviada: false, hora: "10:48" },
          { id: 3, texto: "Que bom! Adoro cozinhar também.", enviada: false, hora: "10:50" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 12,
        nome: "Mariana, 31",
        distancia: "6km",
        imagem: "/images/12.jpg",
        foto: "/images/12.jpg"
      }
    ]
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
    interesses: ["Arte", "Moda", "Tecnologia"],
    respostasAutomaticas: ["Que demais! Também sou fascinada por arte!", "Amo tecnologia, podemos trocar dicas!"],
    audios: [
      { id: 1, texto: "Oi, tudo bem? É ótimo conhecer você! 😊", tipo: "saudacao" },
      { id: 2, texto: "Acho que podemos ter conversas bem interessantes.", tipo: "randomizado" },
      { id: 3, texto: "Sinto que você é uma pessoa muito especial!", tipo: "randomizado" },
      { id: 4, texto: "Vamos pensar em algo divertido para fazermos?", tipo: "randomizado" },
      { id: 5, texto: "Estou ansiosa para te conhecer melhor.", tipo: "randomizado" }
    ],
    notificacoes: [
      {
        id: 1,
        nome: "Vanessa",
        distancia: "11km",
        mensagem: "Te enviou uma mensagem",
        tempo: "Há 50 minutos",
        imagem: "/images/13.jpg",
        foto: "/images/13.jpg"
      }
    ],
    contatosBase: [
      {
        id: 13,
        nome: "Vanessa",
        ultimaMensagem: "Legal! Adoro arte também.",
        horaUltimaMensagem: "18:00",
        imagem: "/images/13.jpg",
        foto: "/images/13.jpg",
        online: true,
        mensagens: [
          { id: 1, texto: "Oi Vanessa! Vi que você é designer.", enviada: true, hora: "17:55" },
          { id: 2, texto: "Oii! Sou sim.", enviada: false, hora: "17:58" },
          { id: 3, texto: "Legal! Adoro arte também.", enviada: false, hora: "18:00" }
        ]
      }
    ],
    dadosCurtida: [
      {
        id: 13,
        nome: "Vanessa, 33",
        distancia: "11km",
        imagem: "/images/13.jpg",
        foto: "/images/13.jpg"
      }
    ]
  }
];

// Função para obter uma mensagem inicial aleatória
export function getMensagemInicial(mulherId) {
  
  const mulher = mulheres.find(m => m.id === parseInt(mulherId));
  
  
  if (mulher && mulher.contatosBase && mulher.contatosBase.length > 0) {
    const mensagemInicial = mulher.contatosBase[0].mensagens[0].texto;
    
    return mensagemInicial;
  }
  
  
  return null;
}

// Função para obter uma resposta automática aleatória
export function getRespostaAutomatica(mulherId) {
  
  const mulher = mulheres.find(m => m.id === parseInt(mulherId));
  
  
  if (mulher && mulher.respostasAutomaticas && mulher.respostasAutomaticas.length > 0) {
    const indice = Math.floor(Math.random() * mulher.respostasAutomaticas.length);
    
    const resposta = mulher.respostasAutomaticas[indice];
    
    return resposta;
  }
  
  
  return "Estou gostando muito de conversar com você!";
}

// Função para encontrar perfil por ID - útil para o sistema de matches
export function encontrarPerfilPorId(id) {
  
  const mulher = mulheres.find(m => m.id === parseInt(id));
  
  return mulher || null;
}


export default { 
  mulheres, 
  getMensagemInicial,
  getRespostaAutomatica,
  encontrarPerfilPorId
};

