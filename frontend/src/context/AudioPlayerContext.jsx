import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const wavesurferRef = useRef(null);
  const containerRef = useRef(null);
  const pendingBeatRef = useRef(null);

  // Crear WaveSurfer cuando el container esté disponible
  const setWaveformContainer = useCallback((container) => {
    if (!container) return;
    containerRef.current = container;
    
    // Destruir instancia anterior si existe
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    const ws = WaveSurfer.create({
      container: container,
      waveColor: '#525252',
      progressColor: '#ffffff',
      cursorColor: '#ffffff',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      height: 60,
      normalize: true,
      interact: true,
    });
    
    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setIsReady(true);
      setIsLoading(false);
      ws.setVolume(volume);
    });
    
    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });
    
    ws.on('seeking', () => {
      setCurrentTime(ws.getCurrentTime());
    });
    
    ws.on('interaction', () => {
      setCurrentTime(ws.getCurrentTime());
    });
    
    ws.on('finish', () => {
      setIsPlaying(false);
    });
    
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    
    ws.on('error', (err) => {
      console.error('WaveSurfer error:', err);
      setIsLoading(false);
    });
    
    wavesurferRef.current = ws;
    
    // Si hay un beat pendiente, cargarlo
    if (pendingBeatRef.current) {
      const { beat, audioUrl } = pendingBeatRef.current;
      pendingBeatRef.current = null;
      loadAndPlay(beat, audioUrl, ws);
    }
  }, [volume]);

  const loadAndPlay = async (beat, audioUrl, ws) => {
    setIsLoading(true);
    setIsReady(false);
    setCurrentTime(0);
    
    try {
      await ws.load(audioUrl);
      ws.play();
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const playBeat = useCallback(async (beat, audioUrl) => {
    const ws = wavesurferRef.current;
    
    // Si es el mismo beat, toggle play/pause
    if (currentBeat?.beat_id === beat.beat_id && ws) {
      ws.playPause();
      return;
    }
    
    // Nuevo beat
    setCurrentBeat(beat);
    setDuration(0);
    
    if (ws) {
      loadAndPlay(beat, audioUrl, ws);
    } else {
      // Guardar para cuando el container esté listo
      pendingBeatRef.current = { beat, audioUrl };
    }
  }, [currentBeat]);

  const togglePlayPause = useCallback(() => {
    const ws = wavesurferRef.current;
    if (ws && isReady) {
      ws.playPause();
    }
  }, [isReady]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    const ws = wavesurferRef.current;
    if (ws) {
      ws.setVolume(newVolume);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    const ws = wavesurferRef.current;
    if (ws) {
      ws.stop();
      ws.empty();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentBeat(null);
    setIsReady(false);
    setIsLoading(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentBeat,
        isPlaying,
        currentTime,
        duration,
        volume,
        isReady,
        isLoading,
        playBeat,
        togglePlayPause,
        changeVolume,
        stopPlayback,
        setWaveformContainer
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
