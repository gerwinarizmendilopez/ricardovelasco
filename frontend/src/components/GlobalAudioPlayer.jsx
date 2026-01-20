import React, { useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Button } from './ui/button';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GlobalAudioPlayer = () => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    isReady,
    isLoading,
    togglePlayPause,
    changeVolume,
    stopPlayback,
    setWaveformContainer
  } = useAudioPlayer();

  const waveformRef = useRef(null);
  const hasInitialized = useRef(false);

  // Inicializar waveform container
  useEffect(() => {
    if (waveformRef.current && !hasInitialized.current) {
      setWaveformContainer(waveformRef.current);
      hasInitialized.current = true;
    }
  }, [setWaveformContainer, currentBeat]);

  // No mostrar si no hay beat
  if (!currentBeat) return null;

  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-zinc-900 border-t border-gray-800/50 shadow-2xl">
      {/* Waveform */}
      <div className="w-full bg-zinc-900/90 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-14 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-1 relative min-h-[60px]">
              {/* WaveSurfer container */}
              <div 
                ref={waveformRef}
                className="w-full"
                style={{ minHeight: '60px' }}
              />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span className="text-sm">Cargando waveform...</span>
                  </div>
                </div>
              )}
            </div>
            
            <span className="text-sm text-gray-400 w-14 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-14 h-14 rounded-lg object-cover shadow-lg flex-shrink-0 border border-zinc-700"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=🎵'; }}
            />
            <div className="min-w-0">
              <h4 className="text-white font-bold truncate text-lg">{currentBeat.name}</h4>
              <p className="text-sm text-gray-400">
                <span className="text-white400">{currentBeat.genre}</span>
                {' • '}{currentBeat.bpm} BPM{' • '}{currentBeat.key}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              size="lg"
              className={`rounded-full w-14 h-14 ${isPlaying ? 'bg-white text-black hover:bg-white' : 'bg-white hover:bg-gray-200'}`}
              onClick={togglePlayPause}
              disabled={!isReady}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => changeVolume(volume > 0 ? 0 : 0.8)} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 rounded-full cursor-pointer accent-white bg-zinc-700"
              />
            </div>

            {/* Close */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full w-10 h-10"
              onClick={stopPlayback}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
