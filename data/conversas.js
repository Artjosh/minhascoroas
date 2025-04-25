/**
 * Dados mockados de conversas para usuários
 * Este arquivo serve como fonte de dados para mensagens predefinidas entre usuários e seus matches
 */

/**
 * Sistema de fluxo de conversas predefinidas
 * Cada perfil tem seu próprio fluxo de 10 etapas de mensagens
 * A segunda etapa sempre contém 2 áudios
 */

import { perfis } from './mock';

// Função auxiliar para gerar ID único
const generateId = () => Math.floor(Math.random() * 100000);

// Estrutura de mensagem de áudio
const criarMensagemAudio = (duracao = "0:30", texto) => ({
  id: generateId(),
  tipo: "audio",
  texto,
  duracao,
  enviada: false
});

// Função para criar etapa de texto
const criarEtapaTexto = (texto) => ({
  mensagens: [
    {
      id: generateId(),
      tipo: "texto",
      texto,
      enviada: false
    }
  ]
});

// Função para criar etapa de áudio
const criarEtapaAudio = (audio1, audio2) => ({
  mensagens: [
    criarMensagemAudio("0:45", audio1),
    criarMensagemAudio("1:20", audio2)
  ]
});

// Fluxos de conversa para cada perfil
export const fluxosConversa = {
  // Carolina (ID 1) - Cinema e Viagens
  "1": {
    etapas: [
      criarEtapaTexto("Oi! Que legal que demos match! Adoro conhecer pessoas novas 😊"),
      criarEtapaAudio(
        "Oi, queria me apresentar melhor... Sou a Carol, tenho 32 anos e sou apaixonada por cinema!",
        "Adoro filmes de todos os gêneros, mas tenho uma queda especial por suspense e ficção científica..."
      ),
      criarEtapaTexto("Vi que você também gosta de cinema! Qual seu gênero favorito?"),
      criarEtapaTexto("Eu adoro filmes de suspense e sci-fi! Já viu Interestelar?"),
      criarEtapaTexto("Que tal irmos ao cinema qualquer dia desses? 🎬"),
      criarEtapaTexto("Tem um filme muito legal em cartaz que acho que você vai gostar!"),
      criarEtapaTexto("E depois podemos tomar um café e conversar mais sobre filmes 😊"),
      criarEtapaTexto("O que você acha? Podemos marcar para esse fim de semana?"),
      criarEtapaTexto("Tenho certeza que vamos nos dar super bem!"),
      criarEtapaTexto("Me avisa qual dia fica melhor para você 😉")
    ]
  },

  // Patrícia (ID 2) - Advocacia e Viagens
  "2": {
    etapas: [
      criarEtapaTexto("Oi! Que bom que demos match! Adorei seu perfil 💜"),
      criarEtapaAudio(
        "Oi, tudo bem? Sou a Patrícia, advogada, trabalho com direito empresarial...",
        "Além da advocacia, sou apaixonada por viagens e conhecer lugares novos..."
      ),
      criarEtapaTexto("Vi que você também gosta de viajar! Qual foi seu último destino?"),
      criarEtapaTexto("Minha última viagem foi para Portugal, me apaixonei por Lisboa!"),
      criarEtapaTexto("Você já conhece Portugal? Se não, precisa conhecer!"),
      criarEtapaTexto("Os portugueses são muito receptivos e a comida é maravilhosa"),
      criarEtapaTexto("Podemos trocar dicas de viagem tomando um vinho, o que acha?"),
      criarEtapaTexto("Conheço um wine bar ótimo aqui no centro"),
      criarEtapaTexto("Seria legal te conhecer melhor e planejar futuras viagens 😊"),
      criarEtapaTexto("Me fala se você topa e qual dia seria melhor!")
    ]
  },

  // Amanda (ID 3) - Empresária e Música
  "3": {
    etapas: [
      criarEtapaTexto("Oi! Match perfeito! Que bom te conhecer 🎵"),
      criarEtapaAudio(
        "Oi! Sou a Amanda, empresária do ramo de eventos e apaixonada por música...",
        "Toco piano desde criança e adoro todos os tipos de música, especialmente jazz..."
      ),
      criarEtapaTexto("Vi que você também curte música! Qual seu estilo favorito?"),
      criarEtapaTexto("Tem um jazz bar incrível aqui perto que você precisa conhecer!"),
      criarEtapaTexto("Eles têm apresentações ao vivo toda sexta-feira"),
      criarEtapaTexto("A atmosfera é perfeita para um primeiro encontro 🎷"),
      criarEtapaTexto("Além da música excelente, o drink menu é sensacional"),
      criarEtapaTexto("O que acha de irmos nessa sexta?"),
      criarEtapaTexto("Podemos jantar e depois curtir um jazz ao vivo"),
      criarEtapaTexto("Me avisa se você topa e podemos combinar os detalhes! 😊")
    ]
  },

  // Juliana (ID 4) - Médica e Praia
  "4": {
    etapas: [
      criarEtapaTexto("Oi! Que match incrível! Adorei seu perfil 🌊"),
      criarEtapaAudio(
        "Oi! Me chamo Juliana, sou médica cardiologista e amo a vida praiana...",
        "Nos fins de semana sempre tento escapar para a praia, é minha terapia..."
      ),
      criarEtapaTexto("Você também curte praia? Qual sua preferida?"),
      criarEtapaTexto("Conheço um quiosque maravilhoso à beira-mar"),
      criarEtapaTexto("Eles servem os melhores drinks e petiscos da orla"),
      criarEtapaTexto("Que tal um encontro com pé na areia? 🏖️"),
      criarEtapaTexto("Podemos aproveitar o pôr do sol"),
      criarEtapaTexto("O lugar é perfeito para uma boa conversa"),
      criarEtapaTexto("Esse fim de semana promete sol, vai ser perfeito!"),
      criarEtapaTexto("O que me diz? Vamos aproveitar? 😊")
    ]
  },

  // Fernanda (ID 5) - Advogada e Teatro
  "5": {
    etapas: [
      criarEtapaTexto("Oi! Que match especial! Adorei nosso match 🎭"),
      criarEtapaAudio(
        "Olá! Sou Fernanda, advogada e apaixonada por teatro e artes em geral...",
        "Sempre que posso estou assistindo uma peça nova ou visitando exposições..."
      ),
      criarEtapaTexto("Vi que você também aprecia arte! Já foi ao teatro municipal?"),
      criarEtapaTexto("Tem uma peça incrível em cartaz agora"),
      criarEtapaTexto("É uma adaptação moderna de um clássico"),
      criarEtapaTexto("Que tal irmos assistir juntos?"),
      criarEtapaTexto("Depois podemos jantar e discutir a peça"),
      criarEtapaTexto("Conheço um restaurante charmoso próximo ao teatro"),
      criarEtapaTexto("Seria um programa perfeito!"),
      criarEtapaTexto("Me diz se você se interessa e podemos combinar! 🎨")
    ]
  },

  // Beatriz (ID 6) - Empreendedora e Esportes
  "6": {
    etapas: [
      criarEtapaTexto("Oi! Super match! Que bom te conhecer 🏃‍♀️"),
      criarEtapaAudio(
        "Oi! Sou a Beatriz, empreendedora e super ativa, amo esportes e aventuras...",
        "Pratico corrida, ciclismo e adoro atividades ao ar livre..."
      ),
      criarEtapaTexto("Você também curte esportes? Qual sua atividade favorita?"),
      criarEtapaTexto("Tem um parque incrível aqui perto com várias trilhas"),
      criarEtapaTexto("Que tal uma caminhada seguida de um café da manhã saudável?"),
      criarEtapaTexto("Conheço um café super charmoso com opções fitness"),
      criarEtapaTexto("Seria um programa diferente e saudável"),
      criarEtapaTexto("Podemos nos exercitar e conversar ao mesmo tempo"),
      criarEtapaTexto("O que acha de domingo de manhã?"),
      criarEtapaTexto("Me avisa se você topa essa aventura! 🌿")
    ]
  },

  // Luciana (ID 7) - Professora e Arte
  "7": {
    etapas: [
      criarEtapaTexto("Oi! Que match cultural! Adorei seu perfil 🎨"),
      criarEtapaAudio(
        "Olá! Sou Luciana, professora de história da arte e curadora...",
        "Adoro compartilhar conhecimento sobre arte e cultura..."
      ),
      criarEtapaTexto("Você se interessa por arte? Qual seu período favorito?"),
      criarEtapaTexto("Tem uma exposição incrível acontecendo no museu"),
      criarEtapaTexto("São obras contemporâneas muito interessantes"),
      criarEtapaTexto("Posso te fazer uma visita guiada especial 😊"),
      criarEtapaTexto("Depois podemos tomar um café na cafeteria do museu"),
      criarEtapaTexto("Eles têm uma vista linda da cidade"),
      criarEtapaTexto("Seria um programa muito especial"),
      criarEtapaTexto("O que acha? Vamos marcar? 🏛️")
    ]
  },

  // Camila (ID 8) - Arquiteta e Design
  "8": {
    etapas: [
      criarEtapaTexto("Oi! Match criativo! Que legal te conhecer 🎨"),
      criarEtapaAudio(
        "Oi! Sou Camila, arquiteta e apaixonada por design e fotografia...",
        "Adoro explorar a cidade fotografando prédios históricos e arte urbana..."
      ),
      criarEtapaTexto("Você também gosta de fotografia? Qual seu tema preferido?"),
      criarEtapaTexto("Conheço um roteiro incrível pelo centro histórico"),
      criarEtapaTexto("Tem muita arquitetura interessante e street art"),
      criarEtapaTexto("Podemos fazer um tour fotográfico juntos"),
      criarEtapaTexto("E depois tomar um café em um lugar super instagramável"),
      criarEtapaTexto("O que acha dessa ideia diferente?"),
      criarEtapaTexto("Seria um encontro super criativo!"),
      criarEtapaTexto("Me diz se você topa essa aventura fotográfica! 📸")
    ]
  },

  // Eduarda (ID 9) - Jornalista e Dança
  "9": {
    etapas: [
      criarEtapaTexto("Oi! Match musical! Que bom te conhecer 💃"),
      criarEtapaAudio(
        "Oi! Sou Eduarda, jornalista e apaixonada por dança e música...",
        "Faço aulas de dança de salão e adoro descobrir novos ritmos..."
      ),
      criarEtapaTexto("Você gosta de dançar? Qual seu ritmo favorito?"),
      criarEtapaTexto("Tem uma casa de shows incrível que toca música ao vivo"),
      criarEtapaTexto("O ambiente é super agradável e animado"),
      criarEtapaTexto("Que tal irmos dançar um pouco?"),
      criarEtapaTexto("Não precisa ser expert, podemos nos divertir!"),
      criarEtapaTexto("Eles também servem uns petiscos deliciosos"),
      criarEtapaTexto("Seria uma noite super animada!"),
      criarEtapaTexto("Me diz se você topa e quando podemos ir! 🎵")
    ]
  },

  // Gabriela (ID 10) - Psicóloga e Yoga
  "10": {
    etapas: [
      criarEtapaTexto("Oi! Match zen! Que bom te conhecer 🧘‍♀️"),
      criarEtapaAudio(
        "Olá! Sou Gabriela, psicóloga e instrutora de yoga...",
        "Busco sempre equilibrar corpo e mente através de práticas mindfulness..."
      ),
      criarEtapaTexto("Você já praticou yoga ou meditação alguma vez?"),
      criarEtapaTexto("Conheço um espaço holístico maravilhoso"),
      criarEtapaTexto("Eles têm aulas para iniciantes e um café orgânico"),
      criarEtapaTexto("Que tal uma aula experimental comigo?"),
      criarEtapaTexto("Depois podemos tomar um chá e conversar"),
      criarEtapaTexto("É uma forma diferente de se conhecer"),
      criarEtapaTexto("Seria uma experiência única!"),
      criarEtapaTexto("Me diz se você topa essa experiência zen! 🍵")
    ]
  },

  // Renata (ID 11) - Empresária e Eventos
  "11": {
    etapas: [
      criarEtapaTexto("Oi! Match social! Adorei seu perfil 🎉"),
      criarEtapaAudio(
        "Oi! Sou Renata, empresária do ramo de eventos corporativos...",
        "Adoro networking e conhecer pessoas interessantes..."
      ),
      criarEtapaTexto("Você costuma ir a eventos de networking?"),
      criarEtapaTexto("Tem um evento super interessante essa semana"),
      criarEtapaTexto("É um coquetel com empresários e profissionais"),
      criarEtapaTexto("Seria ótimo te ter como meu +1"),
      criarEtapaTexto("O networking é incrível e a comida é maravilhosa"),
      criarEtapaTexto("Depois podemos continuar conversando em um lugar mais tranquilo"),
      criarEtapaTexto("Que tal essa proposta diferente?"),
      criarEtapaTexto("Me avisa se você topa e te passo mais detalhes! 🥂")
    ]
  },

  // Mariana (ID 12) - Nutricionista e Culinária
  "12": {
    etapas: [
      criarEtapaTexto("Oi! Match saudável! Que bom te conhecer 🥗"),
      criarEtapaAudio(
        "Oi! Sou Mariana, nutricionista e apaixonada por gastronomia saudável...",
        "Adoro criar receitas nutritivas e deliciosas..."
      ),
      criarEtapaTexto("Você se interessa por alimentação saudável?"),
      criarEtapaTexto("Conheço um restaurante farm-to-table incrível"),
      criarEtapaTexto("Eles usam ingredientes orgânicos e locais"),
      criarEtapaTexto("Que tal experimentarmos juntos?"),
      criarEtapaTexto("Posso te dar várias dicas nutricionais durante o jantar"),
      criarEtapaTexto("O ambiente é super aconchegante"),
      criarEtapaTexto("Seria um encontro delicioso e saudável!"),
      criarEtapaTexto("Me diz se você topa essa experiência gastronômica! 🥑")
    ]
  },

  // Vanessa (ID 13) - Designer e Moda
  "13": {
    etapas: [
      criarEtapaTexto("Oi! Match fashion! Adorei seu estilo 👗"),
      criarEtapaAudio(
        "Oi! Sou Vanessa, designer de moda e apaixonada por arte...",
        "Trabalho com moda sustentável e design de acessórios..."
      ),
      criarEtapaTexto("Você se interessa por moda e design?"),
      criarEtapaTexto("Tem uma exposição de moda sustentável incrível"),
      criarEtapaTexto("São peças únicas de designers independentes"),
      criarEtapaTexto("Poderia te mostrar e explicar sobre as tendências"),
      criarEtapaTexto("Depois tem um café conceitual próximo"),
      criarEtapaTexto("O ambiente é super instagramável"),
      criarEtapaTexto("Seria um encontro cheio de estilo!"),
      criarEtapaTexto("Me diz se você topa esse programa fashion! ✨")
    ]
  }
};

