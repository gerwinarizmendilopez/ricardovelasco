import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Download, Shield, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useMobileScrollAnimation } from '../hooks/useMobileScrollAnimation';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Value Props Data
const valueProps = [
  {
    id: 0,
    title: "Licencias Claras",
    description: "Sin letra pequeña. Sabes exactamente qué puedes hacer con cada beat. Contratos PDF incluidos."
  },
  {
    id: 1,
    title: "Descarga Inmediata",
    description: "Compra ahora, descarga en segundos. MP3 y WAV de alta calidad directo a tu email."
  },
  {
    id: 2,
    title: "Listo para Monetizar",
    description: "Sube a Spotify, Apple Music, YouTube. Todos los beats listos para uso comercial."
  }
];

// Value Props Section Component
const ValuePropsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('up');

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('up');
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % valueProps.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleBarClick = useCallback((index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 'up' : 'down');
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 300);
  }, [activeIndex]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden">
      {/* Background - Split Design */}
      <div className="absolute inset-0">
        {/* Full background GIF in B&W */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://customer-assets.emergentagent.com/job_import-site/artifacts/iqzwia70_Adobe%20Express%20-%200115.gif')`,
            filter: 'grayscale(100%) brightness(0.4)'
          }}
        />
        
        {/* Black overlay from left - 35% black, 65% GIF visible on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black from-0% via-35% to-transparent" />
        
        {/* Top Fade - Smooth transition from previous section */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Bottom Fade - Smooth transition to footer */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Content - Same structure as "TU PROXIMO HIT" section */}
      <div className="relative z-20 h-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center px-8 lg:px-20">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Left aligned content - same as other sections */}
          <div className="space-y-6 max-w-2xl">
            {/* Title - Same size as "TU PROXIMO HIT ESTA AQUÍ" */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}>
              ¿QUÉ DEBES SABER?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-md">
              Todo lo que necesitas para lanzar tu música hoy
            </p>

            {/* Carousel with bars */}
            <div className="flex items-center gap-8 md:gap-10 pt-4">
              {/* Navigation Bars - Rectangular, thin, white highlight */}
              <div className="flex flex-col gap-3">
                {valueProps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleBarClick(index)}
                    className={`w-0.5 h-12 md:h-16 transition-all duration-300 ${
                      activeIndex === index 
                        ? 'bg-white w-1' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Ver ${valueProps[index].title}`}
                  />
                ))}
              </div>

              {/* Carousel Content */}
              <div className="relative w-80 md:w-[450px] lg:w-[500px] h-44 md:h-52 overflow-hidden">
                <div 
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-300 ${
                    isAnimating 
                      ? direction === 'up' 
                        ? '-translate-y-full opacity-0' 
                        : 'translate-y-full opacity-0'
                      : 'translate-y-0 opacity-100'
                  }`}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
                    {valueProps[activeIndex].title}
                  </h3>
                  <p className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed">
                    {valueProps[activeIndex].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Home = () => {
  const [beats, setBeats] = useState([]);
  
  // Hooks para animaciones en móvil
  const { ref: conocenosRef, isAnimating: isConocenosAnimating } = useMobileScrollAnimation(1000);
  const { ref: beatPersonalizadoRef, isAnimating: isBeatPersonalizadoAnimating } = useMobileScrollAnimation(1000);
  const { ref: explorarCatalogoRef, isAnimating: isExplorarCatalogoAnimating } = useMobileScrollAnimation(1000);
  const { ref: catalogoCompletoRef, isAnimating: isCatalogoCompletoAnimating } = useMobileScrollAnimation(1000);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await axios.get(`${API}/beats`);
        setBeats(response.data.beats || []);
      } catch (error) {
        console.error('Error loading beats:', error);
      }
    };
    fetchBeats();
  }, []);

  // Get cover images for the gallery with cache busting
  const getGalleryImages = () => {
    if (beats.length === 0) {
      // Fallback placeholder images
      return Array(9).fill('https://via.placeholder.com/300x300?text=🎵');
    }
    // Repeat beats to fill 9 slots if needed
    const images = [];
    for (let i = 0; i < 9; i++) {
      const beat = beats[i % beats.length];
      const filename = beat.cover_filename || beat.cover_url?.split('/').pop();
      const timestamp = beat.updated_at || beat.created_at || Date.now();
      images.push(`${API}/beats/cover/${filename}?t=${timestamp}`);
    }
    return images;
  };

  const galleryImages = getGalleryImages();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - EDM Ghost Style */}
      <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
        {/* Background Image - Fully Responsive */}
        <style>{`
          .hero-bg-responsive {
            background-image: url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/ui94vyj2_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2814%29.png');
            background-size: cover;
            background-repeat: no-repeat;
          }
          /* Móvil pequeño vertical (hasta 480px) */
          @media (max-width: 480px) {
            .hero-bg-responsive { background-position: 60% center; }
          }
          /* Móvil grande vertical (481px - 640px) */
          @media (min-width: 481px) and (max-width: 640px) {
            .hero-bg-responsive { background-position: 55% center; }
          }
          /* Tablet pequeña / móvil horizontal (641px - 850px) */
          @media (min-width: 641px) and (max-width: 850px) {
            .hero-bg-responsive { background-position: 50% center; }
          }
          /* iPad vertical / Tablet (851px - 1024px) */
          @media (min-width: 851px) and (max-width: 1024px) {
            .hero-bg-responsive { background-position: 45% center; }
          }
          /* iPad horizontal / Tablet horizontal (1025px - 1200px) */
          @media (min-width: 1025px) and (max-width: 1200px) {
            .hero-bg-responsive { background-position: 40% center; }
          }
          /* Desktop pequeño (1201px - 1400px) */
          @media (min-width: 1201px) and (max-width: 1400px) {
            .hero-bg-responsive { background-position: center center; }
          }
          /* Desktop mediano (1401px - 1600px) */
          @media (min-width: 1401px) and (max-width: 1600px) {
            .hero-bg-responsive { background-position: center center; }
          }
          /* Desktop grande (más de 1600px) */
          @media (min-width: 1601px) {
            .hero-bg-responsive { background-position: center center; }
          }
        `}</style>
        <div className="absolute inset-0 hero-bg-responsive" />
        
        {/* Gradient Overlay - Left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        
        {/* Extra overlay for smaller screens to ensure text readability */}
        <div className="absolute inset-0 bg-black/20 lg:bg-transparent" />
        
        {/* Bottom Fade - Smooth transition to next black section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
        <div className="max-w-[1600px] mx-auto relative z-10 w-full px-8 lg:px-20">
          <div className="max-w-2xl">
            {/* Subtitle */}
            <p className="text-gray-400 text-lg md:text-xl mb-4 font-light tracking-wide">
              Vive la experiencia de ser uno de los grandes de la industria
            </p>
            
            {/* Main Title */}
            <h1 
              className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-12"
              style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}
            >
              HØME.
            </h1>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <Link 
                ref={conocenosRef}
                to="/nosotros"
                className={`group relative text-white text-sm font-medium tracking-widest uppercase ${isConocenosAnimating ? 'scale-105' : ''} transition-transform duration-300`}
              >
                <span className="relative z-10">CONÓCENOS</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${isConocenosAnimating ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              
              <Link 
                ref={beatPersonalizadoRef}
                to="/contacto"
                className={`group relative text-white text-sm font-medium tracking-widest uppercase border px-6 py-3 rounded-sm transition-all duration-300 hover:border-white hover:border-2 ${isBeatPersonalizadoAnimating ? 'border-white border-2' : 'border-white/30'}`}
              >
                <span>QUIERO UN BEAT PERSONALIZADO</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beats - BeatStars Style */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center min-h-[600px]">
          {/* Left Side - Text Content */}
          <div className="w-full lg:w-1/2 px-8 lg:px-32 xl:px-40 mb-12 lg:mb-0">
            <div className="max-w-[1600px] lg:max-w-none">
              <div className="space-y-6 max-w-2xl">
                <span className="text-gray-400 text-sm tracking-widest font-medium">
                  ESTO ES HOME.
                </span>
                
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}>
                  TU PROXIMO HIT ESTA AQUÍ.
                </h2>
                
                <p className="text-gray-400 text-lg max-w-md">
                  Descubre dentro del catálogo el beat perfecto para tu canción.
                </p>
                
                <Link 
                  ref={explorarCatalogoRef}
                  to="/catalogo"
                  className={`group inline-flex items-center text-white text-base font-medium transition-all duration-300 hover:text-gray-300 ${isExplorarCatalogoAnimating ? 'scale-105' : ''}`}
                >
                  <span className={`transition-colors duration-300 ${isExplorarCatalogoAnimating ? 'text-white' : ''}`}>Explorar Catálogo</span>
                  <ArrowRight className={`w-4 h-4 ml-2 transition-all duration-300 group-hover:translate-x-1 ${isExplorarCatalogoAnimating ? 'translate-x-2 text-white' : ''}`} />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Side - Animated Gallery */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[600px] overflow-hidden">
              {/* Gradient overlays for smooth edges */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
              
              <div className="flex gap-4 h-full">
                {/* Column 1 - Scrolls Down */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-down flex flex-col gap-4">
                    {[...galleryImages.slice(0, 3), ...galleryImages.slice(0, 3)].map((img, idx) => (
                      <div key={`col1-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 2 - Scrolls Up */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-up flex flex-col gap-4">
                    {[...galleryImages.slice(3, 6), ...galleryImages.slice(3, 6)].map((img, idx) => (
                      <div key={`col2-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 4}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 3 - Scrolls Down */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-down-slow flex flex-col gap-4">
                    {[...galleryImages.slice(6, 9), ...galleryImages.slice(6, 9)].map((img, idx) => (
                      <div key={`col3-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 7}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Value Props - Split Design with Carousel */}
      <ValuePropsSection />
    </div>);

};