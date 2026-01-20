import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Shield, Music2, Clock, Gauge, Sparkles, ShoppingCart, Play, Pause } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Tipos de licencia
const licenseTypes = {
  basica: {
    name: 'Licencia Básica',
    features: [
      'Archivo MP3 de alta calidad',
      'Uso en streaming (Spotify, Apple Music, etc.)',
      'Hasta 10,000 streams',
      'Uso en YouTube (sin monetización)',
      'Créditos requeridos al productor'
    ]
  },
  premium: {
    name: 'Licencia Premium',
    features: [
      'Archivos WAV + MP3 + Stems',
      'Uso en streaming hasta 500,000 streams',
      'Monetización en YouTube permitida',
      'Hasta 1 video musical',
      'Uso en radio y TV local',
      'Distribución en tiendas digitales'
    ]
  },
  exclusiva: {
    name: 'Licencia Exclusiva',
    features: [
      'Todos los archivos del proyecto',
      'Derechos exclusivos del beat',
      'El beat se retira del catálogo',
      'Uso comercial ilimitado',
      'Sin límite de streams o ventas',
      'Transferencia de derechos incluida'
    ]
  }
};

export const BeatDetail = () => {
  const { id } = useParams();
  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState('basica');
  const { addToCart, isInCart } = useCart();
  const { currentBeat, isPlaying, playBeat } = useAudioPlayer();

  useEffect(() => {
    fetchBeat();
  }, [id]);

  const fetchBeat = async () => {
    try {
      const response = await axios.get(`${API}/beats/${id}`);
      setBeat(response.data);
    } catch (error) {
      console.error('Error cargando beat:', error);
      toast.error('Error al cargar el beat');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!beat) return;
    const audioUrl = `${API}/beats/audio/${beat.audio_url.split('/').pop()}`;
    await playBeat(beat, audioUrl);
    
    // Registrar play
    if (currentBeat?.beat_id !== beat.beat_id) {
      axios.post(`${API}/beats/${beat.beat_id}/play`).catch(() => {});
    }
  };

  const isCurrentBeatPlaying = currentBeat?.beat_id === beat?.beat_id && isPlaying;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Beat no encontrado</h2>
          <Link to="/catalogo">
            <Button className="bg-white hover:bg-gray-200 text-black">Volver al Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper para obtener URL de cover con cache buster
  const getCoverUrl = () => {
    const filename = beat.cover_filename || beat.cover_url?.split('/').pop();
    const timestamp = beat.updated_at || beat.created_at || Date.now();
    return `${API}/beats/cover/${filename}?t=${timestamp}`;
  };

  // Helper para calcular precio con descuento
  const getDiscountedPrice = (originalPrice) => {
    if (beat.discount_percentage && beat.discount_percentage > 0) {
      return (originalPrice * (100 - beat.discount_percentage) / 100).toFixed(2);
    }
    return originalPrice;
  };

  // Helper para renderizar precio con/sin descuento
  const renderPrice = (originalPrice) => {
    if (beat.discount_percentage && beat.discount_percentage > 0) {
      return (
        <div className="text-right">
          <div className="text-sm line-through text-gray-500">${originalPrice}</div>
          <div className="text-3xl font-bold text-green-400">${getDiscountedPrice(originalPrice)}</div>
        </div>
      );
    }
    return <div className="text-3xl font-bold text-white">${originalPrice}</div>;
  };

  // Preparar datos del beat para el carrito (con precios descontados)
  const beatForCart = {
    id: beat.beat_id,
    name: beat.name,
    coverImage: getCoverUrl(),
    prices: {
      basica: parseFloat(getDiscountedPrice(beat.price_basica)),
      premium: parseFloat(getDiscountedPrice(beat.price_premium)),
      exclusiva: parseFloat(getDiscountedPrice(beat.price_exclusiva))
    },
    originalPrices: {
      basica: beat.price_basica,
      premium: beat.price_premium,
      exclusiva: beat.price_exclusiva
    },
    discount_percentage: beat.discount_percentage
  };

  const handleAddToCart = () => {
    addToCart(beatForCart, selectedLicense);
  };

  const inCart = isInCart(beat.beat_id, selectedLicense);

  // Obtener precio actual para el botón
  const getCurrentPrice = () => {
    const originalPrice = beat[`price_${selectedLicense}`];
    return getDiscountedPrice(originalPrice);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Beat Info & Player */}
          <div>
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img 
                src={getCoverUrl()}
                alt={beat.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=🎵';
                }}
              />
              {/* Etiqueta de género */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full border border-white/30">
                  {beat.genre}
                </span>
              </div>
              
              {/* Etiquetas de promoción */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {beat.discount_percentage && (
                  <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                    DESCUENTO DE {beat.discount_percentage}%
                  </span>
                )}
                {beat.is_leaving_soon && (
                  <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                    ¡Se va pronto!
                  </span>
                )}
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Button 
                  size="lg"
                  className={`rounded-full w-20 h-20 ${isCurrentBeatPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={handlePlayPause}
                >
                  {isCurrentBeatPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
              </div>
              {/* Playing Indicator */}
              {isCurrentBeatPlaying && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/70 rounded-full">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-4 bg-white rounded-full animate-pulse"></span>
                    <span className="w-1 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                  </div>
                  <span className="text-sm text-white font-medium">Reproduciendo...</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{beat.name}</h1>
            <p className="text-gray-400 mb-6">Por HØME Records</p>

            {/* Beat Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
                <Gauge className="w-5 h-5 text-white mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{beat.bpm}</div>
                <div className="text-xs text-gray-300">BPM</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
                <Music2 className="w-5 h-5 text-white mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{beat.key}</div>
                <div className="text-xs text-gray-300">Tonalidad</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 text-white mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{(beat.plays || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-300">Plays</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
                <Sparkles className="w-5 h-5 text-white mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{beat.mood}</div>
                <div className="text-xs text-gray-300">Mood</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-900/30 border border-gray-800/30 text-white400 text-sm rounded-full">
                  #{beat.genre.toLowerCase()}
                </span>
                <span className="px-3 py-1 bg-gray-900/30 border border-gray-800/30 text-white400 text-sm rounded-full">
                  #{beat.mood.toLowerCase()}
                </span>
                <span className="px-3 py-1 bg-gray-900/30 border border-gray-800/30 text-white400 text-sm rounded-full">
                  #{beat.bpm}bpm
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Licenses & Purchase */}
          <div>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Elige tu licencia</h2>

              <div className="space-y-4 mb-8">
                {/* Banner de descuento */}
                {beat.discount_percentage && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-center text-red-400 font-bold">
                      🔥 DESCUENTO DE {beat.discount_percentage}% EN TODAS LAS LICENCIAS
                    </p>
                  </div>
                )}
                
                {/* Basica */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLicense === 'basica'
                      ? 'bg-black/70 backdrop-blur-sm border-white/70'
                      : 'bg-black/60 backdrop-blur-sm border-gray-700/50 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedLicense('basica')}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white">{licenseTypes.basica.name}</CardTitle>
                        <p className="text-sm text-gray-300 mt-1">Para lanzamientos digitales</p>
                      </div>
                      {renderPrice(beat.price_basica)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.basica.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Premium */}
                <Card 
                  className={`cursor-pointer transition-all relative overflow-hidden ${
                    selectedLicense === 'premium'
                      ? 'bg-black/70 backdrop-blur-sm border-white/70'
                      : 'bg-black/60 backdrop-blur-sm border-gray-700/50 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedLicense('premium')}
                >
                  <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MÁS POPULAR
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white">{licenseTypes.premium.name}</CardTitle>
                        <p className="text-sm text-gray-300 mt-1">Para artistas serios</p>
                      </div>
                      {renderPrice(beat.price_premium)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.premium.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Exclusiva */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLicense === 'exclusiva'
                      ? 'bg-black/70 backdrop-blur-sm border-white/70'
                      : 'bg-black/60 backdrop-blur-sm border-gray-700/50 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedLicense('exclusiva')}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white">{licenseTypes.exclusiva.name}</CardTitle>
                        <p className="text-sm text-gray-300 mt-1">Derechos completos</p>
                      </div>
                      {renderPrice(beat.price_exclusiva)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.exclusiva.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-6 text-lg"
                onClick={handleAddToCart}
                disabled={inCart}
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {inCart ? 'Ya está en el carrito' : `Añadir al Carrito - $${getCurrentPrice()}`}
              </Button>

              <div className="mt-6 p-4 bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-white mb-1">Compra 100% Segura</p>
                    <p className="text-gray-200">Descarga inmediata por email. Contrato PDF incluido. Soporte 24/7.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