// Função para obter a próxima etapa de uma conversa
export const obterProximaEtapa = (perfilId, etapaAtual) => {
  const perfil = fluxosConversa[perfilId];
  if (!perfil || etapaAtual >= perfil.etapas.length) return null;
  return perfil.etapas[etapaAtual];
};

// Função para verificar se uma mensagem é de áudio
export const isAudioMessage = (mensagem) => mensagem.tipo === "audio";

// Função para obter o estado inicial de uma conversa
export const getEstadoInicialConversa = (perfilId) => ({
  etapaAtual: 0,
  mensagens: [],
  perfilId,
  ultimaAtualizacao: Date.now()
});

// Funções de localStorage
export const salvarConversaLocal = (userId, matchId, conversa) => {
  try {
    const key = `chat_${userId}_${matchId}`;
    localStorage.setItem(key, JSON.stringify(conversa));
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
  }
};

export const obterConversaLocal = (userId, matchId) => {
  try {
    const key = `chat_${userId}_${matchId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao recuperar conversa:', error);
    return null;
  }
};

export const obterTodasConversasLocal = (userId) => {
  try {
    const conversas = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`chat_${userId}_`)) {
        const matchId = key.split('_')[2];
        conversas[matchId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return conversas;
  } catch (error) {
    console.error('Erro ao recuperar conversas:', error);
    return {};
  }
};

export default {
  fluxosConversa,
  obterProximaEtapa,
  isAudioMessage,
  getEstadoInicialConversa,
  salvarConversaLocal,
  obterConversaLocal,
  obterTodasConversasLocal
}; 