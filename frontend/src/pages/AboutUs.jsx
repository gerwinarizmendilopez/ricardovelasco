import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowRight, X } from 'lucide-react';
import { useMobileScrollAnimation } from '../hooks/useMobileScrollAnimation';

// Team/Artists data - Solo 3 miembros
const artists = [
  {
    id: 1,
    name: "RICARDO VELASCO",
    role: "Producer & Song Writer",
    image: "https://customer-assets.emergentagent.com/job_frontend-backend-fix-12/artifacts/xodiax8y_image.png",
    description: "Beatmaker amante de música Indie. Ha trabajado con diversos géneros y su visión ha sido fundamental para establecer el sonido característico de HØME Records.",
    socials: {
      instagram: "https://www.instagram.com/richardonthebeat?igsh=MWF4bmgwejJtdjZ1MQ%3D%3D&utm_source=qr"
    }
  },
  {
    id: 2,
    name: "GERWIN ARIZMENDI",
    role: "Producer & Sound Designer",
    image: "https://customer-assets.emergentagent.com/job_frontend-backend-fix-12/artifacts/6swo5jil_image.png",
    description: "Diseñador de sonido, Beatmaker y Reggaetonero. Su atención al detalle y conocimiento técnico garantizan la más alta calidad en cada producción.",
    socials: {
      instagram: "https://www.instagram.com/hamster25567?igsh=NXRvaTZ4ZWNjMjh6&utm_source=qr"
    }
  },
  {
    id: 3,
    name: "JUAN CAMPOS",
    role: "Producer & Composer",
    image: "https://customer-assets.emergentagent.com/job_frontend-backend-fix-12/artifacts/vgsdryck_image.png",
    description: "Compositor versátil con un estilo único que fusiona lo clásico con lo moderno. Su creatividad y capacidad de adaptación a diferentes géneros lo convierten en una pieza clave del equipo.",
    socials: {
      instagram: "https://www.instagram.com/juanitopesadilla?igsh=cWszcWpnYjc1NG5i&utm_source=qr"
    }
  }
];

// Valores data para el carrusel
const valoresData = [
  {
    title: "Calidad",
    description: "Cada beat pasa por un riguroso proceso de producción, mezcla y masterización para garantizar el mejor sonido."
  },
  {
    title: "Originalidad", 
    description: "Creamos sonidos únicos que te ayudarán a destacar. Nada de loops genéricos ni beats repetitivos."
  },
  {
    title: "Compromiso",
    description: "Tu éxito es nuestro éxito. Ofrecemos soporte continuo y nos aseguramos de que tengas todo lo que necesitas."
  }
];

