import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Music, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_a3ulkvg';
const EMAILJS_TEMPLATE_ID = 'template_c30a6zw';
const EMAILJS_PUBLIC_KEY = 'adHDV687KKQGvu6MU';

const generos = [
  "Trap",
  "Reggaeton",
  "Hip Hop",
  "R&B",
  "Pop",
  "Latin Urban",
  "Drill",
  "Afrobeat",
  "House",
  "Electrónica",
  "Corridos Tumbados",
  "Regional Mexicano",
  "Otro"
];

export const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    propuesta: '',
    genero: '',
    detalles: '',
    referencias: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Preparar datos para EmailJS
      const templateParams = {
        from_name: formData.nombre,
        from_email: formData.email,
        propuesta: formData.propuesta,
        genero: formData.genero,
        detalles: formData.detalles,
        referencias: formData.referencias
      };

      // Enviar email con EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto bg-white/20 rounded-full animate-ping" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ¡GRACIAS!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Nos pondremos muy pronto en contacto contigo.
          </p>
          
          <p className="text-gray-500 mb-12">
            Revisa tu bandeja de entrada en las próximas 24-48 horas.
          </p>
          
          <Link to="/">
            <Button className="bg-white hover:bg-gray-200 text-black px-8 py-6 text-lg">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image with blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://customer-assets.emergentagent.com/job_pagina-archivos/artifacts/q2wzsbnc_headphones-black-wall.jpg')`,
            filter: 'blur(2px)',
            transform: 'scale(1.02)'
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/85" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Music className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              BEAT PERSONALIZADO
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Crea el sonido perfecto para tu proyecto. Cuéntanos tu visión y nosotros la hacemos realidad.
            </p>
          </div>
          
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">100% Original</h3>
              <p className="text-gray-500 text-sm">Beat único creado exclusivamente para ti</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">24-48 Horas</h3>
              <p className="text-gray-500 text-sm">Respuesta garantizada en ese plazo</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <Send className="w-8 h-8 text-white mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Precio Variable</h3>
              <p className="text-gray-500 text-sm">Cotización según tu proyecto</p>
            </div>
          </div>
          
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-gray-800/20 to-gray-400/10 border border-gray-800/30 rounded-xl p-6 mb-12">
            <h3 className="text-white font-bold text-lg mb-3">📋 INFORMACIÓN IMPORTANTE</h3>
            <p className="text-gray-300 leading-relaxed">
              En el siguiente formulario llenarás la información de tu proyecto. 
              <span className="text-white font-medium"> Los costos varían dependiendo de la requisición del cliente</span>. 
              Una vez enviada tu propuesta, nos pondremos en contacto contigo dentro de un plazo de 
              <span className="text-white400 font-bold"> 24-48 horas</span>.
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            
            {/* Propuesta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Propuesta - ¿Qué quieres hacer? *
              </label>
              <input
                type="text"
                name="propuesta"
                value={formData.propuesta}
                onChange={handleChange}
                required
                placeholder="Ej: Un tema para mi próximo álbum, un sencillo comercial..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            
            {/* Género */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Género Musical *
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona un género</option>
                {generos.map((genero) => (
                  <option key={genero} value={genero}>{genero}</option>
                ))}
              </select>
            </div>
            
            {/* Detalles */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Detalles del Proyecto *
              </label>
              <p className="text-gray-500 text-sm mb-2">
                Añade qué quieres que lleve tu canción de forma muy detallada. Así podremos darte un beat de calidad.
              </p>
              <textarea
                name="detalles"
                value={formData.detalles}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe el vibe que buscas, el BPM aproximado, instrumentos que te gustaría escuchar, el mood general, si es algo más melódico o agresivo, etc..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
              />
            </div>
            
            {/* Referencias */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Referencias - 3 Canciones *
              </label>
              <p className="text-gray-500 text-sm mb-2">
                Comparte 3 canciones que sirvan de referencia para tu propuesta (nombres o links de Spotify/YouTube).
              </p>
              <textarea
                name="referencias"
                value={formData.referencias}
                onChange={handleChange}
                required
                rows={4}
                placeholder="1. Bad Bunny - Tití Me Preguntó&#10;2. Travis Scott - SICKO MODE&#10;3. Peso Pluma - Ella Baila Sola"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-gray-800/30 border border-gray-400 text-white400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-gray-200 text-black py-6 text-lg font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Solicitud
                  </span>
                )}
              </Button>
            </div>
            
            <p className="text-center text-gray-500 text-sm">
              Al enviar este formulario, aceptas que nos pongamos en contacto contigo por email.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};
