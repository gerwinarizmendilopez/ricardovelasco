import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Instagram, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" 
                  alt="HØME Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">HØME</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Beats profesionales listos para llevar tu música al siguiente nivel.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/hamster25567" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/licencias" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Licencias
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terminos" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/reembolso" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <a href="mailto:home.recordsinfo@gmail.com" className="text-gray-400 hover:text-white text-sm flex items-center transition-colors">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-all">home.recordsinfo@gmail.com</span>
              </a>
              <p className="text-gray-400 text-sm">
                Respuesta en 24-48 horas
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2025 HØME. Todos los derechos reservados. Hecho para artistas que quieren ganar.
          </p>
        </div>
      </div>
    </footer>
  );
};