import { useState, useRef, useEffect } from 'react';
import styles from '../styles/AudioMessage.module.css';

const AudioMessage = ({ duracao, onPlay, onPause, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const totalSeconds = convertDurationToSeconds(duracao);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const convertDurationToSeconds = (duration) => {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(progressInterval.current);
      setIsPlaying(false);
      onPause?.();
    } else {
      setIsPlaying(true);
      onPlay?.();
      
      // Simular progresso do áudio
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            setIsPlaying(false);
            onEnded?.();
            return 0;
          }
          return prev + (100 / totalSeconds / 10); // Atualiza 10x por segundo
        });
      }, 100);
    }
  };

  const currentTime = (progress / 100) * totalSeconds;

  return (
    <div className={styles.audioMessage}>
      <button 
        className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
        onClick={handlePlayPause}
      >
        {isPlaying ? (
          <span className={styles.pauseIcon}></span>
        ) : (
          <span className={styles.playIcon}></span>
        )}
      </button>
      
      <div className={styles.waveform}>
        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className={styles.duration}>
        {formatTime(currentTime)} / {duracao}
      </div>
    </div>
  );
};

export default AudioMessage; 