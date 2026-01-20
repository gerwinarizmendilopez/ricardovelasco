import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevenir procesamiento múltiple (especialmente en StrictMode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extraer session_id del hash
        const hash = location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          toast.error('Error de autenticación: session_id no encontrado');
          navigate('/login', { replace: true });
          return;
        }

        const sessionId = sessionIdMatch[1];
        
        // Procesar la sesión con el backend
        const userData = await processGoogleSession(sessionId);
        
        toast.success(`¡Bienvenido, ${userData.name || userData.email}!`);
        
        // Redirigir al home o a donde el usuario intentaba ir
        navigate('/', { replace: true, state: { user: userData } });
        
      } catch (error) {
        console.error('Error procesando sesión de Google:', error);
        toast.error('Error al iniciar sesión con Google');
        navigate('/login', { replace: true });
      }
    };

    processSession();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Procesando autenticación...</p>
      </div>
    </div>
  );
};
