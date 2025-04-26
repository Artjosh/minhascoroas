"use client"

import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useUtmParams } from "../../../components/UtmManager"
import { isUserLoggedIn, getUserData } from "../../../lib/auth"
import LoadingSpinner from "../../../components/LoadingSpinner"
import {
  getConversa,
  salvarConversa,
  isOnline,
  inicializarConversa,
  enviarMensagem as enviarMensagemChat,
} from "../../../lib/chat-utils"
import { mulheres } from "../../../data/mock/index"
import AudioMessage from "../../../components/AudioMessage"

export default function Chat() {
  const router = useRouter()
  const { redirectWithUtm } = useUtmParams()
  const { id } = router.query
  const [mensagens, setMensagens] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [novaMensagem, setNovaMensagem] = useState("")
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const [perfilMatch, setPerfilMatch] = useState(null)
  const [etapaAtual, setEtapaAtual] = useState(0)

  // Função para garantir que as mensagens estejam em um formato consistente
  const sanitizarMensagens = (mensagens) => {
    if (!Array.isArray(mensagens)) {
      console.log("[sanitizarMensagens] Não é um array, retornando array vazio")
      return []
    }

    return mensagens
      .map((msg) => {
        if (!msg) return null

        // Garantir tipo correto
        const tipoValido = msg.tipo === "texto" || msg.tipo === "audio" ? msg.tipo : "texto"

        // Objeto base com campos obrigatórios
        const mensagemSanitizada = {
          id: msg.id || Date.now() + Math.floor(Math.random() * 1000),
          tipo: tipoValido,
          texto: msg.texto || (tipoValido === "audio" ? "Mensagem de áudio" : "..."),
          enviada: typeof msg.enviada === "boolean" ? msg.enviada : false,
          hora: msg.hora || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        // Adicionar campo duracao apenas para áudio
        if (tipoValido === "audio") {
          mensagemSanitizada.duracao = msg.duracao || "0:30"
        }

        return mensagemSanitizada
      })
      .filter(Boolean) // Remover mensagens nulas
  }

  // Função auxiliar para verificar se uma mensagem é do tipo áudio com segurança
  const verificarAudio = (mensagem) => {
    if (!mensagem) return false
    const tipoAudio = mensagem.tipo === "audio"
    console.log("[verificarAudio] Mensagem:", mensagem.id, "Tipo:", mensagem.tipo, "É áudio:", tipoAudio)
    return tipoAudio
  }

  // Carregar dados da conversa quando o ID estiver disponível
  useEffect(() => {
    if (!isUserLoggedIn()) {
      redirectWithUtm("/login")
      return
    }

    console.log("[useEffect] Iniciando carregamento do chat, ID:", id)

    if (!id) return

    const userInfo = getUserData()
    setUserId(userInfo.id)
    console.log("[useEffect] Dados do usuário:", userInfo)

    // Buscar o perfil do match pelo ID (garantir que seja tratado como string)
    const idString = String(id)
    console.log("[useEffect] ID convertido para string:", idString)

    const matchPerfil = mulheres.find((p) => String(p.id) === idString)
    console.log("[useEffect] Perfil encontrado:", matchPerfil)

    if (matchPerfil) {
      // Processar nome correto (remover idade se presente)
      const nomePerfil = matchPerfil.nome.split(",")[0]

      setPerfilMatch({
        ...matchPerfil,
        nome: nomePerfil, // Garantir que o nome está sem a idade
      })

      setUsuario({
        id: matchPerfil.id,
        nome: nomePerfil,
        foto: matchPerfil.foto || matchPerfil.imagem,
        online: isOnline(matchPerfil.id),
      })

      // Verificar se existe uma conversa salva
      if (userInfo.id) {
        const conversaSalva = getConversa(userInfo.id, matchPerfil.id)
        console.log("Conversa salva:", conversaSalva)

        if (conversaSalva && conversaSalva.mensagens && conversaSalva.mensagens.length > 0) {
          // Sanitizar todas as mensagens para garantir consistência
          const mensagensSanitizadas = sanitizarMensagens(conversaSalva.mensagens)
          console.log("Mensagens sanitizadas:", mensagensSanitizadas)

          // Usar conversa salva
          setMensagens(mensagensSanitizadas)
          setEtapaAtual(conversaSalva.etapaAtual || 0)

          // Atualizar a conversa salva com as mensagens sanitizadas
          const conversaCorrigida = {
            ...conversaSalva,
            mensagens: mensagensSanitizadas,
          }

          salvarConversa(userInfo.id, matchPerfil.id, conversaCorrigida)
          console.log("Conversa sanitizada salva no localStorage")

          setLoading(false)
          return
        }

        // Se não existir conversa salva, inicializar uma nova
        console.log("Iniciando nova conversa")
        const estadoInicial = inicializarConversa(matchPerfil)

        // Garantir que o perfilId está armazenado corretamente
        estadoInicial.perfilId = String(matchPerfil.id)
        console.log("PerfilId armazenado:", estadoInicial.perfilId)

        setMensagens(estadoInicial.mensagens || [])
        setEtapaAtual(estadoInicial.etapaAtual || 0)

        // Salvar no localStorage
        salvarConversa(userInfo.id, matchPerfil.id, estadoInicial)
        console.log("Estado inicial salvo no localStorage:", estadoInicial)
      }

      setLoading(false)
    } else {
      // Se não encontrar o perfil, tentar carregar de um contato existente
      console.log("Perfil não encontrado, verificando contato existente")
      const conversaExistente = getConversa(userInfo.id, id)
      console.log("Conversa existente:", conversaExistente)

      if (conversaExistente) {
        // Verificar e corrigir mensagens com texto nulo
        if (conversaExistente.mensagens) {
          // Use o sanitizador para garantir consistência
          const mensagensSanitizadas = sanitizarMensagens(conversaExistente.mensagens)
          console.log("Mensagens sanitizadas para conversa existente:", mensagensSanitizadas)
          setMensagens(mensagensSanitizadas)

          // Atualizar a conversa com as mensagens sanitizadas
          const conversaCorrigida = {
            ...conversaExistente,
            mensagens: mensagensSanitizadas,
            perfilId: conversaExistente.perfilId || id, // Garantir que o perfilId está definido
            etapaAtual: conversaExistente.etapaAtual || 1, // Garantir etapa mínima 1
          }

          salvarConversa(userInfo.id, id, conversaCorrigida)
          console.log("Conversa existente sanitizada salva no localStorage")
        } else {
          setMensagens([])
        }

        setEtapaAtual(conversaExistente.etapaAtual || 1) // Nunca deixar voltar para 0

        // Garantir que o perfilMatch tenha todas as informações necessárias
        setPerfilMatch({
          id: id,
          nome: conversaExistente.nome || "Contato",
          foto: conversaExistente.foto || "/images/avatar.jpg",
          perfilId: conversaExistente.perfilId || id, // Garantir que o perfilId está definido
        })

        setUsuario({
          id: id,
          nome: conversaExistente.nome || "Contato",
          foto: conversaExistente.foto || "/images/avatar.jpg",
          online: isOnline(id),
        })

        setLoading(false)
      } else {
        // Se tudo falhar, redirecionar para a lista de contatos
        console.log("Nenhuma conversa encontrada, redirecionando para contatos")
        router.push("/contatos")
      }
    }
  }, [id, router, redirectWithUtm])

  // Focar no input quando o chat carregar
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loading])

  // Rolar para o final do chat quando novas mensagens forem adicionadas
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensagens])

  // Função para enviar uma nova mensagem
  const handleEnviarMensagem = (e) => {
    e.preventDefault()

    if (!novaMensagem.trim() || !userId || !id) return

    // Usar a função enviarMensagem do chat-utils.js
    const mensagemEnviada = enviarMensagemChat(userId, id, novaMensagem.trim())

    if (mensagemEnviada) {
      // Limpar o campo de entrada
      setNovaMensagem("")

      // Buscar a conversa atualizada para obter todas as mensagens
      const conversaAtualizada = getConversa(userId, id)
      if (conversaAtualizada && conversaAtualizada.mensagens) {
        setMensagens(sanitizarMensagens(conversaAtualizada.mensagens))
        setEtapaAtual(conversaAtualizada.etapaAtual || 0)
      }

      // Verificar novamente após um delay para obter a primeira resposta automática
      setTimeout(() => {
        const conversaComResposta = getConversa(userId, id)
        if (conversaComResposta && conversaComResposta.mensagens) {
          setMensagens(sanitizarMensagens(conversaComResposta.mensagens))
          setEtapaAtual(conversaComResposta.etapaAtual || 0)
        }
      }, 1500)
      
      // Verificar novamente após um delay maior para obter a segunda resposta (caso seja a etapa inicial)
      setTimeout(() => {
        const conversaFinal = getConversa(userId, id)
        if (conversaFinal && conversaFinal.mensagens) {
          setMensagens(sanitizarMensagens(conversaFinal.mensagens))
          setEtapaAtual(conversaFinal.etapaAtual || 0)
        }
      }, 4000)
    }
  }

  // Voltar para a lista de contatos
  const voltarParaContatos = () => {
    router.push("/contatos")
  }

  // Se não tiver usuário ainda, mostrar carregando
  if (loading) {
    return <LoadingSpinner />
  }

  if (!usuario) {
    return <div>Usuário não encontrado</div>
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        backgroundImage: `url('/images/fundoConversa.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Poppins, sans-serif",
        position: "relative",
      }}
    >
      <Head>
        <title>Chat com {usuario.nome} - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Cabeçalho do chat */}
      <div
        style={{
          background: "linear-gradient(45deg, #8319C1, #b941ff, #8319C1)",
          color: "white",
          padding: "12px 15px",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div onClick={voltarParaContatos} style={{ marginRight: "15px", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          <div style={{ position: "relative", marginRight: "10px" }}>
            <img
              src={usuario.foto || "/placeholder.svg"}
              alt={usuario.nome}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {usuario.nome}
            </h2>
            <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginTop: "2px" 
            }}>
              {usuario.online && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: "#4CAF50",
                  opacity: usuario.online ? 1 : 0,
                }}
              >
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay roxo/lilás escuro sobre o fundo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      ></div>

      {/* Área de mensagens */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          padding: "15px",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 130px)",
          paddingBottom: "80px", // Espaço para o input
        }}
      >
        {/* Console log para depuração das mensagens de áudio */}
        {console.log(
          "[render chat] Total de mensagens:",
          mensagens.length,
          "Mensagens de áudio:",
          mensagens.filter((m) => m.tipo === "audio").length,
        )}

        {mensagens.map((mensagem) => {
          console.log("[render] Mensagem:", mensagem)
          const isAudio = verificarAudio(mensagem)
          console.log("[render] É áudio?", isAudio)

          return (
            <div
              key={mensagem.id}
              style={{
                display: "flex",
                justifyContent: mensagem.enviada ? "flex-end" : "flex-start",
                marginBottom: "15px",
              }}
            >
              {isAudio ? (
                <AudioMessage 
                  mensagem={{
                    ...mensagem,
                    userImage: usuario.foto // Adicionando a foto do usuário à mensagem
                  }} 
                  enviada={mensagem.enviada} 
                />
              ) : (
                <div
                  style={{
                    backgroundColor: mensagem.enviada ? "#103529" : "#262d31",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    maxWidth: "70%",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.4,
                      color: "white",
                    }}
                  >
                    {mensagem.texto || "..."}
                  </p>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#999",
                      display: "block",
                      textAlign: "right",
                      marginTop: "2px",
                    }}
                  >
                    {mensagem.hora || "Agora"}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Área de digitação - novo estilo conforme solicitado */}
      <div
        id="input-container2"
        className="input-container2"
        style={{
          fontFamily: "Arial, sans-serif",
          color: "white",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          gap: "10px",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "15px",
          padding: "10px",
          borderRadius: "42px",
          transition: "all 0.3s ease",
          zIndex: 99999,
          backgroundColor: "rgb(34, 34, 34)",
        }}
      >
        <form
          onSubmit={handleEnviarMensagem}
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
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
              background: "none",
              color: "white",
              fontSize: "16px",
              boxShadow: "none",
              border: "none",
              outline: "none",
              flex: 1,
              padding: "10px 15px",
            }}
          />
          {/* Removido o botão de áudio, pois o usuário não deve enviar áudios */}
          <button
            type="submit"
            style={{
              background: "linear-gradient(to bottom, #801AB8, #C922FC, #801AB8)",
              padding: "10px",
              borderRadius: "100%",
              border: "none",
              marginLeft: "-20px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
