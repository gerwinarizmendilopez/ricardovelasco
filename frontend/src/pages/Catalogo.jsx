import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Music2, Filter, Search, ChevronDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const Catalogo = () => {
  const [beats, setBeats] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  const { currentBeat, isPlaying, playBeat } = useAudioPlayer();

  // Helper para construir URL de imagen con cache buster
  const getCoverUrl = useCallback((beat) => {
    const filename = beat.cover_filename || beat.cover_url?.split('/').pop();
    const timestamp = beat.updated_at || beat.created_at || imageTimestamp;
    return `${API}/beats/cover/${filename}?t=${timestamp}`;
  }, [imageTimestamp]);

  useEffect(() => {
    fetchBeats();
    fetchGenres();
  }, []);

  const fetchBeats = async () => {
    try {
      const response = await axios.get(`${API}/beats`);
      setBeats(response.data.beats || []);
      // Actualizar timestamp para forzar recarga de imágenes
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error cargando beats:', error);
      toast.error('Error al cargar los beats');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API}/beats/genres/list`);
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error cargando géneros:', error);
    }
  };

  // Filtrar y ordenar beats
  const filteredBeats = beats
    .filter(beat => {
      const matchesSearch = beat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.mood.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || beat.genre.toLowerCase() === selectedGenre.toLowerCase();
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      // Calcular precio real considerando descuento
      const getPriceWithDiscount = (beat) => {
        if (beat.discount_percentage && beat.discount_percentage > 0) {
          return beat.price_basica * (100 - beat.discount_percentage) / 100;
        }
        return beat.price_basica;
      };
      
      switch (sortBy) {
        case 'recent':
          // Más recientes primero (fecha más nueva primero)
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          // Menos recientes primero (fecha más antigua primero)
          return new Date(a.created_at) - new Date(b.created_at);
        case 'price-low':
          // Precio de menor a mayor (considerando descuento)
          return getPriceWithDiscount(a) - getPriceWithDiscount(b);
        case 'price-high':
          // Precio de mayor a menor (considerando descuento)
          return getPriceWithDiscount(b) - getPriceWithDiscount(a);
        case 'popular':
          // Más populares primero
          return (b.plays || 0) - (a.plays || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const handlePlayPause = async (beat) => {
    const audioUrl = `${API}/beats/audio/${beat.audio_url.split('/').pop()}`;
    await playBeat(beat, audioUrl);
    
    // Registrar play en el servidor (solo si es un nuevo beat)
    if (currentBeat?.beat_id !== beat.beat_id) {
      axios.post(`${API}/beats/${beat.beat_id}/play`).catch(() => {});
    }
  };

  const isCurrentBeatPlaying = (beatId) => {
    return currentBeat?.beat_id === beatId && isPlaying;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando beats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-20 md:pt-24 pb-32 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-black"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_secure-payment-app-3/artifacts/phdju06f_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2811%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay oscuro sutil */}
      <div className="fixed inset-0 bg-black/30"></div>
      
      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Catálogo de Beats</h1>
          <p className="text-gray-400 text-base md:text-lg">
            Explora {beats.length} beat{beats.length !== 1 ? 's' : ''} profesional{beats.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, género o mood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-gray-800/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filters Row - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Genre Filter - Dropdown */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
              <div className="relative flex-1 sm:flex-none">
                <button
                  onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-md border transition-colors ${
                    selectedGenre !== 'all' 
                      ? 'bg-white border-gray-200 text-black' 
                      : 'bg-zinc-900 border-gray-800/20 text-gray-300 hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm">{selectedGenre === 'all' ? 'Todos los géneros' : selectedGenre}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showGenreDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-zinc-900 border border-gray-800/20 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedGenre('all');
                        setShowGenreDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-900/30 transition-colors text-sm ${
                        selectedGenre === 'all' ? 'text-white bg-gray-900/20' : 'text-gray-300'
                      }`}
                    >
                      Todos los géneros
                    </button>
                    {genres.map((genre) => (
                      <button
                        key={genre.genre_id}
                        onClick={() => {
                          setSelectedGenre(genre.name);
                          setShowGenreDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-900/30 transition-colors text-sm ${
                          selectedGenre === genre.name ? 'text-white bg-gray-900/20' : 'text-gray-300'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                    {genres.length === 0 && (
                      <p className="px-4 py-2 text-gray-500 text-sm">No hay géneros disponibles</p>
                    )}
                  </div>
                )}
              </div>
              
              {selectedGenre !== 'all' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white p-1 sm:p-2"
                  onClick={() => setSelectedGenre('all')}
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Limpiar</span>
                </Button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 whitespace-nowrap">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none bg-zinc-900 border border-gray-800/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-200"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Menos recientes</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="popular">Más populares</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Mostrando {filteredBeats.length} beat{filteredBeats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Beats Grid */}
        {filteredBeats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <Card key={beat.beat_id} className="bg-black/60 border-gray-800/20 hover:border-gray-200/50 transition-all group rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img 
                      src={getCoverUrl(beat)}
                      alt={beat.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=🎵';
                      }}
                    />
                    {/* Etiqueta de género */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/70 text-xs text-white rounded-full border border-white/30">
                        {beat.genre}
                      </span>
                    </div>
                    
                    {/* Etiquetas de promoción */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {beat.discount_percentage && (
                        <span className="px-2 py-1 bg-red-600 text-xs text-white font-bold rounded-full shadow-lg animate-pulse">
                          DESCUENTO DE {beat.discount_percentage}%
                        </span>
                      )}
                      {beat.is_leaving_soon && (
                        <span className="px-2 py-1 bg-red-600 text-xs text-white font-bold rounded-full shadow-lg">
                          ¡Se va pronto!
                        </span>
                      )}
                    </div>
                    
                    {/* Play/Pause Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="lg" 
                        className={`rounded-full w-14 h-14 ${isCurrentBeatPlaying(beat.beat_id) ? 'bg-white text-black hover:bg-gray-200' : 'bg-white text-black hover:bg-gray-200'}`}
                        onClick={() => handlePlayPause(beat)}
                      >
                        {isCurrentBeatPlaying(beat.beat_id) ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>
                    </div>
                    {/* Playing Indicator */}
                    {isCurrentBeatPlaying(beat.beat_id) && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full">
                        <div className="flex gap-0.5">
                          <span className="w-1 h-3 bg-white rounded-full animate-pulse"></span>
                          <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                          <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                        </div>
                        <span className="text-xs text-white ml-1">Playing</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 truncate text-white">{beat.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                      <Music2 className="w-3 h-3" />
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>{beat.key}</span>
                      <span>•</span>
                      <span>{beat.mood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                      <span>{(beat.plays || 0).toLocaleString()} plays</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-white/70">Desde</span>
                        {beat.discount_percentage ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm line-through text-gray-500">${beat.price_basica}</span>
                            <span className="text-xl font-bold text-green-400">
                              ${(beat.price_basica * (100 - beat.discount_percentage) / 100).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xl font-bold text-white">${beat.price_basica}</div>
                        )}
                      </div>
                      <Link to={`/beat/${beat.beat_id}`}>
                        <Button size="sm" className="bg-white hover:bg-gray-200 text-black">
                          Ver Más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {beats.length === 0 ? 'No hay beats disponibles aún' : 'No se encontraron beats'}
            </h3>
            <p className="text-gray-500">
              {beats.length === 0 
                ? 'Pronto agregaremos nuevos beats al catálogo' 
                : 'Intenta con otros filtros o términos de búsqueda'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
