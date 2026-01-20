import { useEffect, useRef, useState } from 'react';

/**
 * Hook para animar elementos cuando entran en vista en dispositivos móviles
 * @param {number} duration - Duración de la animación en ms (default: 1000)
 * @param {number} delay - Delay antes de iniciar la animación en ms (default: 1000)
 * @returns {object} - { ref, isAnimating }
 */
export const useMobileScrollAnimation = (duration = 1000, delay = 1000) => {
  const ref = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Solo activar en dispositivos táctiles (móviles)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice || !ref.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Cuando el elemento entra en vista y no ha sido animado aún
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            // Esperar el delay antes de iniciar la animación
            setTimeout(() => {
              setIsAnimating(true);
              
              // Desactivar la animación después de la duración especificada
              setTimeout(() => {
                setIsAnimating(false);
              }, duration);
            }, delay);
          }
        });
      },
      {
        threshold: 0.5, // El elemento debe estar 50% visible
        rootMargin: '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [duration, delay]);

  // Reset cuando el componente se desmonta y vuelve a montar
  useEffect(() => {
    return () => {
      hasAnimated.current = false;
    };
  }, []);

  return { ref, isAnimating };
};

export default useMobileScrollAnimation;
