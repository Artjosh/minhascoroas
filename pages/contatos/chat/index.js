import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUtmParams } from '../../../components/UtmManager';
import { isUserLoggedIn, getUserData } from '../../../lib/auth';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { getConversa, salvarConversa, isOnline } from '../../../lib/chat-utils';
import { 
  obterConversaLocal, 
  salvarConversaLocal, 
  obterProximaEtapa,
  getEstadoInicialConversa
} from '../../../data/conversas';
import mockData, { perfis } from '../../../data/mock';
import AudioMessage from '../../../components/AudioMessage';

export default function Chat() {
  const router = useRouter();
  const { redirectWithUtm } = useUtmParams();
  const { id } = router.query;
  const [mensagens, setMensagens] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const [perfilMatch, setPerfilMatch] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  
  // Função para garantir que as mensagens estejam em um formato consistente
  const sanitizarMensagens = (mensagens) => {
    if (!Array.isArray(mensagens)) {
      console.log('[sanitizarMensagens] Não é um array, retornando array vazio');
      return [];
    }
    
    return mensagens.map(msg => {
      if (!msg) return null;
      
      // Garantir tipo correto
      const tipoValido = msg.tipo === 'texto' || msg.tipo === 'audio' ? msg.tipo : 'texto';
      
      // Objeto base com campos obrigatórios
      const mensagemSanitizada = {
        id: msg.id || Date.now() + Math.floor(Math.random() * 1000),
        tipo: tipoValido,
        texto: msg.texto || (tipoValido === 'audio' ? "Mensagem de áudio" : "..."),
        enviada: typeof msg.enviada === 'boolean' ? msg.enviada : false,
        hora: msg.hora || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      // Adicionar campo duracao apenas para áudio
      if (tipoValido === 'audio') {
        mensagemSanitizada.duracao = msg.duracao || "0:30";
      }
      
      return mensagemSanitizada;
    }).filter(Boolean); // Remover mensagens nulas
  };
  
  // Função auxiliar para verificar se uma mensagem é do tipo áudio com segurança
  const verificarAudio = (mensagem) => {
    if (!mensagem) return false;
    const tipoAudio = mensagem.tipo === 'audio';
    console.log('[verificarAudio] Mensagem:', mensagem.id, 'Tipo:', mensagem.tipo, 'É áudio:', tipoAudio);
    return tipoAudio;
  };
  
  // Carregar dados da conversa quando o ID estiver disponível
  useEffect(() => {
    if (!isUserLoggedIn()) {
      redirectWithUtm('/login');
      return;
    }
    
    console.log('[useEffect] Iniciando carregamento do chat, ID:', id);
    
    const userInfo = getUserData();
    setUserId(userInfo.id);
    console.log('[useEffect] Dados do usuário:', userInfo);
    
    if (!id) return;
    
    // Buscar o perfil do match pelo ID (garantir que seja tratado como string)
    const idString = String(id);
    console.log('[useEffect] ID convertido para string:', idString);
    
    const matchPerfil = perfis.find(p => String(p.id) === idString);
    console.log('[useEffect] Perfil encontrado:', matchPerfil);
    
    if (matchPerfil) {
      // Processar nome correto (remover idade se presente)
      const nomePerfil = matchPerfil.nome.split(',')[0];
      
      setPerfilMatch({
        ...matchPerfil,
        nome: nomePerfil // Garantir que o nome está sem a idade
      });
      
      setUsuario({
        id: matchPerfil.id,
        nome: nomePerfil,
        foto: matchPerfil.foto || matchPerfil.imagem,
        online: isOnline(matchPerfil.id)
      });
      
      // Verificar se existe uma conversa salva
      if (userInfo.id) {
        const conversaSalva = obterConversaLocal(userInfo.id, matchPerfil.id);
        console.log('Conversa salva:', conversaSalva);
        
        if (conversaSalva && conversaSalva.mensagens && conversaSalva.mensagens.length > 0) {
          // Sanitizar todas as mensagens para garantir consistência
          const mensagensSanitizadas = sanitizarMensagens(conversaSalva.mensagens);
          console.log('Mensagens sanitizadas:', mensagensSanitizadas);
          
          // Usar conversa salva
          setMensagens(mensagensSanitizadas);
          setEtapaAtual(conversaSalva.etapaAtual || 0);
          
          // Atualizar a conversa salva com as mensagens sanitizadas
          const conversaCorrigida = {
            ...conversaSalva,
            mensagens: mensagensSanitizadas
          };
          
          salvarConversaLocal(userInfo.id, matchPerfil.id, conversaCorrigida);
          console.log('Conversa sanitizada salva no localStorage');
          
          setLoading(false);
          return;
        }
        
        // Se não existir conversa salva, inicializar uma nova
        console.log('Iniciando nova conversa');
        const estadoInicial = getEstadoInicialConversa(matchPerfil.id);
        
        // Garantir que o perfilId está armazenado corretamente
        estadoInicial.perfilId = String(matchPerfil.id);
        console.log('PerfilId armazenado:', estadoInicial.perfilId);
        
        // Adicionar primeira mensagem de saudação
        const primeiraEtapa = obterProximaEtapa(matchPerfil.id, 1);
        console.log('Primeira etapa obtida:', primeiraEtapa);
        
        if (primeiraEtapa && primeiraEtapa.mensagens && primeiraEtapa.mensagens.length > 0) {
          // Filtrar mensagens sem texto
          const mensagensFiltradas = primeiraEtapa.mensagens.filter(msg => 
            msg && (msg.texto || msg.tipo === 'audio')
          );
          
          if (mensagensFiltradas.length > 0) {
            console.log('Mensagens filtradas para primeira etapa:', mensagensFiltradas);
            estadoInicial.mensagens = mensagensFiltradas;
            estadoInicial.etapaAtual = 1;
            setEtapaAtual(1);
            setMensagens(mensagensFiltradas);
            
            // Adicionar informações de perfil
            estadoInicial.nome = nomePerfil;
            estadoInicial.foto = matchPerfil.foto || matchPerfil.imagem;
            
            // Salvar no localStorage
            salvarConversaLocal(userInfo.id, matchPerfil.id, estadoInicial);
            console.log('Estado inicial salvo no localStorage:', estadoInicial);
          } else {
            // Se todas as mensagens foram filtradas (sem texto), criar uma mensagem padrão
            console.log('Não há mensagens válidas, criando mensagem padrão');
            const mensagemPadrao = {
              id: Date.now(),
              tipo: 'texto',
              texto: "Olá! Que bom te conhecer. Como está seu dia?",
              enviada: false,
              hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            estadoInicial.mensagens = [mensagemPadrao];
            estadoInicial.etapaAtual = 1;
            setEtapaAtual(1);
            setMensagens([mensagemPadrao]);
            
            // Adicionar informações de perfil
            estadoInicial.nome = nomePerfil;
            estadoInicial.foto = matchPerfil.foto || matchPerfil.imagem;
            
            // Salvar no localStorage
            salvarConversaLocal(userInfo.id, matchPerfil.id, estadoInicial);
            console.log('Estado inicial com mensagem padrão salvo:', estadoInicial);
          }
        } else {
          // Se não houver primeira etapa definida, criar uma mensagem padrão
          console.log('Não há primeira etapa definida, criando mensagem padrão');
          const mensagemPadrao = {
            id: Date.now(),
            tipo: 'texto',
            texto: "Oi! Adorei seu perfil. Vamos conversar?",
            enviada: false,
            hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          
          estadoInicial.mensagens = [mensagemPadrao];
          estadoInicial.etapaAtual = 1;
          setEtapaAtual(1);
          setMensagens([mensagemPadrao]);
          
          // Adicionar informações de perfil
          estadoInicial.nome = nomePerfil;
          estadoInicial.foto = matchPerfil.foto || matchPerfil.imagem;
          
          // Salvar no localStorage
          salvarConversaLocal(userInfo.id, matchPerfil.id, estadoInicial);
          console.log('Estado inicial com mensagem padrão salvo:', estadoInicial);
        }
      }
      
      setLoading(false);
    } else {
      // Se não encontrar o perfil, tentar carregar de um contato existente
      console.log('Perfil não encontrado, verificando contato existente');
      const conversaExistente = obterConversaLocal(userInfo.id, id);
      console.log('Conversa existente:', conversaExistente);
      
      if (conversaExistente) {
        // Verificar e corrigir mensagens com texto nulo
        if (conversaExistente.mensagens) {
          // Use o sanitizador para garantir consistência
          const mensagensSanitizadas = sanitizarMensagens(conversaExistente.mensagens);
          console.log('Mensagens sanitizadas para conversa existente:', mensagensSanitizadas);
          setMensagens(mensagensSanitizadas);
          
          // Atualizar a conversa com as mensagens sanitizadas
          const conversaCorrigida = {
            ...conversaExistente,
            mensagens: mensagensSanitizadas,
            perfilId: conversaExistente.perfilId || id, // Garantir que o perfilId está definido
            etapaAtual: conversaExistente.etapaAtual || 1 // Garantir etapa mínima 1
          };
          
          salvarConversaLocal(userInfo.id, id, conversaCorrigida);
          console.log('Conversa existente sanitizada salva no localStorage');
        } else {
          setMensagens([]);
        }
        
        setEtapaAtual(conversaExistente.etapaAtual || 1); // Nunca deixar voltar para 0
        
        // Garantir que o perfilMatch tenha todas as informações necessárias
        setPerfilMatch({
          id: id,
          nome: conversaExistente.nome || "Contato",
          foto: conversaExistente.foto || "/images/avatar.jpg",
          perfilId: conversaExistente.perfilId || id // Garantir que o perfilId está definido
        });
        
      setUsuario({
          id: id,
          nome: conversaExistente.nome || "Contato",
          foto: conversaExistente.foto || "/images/avatar.jpg",
        online: isOnline(id)
      });
        
      setLoading(false);
      } else {
        // Se tudo falhar, redirecionar para a lista de contatos
        console.log('Nenhuma conversa encontrada, redirecionando para contatos');
        router.push('/contatos');
      }
    }
  }, [id, router, redirectWithUtm]);
  
  // Focar no input quando o chat carregar
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);
  
  // Rolar para o final do chat quando novas mensagens forem adicionadas
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);
  

  
  // Função para enviar uma nova mensagem
  const enviarMensagem = async (texto) => {
    console.log('[enviarMensagem] Iniciando envio de mensagem. Texto:', texto);
    console.log('[enviarMensagem] Estado atual - UserId:', userId, 'PerfilMatch:', perfilMatch, 'Etapa atual:', etapaAtual);
    
    if (!texto || texto.trim() === '' || !userId || !perfilMatch) {
      console.log('[enviarMensagem] Cancelando envio - dados inválidos');
      return;
    }
    
    setNovaMensagem('');

    console.log('[enviarMensagem] Criando objeto de mensagem');
    const novaMensagem = {
      id: Date.now(),
      tipo: 'texto',
      texto,
      enviada: true,
      hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    console.log('[enviarMensagem] Mensagem criada:', novaMensagem);

    const novasMensagens = [...mensagens, novaMensagem];
    console.log('[enviarMensagem] Lista de mensagens atualizada:', novasMensagens);
    
    // Sanitizar mensagens para garantir consistência
    const mensagensSanitizadas = sanitizarMensagens(novasMensagens);
    console.log('[enviarMensagem] Mensagens sanitizadas:', mensagensSanitizadas);
    
    setMensagens(mensagensSanitizadas);

    // Garantir que o ID do perfil é armazenado corretamente
    const perfilIdString = perfilMatch && perfilMatch.id ? String(perfilMatch.id) : id;
    console.log('[enviarMensagem] ID do perfil convertido para string:', perfilIdString);

    // Garantir que etapaAtual seja pelo menos 1 (nunca 0)
    const etapaAtualCorrigida = etapaAtual < 1 ? 1 : etapaAtual;
    
    // Salvar conversa atualizada com informações completas
    const conversaAtualizada = {
      mensagens: mensagensSanitizadas,
      etapaAtual: etapaAtualCorrigida, // Usar etapa corrigida
      perfilId: perfilIdString, // Garantir que é string
      ultimaAtualizacao: Date.now(),
      nome: perfilMatch.nome.split(',')[0], // Garantir que o nome está salvo
      foto: perfilMatch.foto // Garantir que a foto está salva
    };
    
    console.log('[enviarMensagem] Salvando conversa atualizada:', conversaAtualizada);
    salvarConversaLocal(userId, perfilIdString, conversaAtualizada);

    console.log('[enviarMensagem] Buscando próxima etapa do fluxo. ID:', perfilIdString, 'Etapa atual:', etapaAtualCorrigida);
    
    // Verificar se temos um ID válido para obter a próxima etapa
    if (!perfilIdString) {
      console.log('[enviarMensagem] ID de perfil inválido, usando resposta fallback');
      
      setTimeout(() => {
        const mensagemFallback = {
          id: Date.now() + 100,
          tipo: 'texto',
          texto: "Estou adorando nossa conversa! Continue me contando mais sobre você.",
          enviada: false,
          hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        const mensagensAtualizadas = [...mensagensSanitizadas, mensagemFallback];
        const mensagensFinalSanitizadas = sanitizarMensagens(mensagensAtualizadas);
        
        // Incrementar etapa
        const novaEtapa = etapaAtualCorrigida + 1;
        setEtapaAtual(novaEtapa);
        
        const conversaComFallback = {
          mensagens: mensagensFinalSanitizadas,
          etapaAtual: novaEtapa, // Usar etapa incrementada
          perfilId: perfilIdString || id,
          ultimaAtualizacao: Date.now(),
          nome: perfilMatch.nome.split(',')[0],
          foto: perfilMatch.foto
        };
        
        setMensagens(mensagensFinalSanitizadas);
        salvarConversaLocal(userId, perfilIdString || id, conversaComFallback);
      }, 1000);
      
      return;
    }

    // Processar próxima etapa do fluxo
    const proximaEtapa = obterProximaEtapa(perfilIdString, etapaAtualCorrigida);
    console.log('[enviarMensagem] Próxima etapa obtida:', proximaEtapa);
    
    // Verificar se a próxima etapa existe e tem mensagens válidas
    if (!proximaEtapa || !proximaEtapa.mensagens) {
      
      // Criar uma resposta fallback
      setTimeout(() => {
        
        const mensagemFallback = {
          id: Date.now() + 100,
          tipo: 'texto',
          texto: "Estou adorando nossa conversa! Continue me contando mais sobre você.",
          enviada: false,
          hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        const mensagensAtualizadas = [...mensagensSanitizadas, mensagemFallback];
        
        // Sanitizar a lista final
        const mensagensFinalSanitizadas = sanitizarMensagens(mensagensAtualizadas);
        
        // Incrementar etapa
        const novaEtapa = etapaAtualCorrigida + 1;
        setEtapaAtual(novaEtapa);
        
        // Salvar conversa atualizada
        const conversaComFallback = {
          mensagens: mensagensFinalSanitizadas,
          etapaAtual: novaEtapa, // Usar etapa incrementada
          perfilId: perfilIdString,
          ultimaAtualizacao: Date.now(),
          nome: perfilMatch.nome.split(',')[0],
          foto: perfilMatch.foto
        };
        
        setMensagens(mensagensFinalSanitizadas);
        salvarConversaLocal(userId, perfilIdString, conversaComFallback);
      }, 1000);
      
      return;
    }
    
    // Verificar se estamos na etapa 1 e se a próxima (etapa 2) contém áudios
    const verificarEtapaAudio = etapaAtualCorrigida === 1 || 
      (proximaEtapa && proximaEtapa.mensagens && 
       proximaEtapa.mensagens.some(msg => verificarAudio(msg)));

    // Verificar se alguma mensagem é nula ou tem texto nulo
    const temMensagemInvalida = proximaEtapa.mensagens.some(msg => !msg || !msg.texto);
    if (temMensagemInvalida) {
      
    }

    setTimeout(() => {
      
      // Verificar e corrigir mensagens vazias
      let mensagensEtapa = [];
      
      if (proximaEtapa.mensagens && proximaEtapa.mensagens.length > 0) {
        
        mensagensEtapa = proximaEtapa.mensagens.map(msg => {
          // Se a mensagem não tiver texto ou for nula
          if (!msg || !msg.texto) {
            
            // Verificar se msg existe, se não criar um novo objeto
            const msgCorrigida = msg || {};
            const mensagemCorrigida = {
              ...msgCorrigida,
              id: msgCorrigida.id || Date.now() + Math.floor(Math.random() * 1000),
              tipo: msgCorrigida.tipo || (verificarEtapaAudio ? 'audio' : 'texto'),
              texto: "Estou gostando de conversar com você! Continue me contando sobre você.",
              enviada: false,
              hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            // Se for áudio, adicionar duração
            if (verificarEtapaAudio) {
              mensagemCorrigida.duracao = "0:30";
            }
            
            return mensagemCorrigida;
          }
          
          return {
            ...msg,
            id: msg.id || Date.now() + Math.floor(Math.random() * 1000),
            hora: msg.hora || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            enviada: false
          };
        });
      } else {
        // Se não houver mensagens na próxima etapa, criar uma mensagem padrão
        
        mensagensEtapa = [{
          id: Date.now() + Math.floor(Math.random() * 1000),
          tipo: verificarEtapaAudio ? 'audio' : 'texto',
          texto: "Isso é muito interessante! O que mais você gosta de fazer?",
          enviada: false,
          hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }];
        
        // Se for áudio, adicionar duração
        if (verificarEtapaAudio) {
          mensagensEtapa[0].duracao = "0:30";
        }
      }
      
      console.log('[enviarMensagem] Mensagens da etapa processadas:', mensagensEtapa);
      
      // Se chegamos até aqui, temos mensagens válidas para mostrar
      const mensagensAtualizadas = [...mensagensSanitizadas, ...mensagensEtapa];
      console.log('[enviarMensagem] Mensagens atualizadas final:', mensagensAtualizadas);
      
      // Sanitizar a lista final
      const mensagensFinalSanitizadas = sanitizarMensagens(mensagensAtualizadas);
      console.log('[enviarMensagem] Mensagens finais sanitizadas:', mensagensFinalSanitizadas);
      
      // Incrementar etapa
      const novaEtapa = etapaAtualCorrigida + 1;
      setEtapaAtual(novaEtapa);
      
      // Atualizar localStorage com a conversa completa
      const conversaAtualizada = {
        mensagens: mensagensFinalSanitizadas,
        etapaAtual: novaEtapa, // Usar etapa incrementada
        perfilId: perfilIdString,
        ultimaAtualizacao: Date.now(),
        nome: perfilMatch.nome.split(',')[0],
        foto: perfilMatch.foto
      };
      
      console.log('[enviarMensagem] Salvando conversa final:', conversaAtualizada);
      setMensagens(mensagensFinalSanitizadas);
      salvarConversaLocal(userId, perfilIdString, conversaAtualizada);
      }, 1000);
  };
  
  // Função para enviar uma mensagem de áudio de teste
  const enviarAudioTeste = () => {
    console.log('[enviarAudioTeste] Iniciando envio de áudio de teste');
    console.log('[enviarAudioTeste] Estado atual - UserId:', userId, 'PerfilMatch:', perfilMatch);
    
    if (!userId || !perfilMatch) {
      console.log('[enviarAudioTeste] Cancelando envio - dados inválidos');
      return;
    }
    
    // Garantir que o ID do perfil é armazenado corretamente
    const perfilIdString = perfilMatch && perfilMatch.id ? String(perfilMatch.id) : id;
    console.log('[enviarAudioTeste] ID do perfil convertido para string:', perfilIdString);
    
    console.log('[enviarAudioTeste] Criando objeto de mensagem de áudio');
    
    // Criar mensagem de áudio com todas as propriedades necessárias
    const mensagemAudio = {
      id: Date.now(),
      tipo: 'audio',
      texto: "Isso é uma mensagem de áudio de teste",
      duracao: "0:15",
      enviada: false,
      hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    console.log('[enviarAudioTeste] Mensagem de áudio criada:', mensagemAudio);
    console.log('[enviarAudioTeste] Verificando tipo de mensagem:', mensagemAudio.tipo === 'audio');
    
    // Adicionar a mensagem de áudio às mensagens existentes
    const novasMensagens = [...mensagens, mensagemAudio];
    console.log('[enviarAudioTeste] Lista de mensagens atualizada:', novasMensagens);
    
    // Sanitizar mensagens para garantir consistência
    const mensagensSanitizadas = sanitizarMensagens(novasMensagens);
    console.log('[enviarAudioTeste] Mensagens sanitizadas:', mensagensSanitizadas);
    
    // Debugar a primeira mensagem de áudio
    const mensagemAudioNoArray = mensagensSanitizadas.find(m => m.tipo === 'audio');
    console.log('[enviarAudioTeste] Verificação da mensagem de áudio no array:', verificarAudio(mensagemAudioNoArray));
    
    // Atualizar o estado de mensagens
    setMensagens(mensagensSanitizadas);
    
    // Salvar conversa atualizada com informações completas
    const conversaAtualizada = {
      mensagens: mensagensSanitizadas,
      etapaAtual,
      perfilId: perfilIdString, // Garantir que é string e armazenar
      ultimaAtualizacao: Date.now(),
      nome: perfilMatch.nome.split(',')[0], // Garantir que o nome está salvo
      foto: perfilMatch.foto // Garantir que a foto está salva
    };
    
    console.log('[enviarAudioTeste] Salvando conversa atualizada:', conversaAtualizada);
    salvarConversaLocal(userId, perfilIdString, conversaAtualizada);
    
    // Adicionar uma resposta automática após o áudio
    setTimeout(() => {
      console.log('[enviarAudioTeste] Adicionando resposta automática ao áudio');
      const respostaAoAudio = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        tipo: 'texto',
        texto: "Espero que você tenha gostado do meu áudio! O que achou?",
        enviada: false,
        hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      console.log('[enviarAudioTeste] Resposta ao áudio criada:', respostaAoAudio);
      
      const mensagensComResposta = [...mensagensSanitizadas, respostaAoAudio];
      console.log('[enviarAudioTeste] Lista de mensagens com resposta:', mensagensComResposta);
      
      // Sanitizar mensagens finais
      const mensagensFinalSanitizadas = sanitizarMensagens(mensagensComResposta);
      console.log('[enviarAudioTeste] Mensagens finais sanitizadas:', mensagensFinalSanitizadas);
      
      setMensagens(mensagensFinalSanitizadas);
      
      // Atualizar localStorage com a conversa completa
      const conversaComResposta = {
        mensagens: mensagensFinalSanitizadas,
        etapaAtual,
        perfilId: perfilIdString, // Garantir que é string e armazenar
        ultimaAtualizacao: Date.now(),
        nome: perfilMatch.nome.split(',')[0],
        foto: perfilMatch.foto
      };
      
      console.log('[enviarAudioTeste] Salvando conversa com resposta ao áudio:', conversaComResposta);
      salvarConversaLocal(userId, perfilIdString, conversaComResposta);
    }, 2000);
  };
  
  // Voltar para a lista de contatos
  const voltarParaContatos = () => {
    router.push('/contatos');
  };

  // Se não tiver usuário ainda, mostrar carregando
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000',
      backgroundImage: `url('/images/fundoConversa.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative'
    }}>
      <Head>
        <title>Chat com {usuario.nome} - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Cabeçalho do chat */}
      <div style={{
        background: 'linear-gradient(45deg, #8319C1, #b941ff, #8319C1)',
        color: 'white',
        padding: '12px 15px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div 
          onClick={voltarParaContatos}
          style={{ marginRight: '15px', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1
        }}>
          <div style={{ position: 'relative', marginRight: '10px' }}>
            <img 
              src={usuario.foto} 
              alt={usuario.nome} 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            {usuario.online && (
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                border: '2px solid #8319C1'
              }} />
            )}
          </div>
          
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 'bold' 
            }}>
              {usuario.nome}
            </h2>
            <span style={{ 
              fontSize: '12px', 
              color: 'green',
              opacity: 0 
            }}>
              {usuario.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div>
          <img src="/images/tresPontos.png" alt="Menu" width="20px" height="20px" />
        </div>
      </div>
      
      {/* Overlay roxo/lilás escuro sobre o fundo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(34, 0, 85, 0.95)',
        zIndex: 0
      }}></div>
      
      {/* Área de mensagens */}
      <div 
        ref={chatRef}
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 130px)',
          paddingBottom: '80px' // Espaço para o input
        }}
      >
        {/* Console log para depuração das mensagens de áudio */}
        {console.log('[render chat] Total de mensagens:', mensagens.length, 'Mensagens de áudio:', mensagens.filter(m => m.tipo === 'audio').length)}
        
        {mensagens.map(mensagem => {
          console.log('[render] Mensagem:', mensagem);
          const isAudio = verificarAudio(mensagem);
          console.log('[render] É áudio?', isAudio);
          
          return (
          <div 
            key={mensagem.id} 
            style={{
              display: 'flex',
                justifyContent: mensagem.enviada ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
            }}
          >
              {isAudio ? (
                <AudioMessage mensagem={mensagem} enviada={mensagem.enviada} />
              ) : (
            <div style={{
                  backgroundColor: mensagem.enviada ? '#DCF8C6' : 'white',
              borderRadius: '10px',
              padding: '8px 12px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                lineHeight: 1.4
              }}>
                    {mensagem.texto || "..."}
              </p>
              <span style={{ 
                fontSize: '10px', 
                color: '#999',
                display: 'block',
                textAlign: 'right',
                marginTop: '2px'
              }}>
                    {mensagem.hora || "Agora"}
              </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Área de digitação - novo estilo conforme solicitado */}
      <div 
        id="input-container2" 
        className="input-container2"
        style={{
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          gap: '10px',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '15px',
          padding: '10px',
          borderRadius: '42px',
          transition: 'all 0.3s ease',
          zIndex: 99999,
          backgroundColor: 'rgb(34, 34, 34)'
        }}
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensagem(novaMensagem);
          }}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            id="user-input2"
            className="user-input2"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            style={{
              background: 'none',
              color: 'white',
              fontSize: '16px',
              boxShadow: 'none',
              border: 'none',
              outline: 'none',
              flex: 1,
              padding: '10px 15px'
            }}
          />
          {/* Botão de teste para áudio */}
          <button
            type="button"
            onClick={enviarAudioTeste}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(to bottom, #801AB8, #C922FC, #801AB8)',
              padding: '10px',
              borderRadius: '100%',
              border: 'none',
              marginLeft: '-20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
