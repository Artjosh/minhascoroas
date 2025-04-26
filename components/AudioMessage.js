"use client"

import { useState, useEffect } from "react"

/**
 * Audio Message Component
 * Simulates an audio message in WhatsApp style.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.mensagem - Audio message object.
 * @param {boolean} props.enviada - Indicates if the message was sent by the user.
 */
const AudioMessage = ({ mensagem, enviada = false }) => {
  // Ensure the message is a valid object
  const safeMessage = mensagem || {}

  // Check if the message is actually of type 'audio'
  if (safeMessage.tipo !== "audio") {
    console.warn("[AudioMessage] WARNING: Message is not of type audio:", safeMessage)
  }

  const [isPlaying, setIsPlaying] = useState(false) // State to control playback status
  const [progress, setProgress] = useState(0) // State for progress bar
  const [intervalId, setIntervalId] = useState(null) // State to manage interval ID
  const [currentTime, setCurrentTime] = useState(0) // Estado para o tempo atual

  /**
   * Converts the duration from "0:30" format to seconds.
   *
   * @param {string} duration - Duration in "m:ss" format.
   * @returns {number} Duration in seconds.
   */
  const getDurationInSeconds = (duration) => {
    if (!duration) return 30 // Padrão de 30 segundos
    const parts = duration.split(":")
    if (parts.length !== 2) return 30

    try {
      return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
    } catch (e) {
      console.error("[AudioMessage] Error converting duration:", e)
      return 30
    }
  }

  const durationInSeconds = getDurationInSeconds(safeMessage.duracao)

  // Clear interval when the component is unmounted
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [intervalId])

  // Função para formatar segundos em mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")
    return `${min}:${sec}`
  }

  // Função para manipular mudança manual do input range
  const handleSeek = (e) => {
    const percent = Number(e.target.value)
    const newTime = Math.round((percent / 100) * durationInSeconds)
    setCurrentTime(newTime)
    setProgress(percent)
    // Se estiver tocando, reinicia o intervalo a partir do novo tempo
    if (isPlaying) {
      if (intervalId) clearInterval(intervalId)
      startPlayingFrom(newTime)
    }
  }

  // Function to start playing from a specific time
  const startPlayingFrom = (startTimeInSeconds) => {
    let currentSeconds = startTimeInSeconds
    const interval = setInterval(() => {
      currentSeconds += 1
      const progressPercent = (currentSeconds / durationInSeconds) * 100
      setProgress(progressPercent)
      setCurrentTime(currentSeconds)
      if (currentSeconds >= durationInSeconds) {
        setIsPlaying(false)
        setProgress(0)
        setCurrentTime(0)
        clearInterval(interval)
        setIntervalId(null)
      }
    }, 1000)
    setIntervalId(interval)
  }

  // Simulate audio playback without playing real audio
  const togglePlay = () => {
    if (isPlaying) {
      // Just pause, don't reset position
      setIsPlaying(false)
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    } else {
      // Start playing from current position
      setIsPlaying(true)
      startPlayingFrom(currentTime)
    }
  }

  //Styles
  const playerStyles = {
    audioPlayer: {
      "--player-color-featured": "#00e5c0",
      "--player-color-background": enviada ? "#056162" : "#262d31",
      "--player-color-text": "#c5c6c8",
      "--player-percent-played": `${progress}%`,
      "--player-current-time": `'${safeMessage.duracao || "0:30"}'`,
      "--player-current-date-time": `'${safeMessage.hora || "Agora"}'`,
      background: "var(--player-color-background)",
      display: "inline-flex",
      minWidth: "240px",
      width: "336px",
      maxWidth: "100%",
      borderRadius: "0.4rem",
      padding: "0.4rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      userSelect: "none",
      fontFamily: "Arial, sans-serif",
      marginBottom: "15px",
    },
    player: {
      display: "flex",
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: '67px',
    },
    btnPlay: {
      outline: "none",
      appearance: "none",
      cursor: "pointer",
      background: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: 0,
      padding: 0,
      width: "30px",
      height: "30px",
    },
    btnPlaySpan: {
      color: "#fff",
      fontSize: "24px",
      opacity: 0.8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    btnPlaySvg: {
      width: "24px",
      height: "24px",
    },
    timeline: {
      flex: 1,
      marginLeft: "10px",
      marginRight: "10px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      paddingBottom: "0.2rem",
    },
    line: {
      "--line-height": "0.24rem",
      flex: 1,
      display: "flex",
      alignItems: "center",
      position: "relative",
    },
    lineBefore: {
      content: '""',
      width: "var(--player-percent-played)",
      position: "absolute",
      background: "#00e5c0",
      height: "4px",
      borderRadius: "2px",
      zIndex: 1,
    },
    inputRange: {
      all: "unset",
      appearance: "none",
      backgroundColor: "initial !important",
      border: "none",
      outline: "none",
      width: "100%",
      height: "4px",
      borderRadius: "2px",
      position: "relative",
      backgroundColor: "#262d31",
    },
    data: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "0.75rem",
      color: "var(--player-color-text)",
      position: "absolute",
      width: "100%",
      bottom: "-16px",
    },
    time: {
      alignItems: "center",
    },
    timeSpan: {
      fontSize: "1rem",
      marginLeft: "0.4rem",
      color: "var(--player-color-featured)",
    },
    user: {
      position: "relative",
      width: "65px",
      height: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
    },
    userImg: {
      width: "auto",
      height: "auto",
      maxWidth: "55px",
      height: "55px",
      borderRadius: "50%",
      objectFit: "cover",
      background: "rgba(255, 255, 255, 0.01)",
    },
    userSpan: {
      position: "absolute",
      top: "25px",
      right: "55px",
      color: "#00e5c0",
      transform: "translateX(50%)",
      fontSize: "2.0rem",
      textShadow:
        " -1px -1px 0 var(--player-color-background), 1px -1px 0 var(--player-color-background), -1px 1px 0 var(--player-color-background), 1px 1px 0 var(--player-color-background)",
    },
    current: {
      position: "relative",
      bottom: "-10px",
    },
    totalTime: {
      position: "relative",
      bottom: "-10px",
    },
    svg: {
      fill: "#fff",
    },
  }

  return (
    <div className={enviada ? "audio-player mine" : "audio-player"} style={playerStyles.audioPlayer}>
      <div className="player" style={playerStyles.player}>
        <button type="button" className="btn-play" onClick={togglePlay} style={playerStyles.btnPlay}>
          {isPlaying ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={playerStyles.btnPlaySpan}
              className="icon-pause"
            >
              <path d="M10 4H6V20H10V4Z" style={playerStyles.svg} />
              <path d="M18 4H14V20H18V4Z" style={playerStyles.svg} />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={playerStyles.btnPlaySpan}
              className="icon-play"
            >
              <path d="M8 5V19L19 12L8 5Z" style={playerStyles.svg} />
            </svg>
          )}
        </button>
        <div className="timeline" style={playerStyles.timeline}>
          <div className="line" style={playerStyles.line}>
            <div style={playerStyles.lineBefore} />
            <input
              dir="ltr"
              type="range"
              min="0"
              max="100"
              value={progress}
              style={playerStyles.inputRange}
              onChange={handleSeek}
            />
          </div>
          <div className="data" style={playerStyles.data}>
            <div className="current-time" style={{ ...playerStyles.current }}>
              {formatTime(currentTime)}
            </div>
            <div className="total-time" style={{ ...playerStyles.totalTime }}>
              {safeMessage.duracao}
            </div>
          </div>
        </div>
        <div className="user" style={playerStyles.user}>
          <img
            src={safeMessage.userImage || "https://avatars.githubusercontent.com/u/3522573?&v=4"}
            style={playerStyles.userImg}
            alt="Profile"
          />
          <svg
            style={playerStyles.userSpan}
            xmlns="http://www.w3.org/2000/svg"
            height="32"
            viewBox="0 0 24 24"
            width="32"
            fill="#00e5c0"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          {enviada && (
            <span className="material-icons" style={playerStyles.timeSpan}>
              done_all
            </span>
          )}
        </div>
      </div>
      <style jsx>{`
        /* Custom styles for the range input */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00e5c0;
          cursor: pointer;
          position: relative;
          z-index: 2;
          margin-top: -6px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: #00e5c0;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        
        input[type="range"]::-ms-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00e5c0;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #262d31;
          border-radius: 2px;
        }
        
        input[type="range"]::-moz-range-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #262d31;
          border-radius: 2px;
        }
        
        input[type="range"]::-ms-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: transparent;
          border-color: transparent;
          color: transparent;
        }
        
        input[type="range"]::-ms-fill-lower {
          background: #00e5c0;
          border-radius: 2px;
        }
        
        input[type="range"]::-ms-fill-upper {
          background: #262d31;
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}

export default AudioMessage
