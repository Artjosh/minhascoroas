import { useState, useEffect } from "react";

/**
 * Audio Message Component
 * Simulates an audio message in WhatsApp style.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.mensagem - Audio message object.
 * @param {boolean} props.enviada - Indicates if the message was sent by the user.
 */
const AudioMessage = ({ mensagem, sent = false }) => {
  // Ensure the message is a valid object
  const safeMessage = mensagem || {};

  // Check if the message is actually of type 'audio'
  if (safeMessage.tipo !== "audio") {
    console.warn(
      "[AudioMessage] WARNING: Message is not of type audio:",
      safeMessage,
    );
  }

  const [isPlaying, setIsPlaying] = useState(false); // State to control playback status
  const [progress, setProgress] = useState(0); // State for progress bar
  const [intervalId, setIntervalId] = useState(null); // State to manage interval ID

  /**
   * Converts the duration from "0:30" format to seconds.
   *
   * @param {string} duration - Duration in "m:ss" format.
   * @returns {number} Duration in seconds.
   */
  const getDurationInSeconds = (duration) => {
    if (!duration) return 30; // Padrão de 30 segundos
    const parts = duration.split(":");
    if (parts.length !== 2) return 30;

    try {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } catch (e) {
      console.error("[AudioMessage] Error converting duration:", e);
      return 30;
    }
  };

  const durationInSeconds = getDurationInSeconds(safeMessage.duracao);

  // Clear interval when the component is unmounted
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Simulate audio playback without playing real audio
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setProgress(0);
    } else {
      setIsPlaying(true);
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 1;
        const progressPercent = (currentProgress / durationInSeconds) * 100; // Progress percentage calculation

        setProgress(progressPercent);

        if (currentProgress >= durationInSeconds) {
          setIsPlaying(false);
          setProgress(0);
          clearInterval(interval);
          setIntervalId(null);
        }
      }, 1000);

      setIntervalId(interval);
    }
  };

  //Styles
  const playerStyles = {
    audioPlayer: {
      "--player-color-featured": "#00e5c0",
      "--player-color-background": sent ? "#056162" : "#262d31",
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
    btnPlaySvg:{
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
      background: "var(--player-color-featured)",
      height: "var(--line-height)",
      borderRadius: "calc(var(--line-height) / 2)",
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
      backgroundColor: "#E2E2E2",
    },
    data: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.68rem",
      color: "var(--player-color-text)",
      position: "absolute",
      width: "100%",
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
      width: "55px",
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
      bottom: "15px",
      color: "#00e5c0",
      transform: "translateX(50%)",
      fontSize: "2.0rem",
      textShadow:
        " -1px -1px 0 var(--player-color-background), 1px -1px 0 var(--player-color-background), -1px 1px 0 var(--player-color-background), 1px 1px 0 var(--player-color-background)",
    },
    current: {
      position: "relative",
      bottom: "-16px",
    },
    totalTime: {
      position: "relative",
      bottom: "-16px",
      marginLeft: "5px",
    },
    svg:{
      fill: "#fff"
    }
  };

  return (
    <div className={sent ? "audio-player mine" : "audio-player"} style={playerStyles.audioPlayer}>
      <div className="player" style={playerStyles.player}>
       <button type="button" className="btn-play" onClick={togglePlay} style={playerStyles.btnPlay}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={playerStyles.btnPlaySpan} className="icon-pause">
              <path d="M10 4H6V20H10V4Z" style={playerStyles.svg} />
              <path d="M18 4H14V20H18V4Z" style={playerStyles.svg} />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={playerStyles.btnPlaySpan} className="icon-play">
              <path d="M8 5V19L19 12L8 5Z" style={playerStyles.svg}/>
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
            />
          </div>
          <div className="data" style={{...playerStyles.data,  bottom: "-16px",}}>
            <div className="current-time" style={{...playerStyles.current}}>
                {"00:00"}
            </div>
            <div className="total-time" style={{...playerStyles.totalTime}}>
                {safeMessage.duracao}
            </div>
          </div>
        </div>
                <div className="user" style={playerStyles.user}>
        <img
          src="https://avatars.githubusercontent.com/u/3522573?&v=4"
          style={playerStyles.userImg}
        />
        <span className="material-icons" style={playerStyles.userSpan}>mic</span>
              {sent && <span className="material-icons" style={playerStyles.timeSpan}>done_all</span>}

      </div>
      </div>
      </div>
  );
};

export default AudioMessage;