export const AboutUs = () => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [activeValueIndex, setActiveValueIndex] = useState(0);
  const [isValueAnimating, setIsValueAnimating] = useState(false);
  
  // Hook para animación en móvil del link "Explorar Catálogo"
  const { ref: explorarRef, isAnimating: isExplorarAnimating } = useMobileScrollAnimation(1000);

  // Auto-rotate valores carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsValueAnimating(true);
      setTimeout(() => {
        setActiveValueIndex((prev) => (prev + 1) % valoresData.length);
        setIsValueAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleValueBarClick = useCallback((index) => {
    if (index === activeValueIndex) return;
    setIsValueAnimating(true);
    setTimeout(() => {
      setActiveValueIndex(index);
      setIsValueAnimating(false);
    }, 300);
  }, [activeValueIndex]);

  const handleArtistClick = (artist) => {
    if (selectedArtist?.id === artist.id) {
      setSelectedArtist(null);
    } else {
      setSelectedArtist(artist);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        {/* Background GIF with zoom */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://customer-assets.emergentagent.com/job_frontend-backend-fix-12/artifacts/rgjjgfto_A_cinematic_blackandwhite_202601161246.gif')`,
            backgroundSize: '120%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1.15)'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 md:px-4 max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-6 md:mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" 
              alt="HØME Logo"
              className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 opacity-90"
            />
          </div>
          
          {/* Main Text - OVO Style */}
          <h1 className="text-base md:text-xl lg:text-2xl font-light tracking-wide md:tracking-widest text-white/90 leading-relaxed mb-6 md:mb-8 uppercase px-2">
            HØME Records es un sello discográfico fundado por productores apasionados por crear beats que definen carreras.
          </h1>
          
          <p className="text-gray-400 text-xs md:text-sm tracking-wider uppercase">
            México • EST. 2025
          </p>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-2 md:py-4 bg-black overflow-hidden">
        <div className="space-y-0">
          {/* Row 1 - Moving Left */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee-left flex whitespace-nowrap">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-light text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-bold text-white mx-2 md:mx-3 tracking-normal italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-extrabold text-white mx-2 md:mx-3 tracking-tighter" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                </div>
              ))}
            </div>
            <div className="animate-marquee-left flex whitespace-nowrap" aria-hidden="true">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-light text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-bold text-white mx-2 md:mx-3 tracking-normal italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-extrabold text-white mx-2 md:mx-3 tracking-tighter" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Moving Right */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee-right flex whitespace-nowrap">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-medium text-white mx-2 md:mx-3 tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-normal" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-thin text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-semibold text-white mx-2 md:mx-3 italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                </div>
              ))}
            </div>
            <div className="animate-marquee-right flex whitespace-nowrap" aria-hidden="true">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-medium text-white mx-2 md:mx-3 tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-normal" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-thin text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-semibold text-white mx-2 md:mx-3 italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 - Moving Left Slow */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee-left-slow flex whitespace-nowrap">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-bold text-white mx-2 md:mx-3 tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-normal text-white mx-2 md:mx-3 italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-extralight text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                </div>
              ))}
            </div>
            <div className="animate-marquee-left-slow flex whitespace-nowrap" aria-hidden="true">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex">
                  <span className="text-2xl md:text-5xl font-bold text-white mx-2 md:mx-3 tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-normal text-white mx-2 md:mx-3 italic" style={{ fontFamily: "Georgia, serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-black text-white mx-2 md:mx-3 tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                  <span className="text-2xl md:text-5xl font-extralight text-white mx-2 md:mx-3 tracking-widest" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>HØME</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Artists Section - Click to expand */}
      <section className="py-20 px-4 bg-black" id="artists-section">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white">NOSOTROS</h3>
          </div>
          
          {/* Artists Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className={`relative aspect-[3/4] overflow-hidden cursor-pointer transition-all duration-500 ${
                  selectedArtist?.id === artist.id ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => handleArtistClick(artist)}
              >
                {/* Artist Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
                  style={{
                    backgroundImage: `url('${artist.image}')`,
                    filter: selectedArtist?.id === artist.id ? 'grayscale(0%) brightness(0.8)' : 'grayscale(100%) brightness(0.5)',
                    transform: selectedArtist?.id === artist.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Artist Name */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-6">
                  <h4 className="text-sm md:text-xl font-bold text-white tracking-wider">
                    {artist.name}
                  </h4>
                  <p className="text-white text-xs md:text-sm font-medium uppercase tracking-wider mt-1">
                    {artist.role}
                  </p>
                </div>
                
                {/* Red accent line when selected */}
                <div className={`absolute bottom-0 left-0 h-1 bg-white transition-all duration-500 ${
                  selectedArtist?.id === artist.id ? 'w-full' : 'w-0'
                }`} />
              </div>
            ))}
          </div>

          {/* Expanded Artist Info Panel */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            selectedArtist ? 'max-h-[800px] md:max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'
          }`}>
            {selectedArtist && (
              <div className="bg-black border border-gray-800/30 rounded-lg p-5 md:p-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  {/* Left - Photo (smaller on mobile) */}
                  <div className="w-2/3 mx-auto md:w-1/3 md:mx-0 flex-shrink-0">
                    <div 
                      className="aspect-square rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url('${selectedArtist.image}')` }}
                    />
                  </div>
                  
                  {/* Right - Info */}
                  <div className="flex-1 w-full">
                    {/* Close button */}
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div>
                        <h4 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                          {selectedArtist.name}
                        </h4>
                        <p className="text-white text-xs md:text-base font-medium uppercase tracking-wider">
                          {selectedArtist.role}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedArtist(null)}
                        className="text-gray-400 hover:text-white transition-colors p-1 md:p-2"
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
                      {selectedArtist.description}
                    </p>
                    
                    {/* Social Icons - Solo Instagram */}
                    <div className="flex gap-4">
                      <a 
                        href={selectedArtist.socials.instagram} 
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">Instagram</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - GIF */}
            <div className="relative">
              <div 
                className="aspect-square bg-cover bg-center rounded-lg overflow-hidden"
                style={{
                  backgroundImage: `url('https://customer-assets.emergentagent.com/job_frontend-backend-fix-12/artifacts/p1qw5mq4_A_cinematic_twilight_202601161304.gif')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-gray-200 rounded-lg" />
            </div>
            
            {/* Right - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Objetivo
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                En HØME Records, creemos que cada artista merece acceso a producción de calidad mundial. 
                Nuestro objetivo es democratizar la música, ofreciendo beats profesionales que ayuden 
                a artistas emergentes a alcanzar su máximo potencial.
              </p>
              <p className="text-gray-300 leading-relaxed mb-8">
                Cada beat que producimos está creado con pasión, dedicación y años de experiencia 
                en la industria musical. No solo vendemos beats, construimos carreras.
              </p>
              
              <Link 
                ref={explorarRef}
                to="/catalogo"
                className={`group inline-flex items-center gap-2 text-white font-medium transition-all duration-300 hover:scale-105 ${isExplorarAnimating ? 'scale-105' : ''}`}
              >
                <span className={`transition-colors duration-300 ${isExplorarAnimating ? 'text-white' : 'group-hover:text-white'}`}>Explorar Catálogo</span>
                <ArrowRight className={`w-5 h-5 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white ${isExplorarAnimating ? 'translate-x-2 text-white' : ''}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Carrusel Style */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-16">
            Nuestros Valores
          </h2>
          
          {/* Carrusel Content */}
          <div className="relative min-h-[200px] flex items-center justify-center overflow-hidden">
            <div 
              className={`text-center transition-all duration-300 ease-in-out ${
                isValueAnimating 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                {valoresData[activeValueIndex].title}
              </h3>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {valoresData[activeValueIndex].description}
              </p>
            </div>
          </div>
          
          {/* Navigation Bars */}
          <div className="flex justify-center items-center gap-4 mt-12">
            {valoresData.map((_, index) => (
              <button
                key={index}
                onClick={() => handleValueBarClick(index)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeValueIndex
                    ? 'bg-white w-16'
                    : 'bg-gray-600 w-12 hover:bg-gray-400'
                }`}
                aria-label={`Ir a valor ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
