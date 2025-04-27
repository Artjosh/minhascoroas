"use client"

import { useState, useEffect, useCallback } from "react"
import Head from "next/head"
import { useUtmParams } from "../../components/UtmManager"
import LoadingSpinner from "../../components/LoadingSpinner"
import { isUserLoggedIn, getUserData, getAuthHeaders } from "../../lib/auth"
import mockData, { mulheres } from "../../data/mock/index"
import BottomNavigation from "../../components/BottomNavigation"
import {
  getCurrentMatch,
  clearCurrentMatch,
  processMatchIds,
  extractContactInfo,
  getMatchesFromDatabase,
} from "../../lib/match-utils"
import {
  getConversas,
  salvarConversa,
  getConversa,
  inicializarConversa,
  isOnline,
  adicionarNovoMatch,
} from "../../lib/chat-utils"
// Use the chat-utils functions instead of conversas
// Remove this import and use the functions from chat-utils
import { useRouter } from "next/router"

// Tempo entre verificações automáticas em milissegundos (aumentado para reduzir requests)
const POLLING_INTERVAL = 30000 // 30 segundos
// Tempo de expiração do cache em milissegundos (10 minutos)
const CACHE_EXPIRY = 10 * 60 * 1000

// Funções de cache para matches
const saveMatchesToCache = (userId, matches) => {
  try {
    const cacheData = {
      matches,
      timestamp: Date.now(),
    }
    localStorage.setItem(`matches_cache_${userId}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error("Erro ao salvar cache:", error)
  }
}

const getMatchesFromCache = (userId) => {
  try {
    const cacheData = localStorage.getItem(`matches_cache_${userId}`)
    if (!cacheData) return null

    const { matches, timestamp } = JSON.parse(cacheData)
    const agora = Date.now()

    // Verificar se o cache expirou
    if (agora - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`matches_cache_${userId}`)
      return null
    }

    return matches
  } catch (error) {
    console.error("Erro ao recuperar cache:", error)
    return null
  }
}

// Componente de estilos global
function GlobalStyles() {
  return (
    <style jsx global>{`
      body {
        margin: 0;
        padding: 0;
        font-family: 'Poppins', sans-serif;
      }
      * {
        box-sizing: border-box;
      }
    `}</style>
  )
}

export default function Contatos() {
  const { redirectWithUtm } = useUtmParams()
  const [contatoAtivo, setContatoAtivo] = useState(null)
  const [mensagem, setMensagem] = useState("")
  const [contatosLista, setContatosLista] = useState([])
  const [showMobile, setShowMobile] = useState("lista") // 'lista' ou 'chat'
  const [currentMatch, setCurrentMatch] = useState(null)
  const [userId, setUserId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [ultimaVerificacao, setUltimaVerificacao] = useState(0)
  const [semMatches, setSemMatches] = useState(false)
  const router = useRouter()

  // Função para verificar se há um novo match no localStorage
  const verificarNovoMatch = useCallback(async () => {
    try {
      // Recuperar o match atual do localStorage
      const matchedProfile = getCurrentMatch()

      if (matchedProfile) {
        setCurrentMatch(matchedProfile)

        // Extrair apenas primeiro nome
        const nomePrimeiro = matchedProfile.nome.includes(",") ? matchedProfile.nome.split(",")[0] : matchedProfile.nome

        // Inicializar nova conversa
        adicionarNovoMatch(userId, matchedProfile)

        // Verificar se já existe uma conversa com este match
        const conversaExistente = getConversa(userId, matchedProfile.id)

        // Criar um contato a partir do match
        const novoContato = {
          id: matchedProfile.id,
          nome: nomePrimeiro,
          imagem: matchedProfile.foto || matchedProfile.imagem,
          online: isOnline(matchedProfile.id), // Status online consistente
        }

        // Adicionar dados da conversa
        if (conversaExistente) {
          // Usar conversa existente
          novoContato.mensagens = conversaExistente.mensagens
          novoContato.ultimaMensagem = conversaExistente.ultimaMensagem
          novoContato.horaUltimaMensagem = conversaExistente.horaUltimaMensagem
        } else {
          // Inicializar nova conversa
          const novaConversa = inicializarConversa(matchedProfile)
          novoContato.mensagens = novaConversa.mensagens
          novoContato.ultimaMensagem = novaConversa.ultimaMensagem
          novoContato.horaUltimaMensagem = novaConversa.horaUltimaMensagem
        }

        // Adicionar à lista de contatos se não existir
        setContatosLista((contatos) => {
          // Verificar se já existe
          const contatoExistente = contatos.find((c) => c.id === novoContato.id)
          if (contatoExistente) return contatos

          return [novoContato, ...contatos]
        })

        // Ativar automaticamente a conversa com o match
        setContatoAtivo(novoContato)
        setShowMobile("chat")

        // Atualizar idmatches no localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          const userObj = JSON.parse(userData)
          if (userObj.idmatches) {
            // Se já existir, adicionar o novo match se não estiver lá
            if (!userObj.idmatches.includes(matchedProfile.id)) {
              userObj.idmatches.push(matchedProfile.id)
              localStorage.setItem('user', JSON.stringify(userObj))
            }
          } else {
            // Se não existir, criar com o novo match
            userObj.idmatches = [matchedProfile.id]
            localStorage.setItem('user', JSON.stringify(userObj))
          }
        }

        // Remover do localStorage para não mostrar novamente
        clearCurrentMatch()

        return true // Indica que um novo match foi processado
      }

      return false // Nenhum novo match encontrado
    } catch (error) {
      console.error("Erro ao processar novo match:", error)
      return false
    }
  }, [userId])

  // Função principal para verificar matches e atualizar a lista de contatos
  const verificarMatches = useCallback(
    async (userId, forceUpdate = false) => {
      try {
        // Skip se foi verificado recentemente e não é update forçado
        const agora = Date.now()
        const tempoDecorrido = agora - ultimaVerificacao

        if (!forceUpdate && tempoDecorrido < POLLING_INTERVAL && contatosLista.length > 0) {
          return
        }

        // Limitar a frequência de requisições mesmo com forceUpdate
        if (tempoDecorrido < 2000) {
          return // Não permitir mais de uma requisição a cada 2 segundos
        }

        // Definir estado de carregamento
        setCarregando(true)

        // Tentar usar dados em cache primeiro se não for uma atualização forçada
        if (!forceUpdate) {
          const cachedMatches = getMatchesFromCache(userId)
          if (cachedMatches && cachedMatches.length > 0) {
            // Criar objetos de contato a partir dos matchIds em cache
            const perfilMatches = processMatchIds(cachedMatches)

            // Processar contatos como normalmente faria
            const contatosMatches = perfilMatches.map((perfil) => {
              // Info básica do contato
              const infoContato = extractContactInfo(perfil)

              // Definir status online de forma consistente
              infoContato.online = isOnline(perfil.id)

              // Verificar se já existe uma conversa salva para este contato
              const conversaExistente = getConversa(userId, perfil.id)

              if (conversaExistente) {
                // Usar dados da conversa existente
                return {
                  ...infoContato,
                  ultimaMensagem: conversaExistente.ultimaMensagem,
                  horaUltimaMensagem: conversaExistente.horaUltimaMensagem,
                  mensagens: conversaExistente.mensagens,
                }
              }

              // Verificar se já existe na lista atual para preservar mensagens
              const contatoExistente = contatosLista.find((c) => c.id === perfil.id)

              if (contatoExistente) {
                return {
                  ...infoContato,
                  ultimaMensagem: contatoExistente.ultimaMensagem,
                  horaUltimaMensagem: contatoExistente.horaUltimaMensagem,
                  mensagens: contatoExistente.mensagens,
                }
              }

              // Caso seja um novo contato, inicializar conversa
              const novaConversa = inicializarConversa(perfil)

              // Salvar a conversa inicializada no localStorage
              adicionarNovoMatch(userId, perfil)

              return {
                ...infoContato,
                ultimaMensagem: novaConversa.ultimaMensagem,
                horaUltimaMensagem: novaConversa.horaUltimaMensagem,
                mensagens: novaConversa.mensagens,
              }
            })

            setContatosLista(contatosMatches)
            if (contatosMatches.length === 0) {
              setSemMatches(true)
            } else {
              setSemMatches(false)
            }

            await verificarNovoMatch()
            setCarregando(false)
            setUltimaVerificacao(agora)

            // Fazer uma verificação em background para atualizar o cache
            setTimeout(() => {
              verificarMatchesBackground(userId)
            }, 1000)

            return
          }
        }

        // Buscar matches diretamente do banco de dados
        const matchIds = await getMatchesFromDatabase(userId)

        // Atualizar o timestamp da última verificação
        setUltimaVerificacao(agora)

        // Salvar no cache
        if (matchIds && matchIds.length > 0) {
          saveMatchesToCache(userId, matchIds)
        }

        // Se não houver matches, mostrar mensagem
        if (!matchIds || matchIds.length === 0) {
          setSemMatches(true)
          setContatosLista([])
          await verificarNovoMatch()
          setCarregando(false)
          return
        } else {
          setSemMatches(false)
        }

        // Processar os IDs de match para obter objetos de perfil completos
        const perfilMatches = processMatchIds(matchIds)

        // Criar objetos de contato a partir dos perfis
        const contatosMatches = perfilMatches.map((perfil) => {
          // Info básica do contato
          const infoContato = extractContactInfo(perfil)

          // Definir status online de forma consistente
          infoContato.online = isOnline(perfil.id)

          // Verificar se já existe uma conversa salva para este contato
          const conversaExistente = getConversa(userId, perfil.id)

          if (conversaExistente) {
            // Usar dados da conversa existente
            return {
              ...infoContato,
              ultimaMensagem: conversaExistente.ultimaMensagem,
              horaUltimaMensagem: conversaExistente.horaUltimaMensagem,
              mensagens: conversaExistente.mensagens,
            }
          }

          // Verificar se já existe na lista atual para preservar mensagens
          const contatoExistente = contatosLista.find((c) => c.id === perfil.id)

          if (contatoExistente) {
            return {
              ...infoContato,
              ultimaMensagem: contatoExistente.ultimaMensagem,
              horaUltimaMensagem: contatoExistente.horaUltimaMensagem,
              mensagens: contatoExistente.mensagens,
            }
          }

          // Caso seja um novo contato, inicializar conversa
          const novaConversa = inicializarConversa(perfil)

          // Salvar a conversa inicializada no localStorage
          adicionarNovoMatch(userId, perfil)

          return {
            ...infoContato,
            ultimaMensagem: novaConversa.ultimaMensagem,
            horaUltimaMensagem: novaConversa.horaUltimaMensagem,
            mensagens: novaConversa.mensagens,
          }
        })

        // Atualizar lista de contatos
        setContatosLista(contatosMatches)

        // Verificar também se há um novo match no localStorage
        await verificarNovoMatch()

        setCarregando(false)
      } catch (error) {
        console.error("Erro ao verificar matches:", error)
        setCarregando(false)
      }
    },
    [verificarNovoMatch, contatosLista, ultimaVerificacao],
  )

  // Função para verificar matches em background (sem atualizar UI)
  const verificarMatchesBackground = async (userId) => {
    try {
      const matchIds = await getMatchesFromDatabase(userId)

      if (matchIds) {
        // Apenas atualizar o cache
        saveMatchesToCache(userId, matchIds)
      }
    } catch (error) {
      console.error("Erro ao verificar matches em background:", error)
    }
  }

  // Função para verificar e criar chats para cada match
  const verificarECriarChatsParaIdMatches = useCallback(
    (userId, idmatches) => {
      if (!userId || !idmatches || !Array.isArray(idmatches) || idmatches.length === 0) {
        return
      }

      idmatches.forEach((idMatch) => {
        // Verificar se já existe uma conversa salva
        const conversaExistente = getConversa(userId, idMatch)

        if (!conversaExistente) {
          // Buscar o perfil correspondente ao match
          const perfilMatch = mulheres.find((p) => p.id.toString() === idMatch.toString())

          if (perfilMatch) {
            // Criar um estado inicial de conversa
            // Find the match profile first
            const matchProfile = mulheres.find((p) => p.id.toString() === idMatch.toString())
            const novaConversa = inicializarConversa(matchProfile)

            // Adicionar informações do perfil para facilitar a visualização
            novaConversa.nome = perfilMatch.nome
            novaConversa.foto = perfilMatch.foto || perfilMatch.imagem

            // Verificar se há mensagens iniciais na estrutura contatosBase
            if (perfilMatch.contatosBase && perfilMatch.contatosBase.length > 0) {
              const contatoBase = perfilMatch.contatosBase[0]

              if (contatoBase.mensagens && contatoBase.mensagens.length > 0) {
                // Usar apenas a primeira mensagem do contato base (não enviada pelo usuário)
                const mensagensIniciais = contatoBase.mensagens.filter((m) => !m.enviada)

                if (mensagensIniciais.length > 0) {
                  // Adicionar a primeira mensagem que não foi enviada pelo usuário
                  const agora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  novaConversa.mensagens = [
                    {
                      id: Date.now(),
                      tipo: "texto",
                      texto: mensagensIniciais[0].texto,
                      enviada: false,
                      hora: agora,
                    },
                  ]
                  novaConversa.ultimaMensagem = mensagensIniciais[0].texto
                  novaConversa.horaUltimaMensagem = agora
                  novaConversa.etapaAtual = 0 // Primeira etapa já foi adicionada
                }
              }
            }

            // Salvar a nova conversa no localStorage
            salvarConversa(userId, idMatch, novaConversa)
          } else {
            console.warn(`Não foi possível encontrar perfil para o ID: ${idMatch}`)
          }
        } else {
        }
      })

      // Verificar todas as conversas salvas

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.startsWith(`chat_${userId}_`)) {
        }
      }
    },
    [inicializarConversa],
  )

  // Função para carregar os contatos diretamente do localStorage
  const carregarContatosDoLocalStorage = useCallback((userId) => {
    if (!userId) return

    try {
      // Usar a função obterTodasConversasLocal para pegar todas as conversas
      const conversas = getConversas(userId)
      const idsChats = Object.keys(conversas)

      if (idsChats.length === 0) {
        setSemMatches(true)
        return
      }

      // Transformar as conversas em objetos de contato para exibição na UI
      const listaContatos = idsChats.map((matchId) => {
        const conversa = conversas[matchId]

        // Buscar perfil completo do match (para ter acesso a foto, etc)
        const perfilMatch = mulheres.find((p) => p.id.toString() === matchId.toString())

        // Extrair nome do perfil (removendo a idade se estiver no formato "Nome, XX")
        let nomeExibicao = conversa.nome || "Contato"
        if (nomeExibicao.includes(",")) {
          nomeExibicao = nomeExibicao.split(",")[0]
        }

        return {
          id: matchId,
          nome: nomeExibicao,
          imagem: conversa.foto || (perfilMatch ? perfilMatch.foto || perfilMatch.imagem : "/images/avatar.jpg"),
          online: isOnline(matchId), // Status online
          mensagens: conversa.mensagens || [],
          ultimaMensagem: conversa.ultimaMensagem || "",
          horaUltimaMensagem: conversa.horaUltimaMensagem || "",
        }
      })

      // Ordenar contatos pela hora da última mensagem (mais recentes primeiro)
      listaContatos.sort((a, b) => {
        if (!a.horaUltimaMensagem) return 1
        if (!b.horaUltimaMensagem) return -1
        return 0 // Manter a ordem atual se não tiver timestamp
      })

      setSemMatches(false)
      setContatosLista(listaContatos)
    } catch (error) {
      console.error("Erro ao carregar contatos do localStorage:", error)
      setSemMatches(true)
    }
  }, [])

  // Modificar o useEffect de carregamento inicial
  useEffect(() => {
    if (isUserLoggedIn()) {
      const userInfo = getUserData()
      setUserId(userInfo.id)
      setCarregando(true)

      // Primeira etapa: verificar se o usuário tem idmatches no localStorage
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const userObj = JSON.parse(userData)
          if (userObj.idmatches && Array.isArray(userObj.idmatches) && userObj.idmatches.length > 0) {
            verificarECriarChatsParaIdMatches(userInfo.id, userObj.idmatches)

            // Após criar os chats, carregar os contatos do localStorage
            carregarContatosDoLocalStorage(userInfo.id)

            // Não precisamos buscar mais matches da API, já temos no localStorage
            setCarregando(false)
          } else {
            // Segunda etapa: se não tiver matches no localStorage, fazer uma única requisição à API
            // Sem o uso da função verificarMatches que pode causar chamadas duplicadas
            fetchMatchesFromAPI(userInfo.id)
          }
        } else {
          // Se não tiver dados do usuário, também fazer uma requisição

          fetchMatchesFromAPI(userInfo.id)
        }
      } catch (error) {
        console.error("Erro ao verificar idmatches:", error)
        // Em caso de erro, também tenta fazer uma requisição
        fetchMatchesFromAPI(userInfo.id)
      }
    } else {
      redirectWithUtm("/login")
    }
  }, [redirectWithUtm, verificarECriarChatsParaIdMatches, carregarContatosDoLocalStorage])

  // Nova função para fazer uma única requisição à API
  const fetchMatchesFromAPI = async (userId) => {
    try {
      // Usar a API existente, mas com uma única chamada
      const response = await fetch(`/api/matches?userId=${userId}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar matches da API")
      }

      const data = await response.json()
      const matchIds = data.matches

      // Atualizar o localStorage com os IDs de matches
      const userData = localStorage.getItem("user")
      if (userData) {
        const userObj = JSON.parse(userData)
        userObj.idmatches = matchIds
        localStorage.setItem('user', JSON.stringify(userObj))

        // Criar chats para os matches
        if (matchIds && matchIds.length > 0) {
          verificarECriarChatsParaIdMatches(userId, matchIds)

          // Depois de criar os chats, carregar os contatos do localStorage
          carregarContatosDoLocalStorage(userId)
          setSemMatches(matchIds.length === 0)
        } else {
          setSemMatches(true)
        }
      }

      // Verificar se há um match atual para processar
      await verificarNovoMatch()
    } catch (error) {
      console.error("Erro ao buscar matches da API:", error)
      setSemMatches(true)
    } finally {
      setCarregando(false)
    }
  }

  // Função para selecionar um contato
  const selecionarContato = (id) => {
    // Instead of changing the view state, redirect to the chat page
    router.push(`/contatos/chat?id=${id}`)
  }

  // Voltar para a lista em modo mobile
  const voltarParaLista = () => {
    setShowMobile("lista")
  }

  // Função para enviar mensagem
  const enviarMensagem = (e) => {
    e.preventDefault()

    if (mensagem.trim() === "" || !contatoAtivo) return

    const novaMensagem = {
      id: contatoAtivo.mensagens.length + 1,
      texto: mensagem,
      enviada: true,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    // Atualizando o contato ativo com a nova mensagem
    const contatoAtualizado = {
      ...contatoAtivo,
      mensagens: [...contatoAtivo.mensagens, novaMensagem],
      ultimaMensagem: mensagem,
      horaUltimaMensagem: novaMensagem.hora,
    }

    // Atualizando a lista de contatos
    const novosContatos = contatosLista.map((c) => (c.id === contatoAtivo.id ? contatoAtualizado : c))

    setContatosLista(novosContatos)
    setContatoAtivo(contatoAtualizado)
    setMensagem("")

    // Salvar conversa no localStorage usando a nova função
    if (userId) {
      // Estrutura completa para salvar
      const dadosConversa = {
        mensagens: contatoAtualizado.mensagens,
        ultimaMensagem: contatoAtualizado.ultimaMensagem,
        horaUltimaMensagem: contatoAtualizado.horaUltimaMensagem,
        nome: contatoAtualizado.nome,
        foto: contatoAtualizado.imagem,
        perfilId: contatoAtualizado.id,
      }

      salvarConversa(userId, contatoAtivo.id, dadosConversa)
    }

    // Simular resposta automática após 1-3 segundos
    setTimeout(
      () => {
        // Resposta automática a partir do mockData, passando o ID do contato
        const resposta = mockData.getRespostaAutomatica(contatoAtivo.id)

        const respostaMensagem = {
          id: contatoAtualizado.mensagens.length + 1,
          texto: resposta,
          enviada: false,
          hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        // Atualizar o contato ativo com a resposta
        const contatoComResposta = {
          ...contatoAtualizado,
          mensagens: [...contatoAtualizado.mensagens, respostaMensagem],
          ultimaMensagem: resposta,
          horaUltimaMensagem: respostaMensagem.hora,
        }

        // Atualizar a lista de contatos
        const novosContatosComResposta = contatosLista.map((c) => (c.id === contatoAtivo.id ? contatoComResposta : c))

        setContatosLista(novosContatosComResposta)

        if (contatoAtivo.id === contatoAtualizado.id) {
          setContatoAtivo(contatoComResposta)
        }

        // Salvar conversa atualizada no localStorage usando a nova função
        if (userId) {
          // Estrutura completa para salvar
          const dadosConversaAtualizada = {
            mensagens: contatoComResposta.mensagens,
            ultimaMensagem: contatoComResposta.ultimaMensagem,
            horaUltimaMensagem: contatoComResposta.horaUltimaMensagem,
            nome: contatoComResposta.nome,
            foto: contatoComResposta.imagem,
            perfilId: contatoComResposta.id,
          }

          salvarConversa(userId, contatoAtivo.id, dadosConversaAtualizada)
        }
      },
      Math.random() * 2000 + 1000,
    ) // Entre 1 e 3 segundos
  }

  // Função para renderizar os contatos
  const renderContatos = () => {
    if (semMatches || contatosLista.length === 0) {
      return (
        <div
          className="sem-contatos"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h3 style={{ color: "white", marginBottom: "10px", backgroundColor: "black" }}>Você ainda não tem matches</h3>
          <p style={{ color: "white", fontSize: "14px", backgroundColor: "black" }}>
            Dê likes em perfis para conseguir matches e iniciar conversas
          </p>
        </div>
      )
    }

    return contatosLista.map((contato) => {
      // Verificar se a última mensagem é de áudio
      const ultimaMensagemAudio = contato.mensagens && contato.mensagens.length > 0 
        ? contato.mensagens[contato.mensagens.length - 1].tipo === "audio"
        : false
        
      const duracaoAudio = ultimaMensagemAudio && contato.mensagens && contato.mensagens.length > 0 
        ? contato.mensagens[contato.mensagens.length - 1].duracao
        : "0:00"
      
      return (
        <div
          key={contato.id}
          className={`contato-item ${contatoAtivo?.id === contato.id ? "ativo" : ""}`}
          onClick={() => selecionarContato(contato.id)}
          style={{
            display: "flex",
            padding: "15px",
            cursor: "pointer",
            backgroundColor: "black",
          }}
        >
          <div
            className="contato-foto"
            style={{
              position: "relative",
              marginRight: "15px",
            }}
          >
            <img
              src={contato.imagem || "/placeholder.svg"}
              alt={contato.nome}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            {contato.online && (
              <span
                style={{
                  position: "absolute",
                  bottom: "3px",
                  right: "3px",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              ></span>
            )}
          </div>
          <div
            className="contato-info"
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {contato.nome}
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                {contato.horaUltimaMensagem}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#666",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
              }}
            >
              {ultimaMensagemAudio ? (
                <>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginRight: "5px", fill: "#00e5c0" }}
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                  <span>Mensagem de áudio ({duracaoAudio})</span>
                </>
              ) : (
                contato.ultimaMensagem
              )}
            </p>
          </div>
        </div>
      )
    })
  }

  // Função para renderizar as mensagens do chat ativo

  // Função para renderizar o formulário de envio de mensagem

  // Interface principal
  return (
    <div
      style={{
        height: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
        backgroundImage: `url('/images/fundoConversa.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Head>
        <title>Meus Matches - Minha Coroa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          background: "linear-gradient(45deg, #8319C1, #b941ff, #8319C1)",
          color: "white",
          padding: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: showMobile === "chat" ? "flex-start" : "center",
        }}
      >
        {showMobile === "chat" && (
          <button
            onClick={voltarParaLista}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "white",
              padding: "10px",
              marginRight: "5px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {showMobile === "chat" && contatoAtivo ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={contatoAtivo.imagem || "/placeholder.svg"}
              alt={contatoAtivo.nome}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", color: "white" }}>{contatoAtivo.nome}</h2>
              <span
                style={{
                  fontSize: "12px",
                  color: contatoAtivo.online ? "#4CAF50" : "#e0e0e0",
                }}
              >
                {contatoAtivo.online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        ) : (
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              color: "white",
            }}
          >
            Meus Matches
          </h1>
        )}

        {showMobile === "chat" && <div style={{ width: "20px" }} /* Espaço para centralizar o título */></div>}
      </header>

      {/* Conteúdo principal */}
      <main
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          backgroundImage: `url('/images/fundoConversa.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lista de contatos */}
        <div
          className="contatos-lista"
          style={{
            width: "100%",
            overflowY: "auto",
          }}
        >
          {carregando ? <LoadingSpinner /> : renderContatos()}
        </div>
      </main>
      {showMobile === "lista" && <BottomNavigation />}
      {/* Estilos globais */}
      <GlobalStyles />
    </div>
  )
}
