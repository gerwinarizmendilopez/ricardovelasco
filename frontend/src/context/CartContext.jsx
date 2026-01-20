import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const syncingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // Función para guardar carrito en el backend
  const saveCartToBackend = useCallback(async (items, email) => {
    if (!email || syncingRef.current) return;
    
    try {
      await axios.post(`${API}/cart/save`, {
        user_email: email,
        items: items
      });
    } catch (error) {
      console.error('Error guardando carrito en backend:', error);
    }
  }, []);

  // Función para cargar carrito del backend
  const loadCartFromBackend = useCallback(async (email) => {
    if (!email) return [];
    
    try {
      const response = await axios.get(`${API}/cart/${encodeURIComponent(email)}`);
      return response.data.items || [];
    } catch (error) {
      console.error('Error cargando carrito del backend:', error);
      return [];
    }
  }, []);

  // Función para limpiar carrito en backend
  const clearCartInBackend = useCallback(async (email) => {
    if (!email) return;
    
    try {
      await axios.delete(`${API}/cart/${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error limpiando carrito en backend:', error);
    }
  }, []);

  // Función para sincronizar cuando el usuario hace login
  const syncCartOnLogin = useCallback(async (email) => {
    if (!email || syncingRef.current) return;
    
    syncingRef.current = true;
    setUserEmail(email);
    
    try {
      // Obtener carrito local actual
      const localCart = JSON.parse(localStorage.getItem('home_cart') || '[]');
      
      // Obtener carrito del backend
      const backendCart = await loadCartFromBackend(email);
      
      // Combinar carritos (local + backend, sin duplicados)
      const combinedItems = [...backendCart];
      
      for (const localItem of localCart) {
        const exists = combinedItems.some(
          item => item.beat_id === localItem.beat_id && item.license_type === localItem.license_type
        );
        if (!exists) {
          combinedItems.push(localItem);
        }
      }
      
      // Actualizar estado y backend
      setCartItems(combinedItems);
      
      // Guardar carrito combinado en backend
      if (combinedItems.length > 0) {
        await saveCartToBackend(combinedItems, email);
      }
      
      // Limpiar localStorage (ahora el carrito está en el backend)
      localStorage.removeItem('home_cart');
      
    } catch (error) {
      console.error('Error sincronizando carrito:', error);
    } finally {
      syncingRef.current = false;
    }
  }, [loadCartFromBackend, saveCartToBackend]);

  // Función para manejar logout
  const handleLogout = useCallback(() => {
    setUserEmail(null);
    setCartItems([]);
    localStorage.removeItem('home_cart');
  }, []);

  // Cargar carrito inicial (solo localStorage para usuarios no logueados)
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    
    const savedCart = localStorage.getItem('home_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    setLoading(false);
    initialLoadDoneRef.current = true;
  }, []);

  // Guardar carrito cuando cambie
  useEffect(() => {
    if (loading || !initialLoadDoneRef.current) return;
    
    if (userEmail) {
      // Usuario logueado: guardar en backend
      saveCartToBackend(cartItems, userEmail);
    } else {
      // Usuario no logueado: guardar en localStorage
      localStorage.setItem('home_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, userEmail, loading, saveCartToBackend]);

  const addToCart = useCallback((beat, licenseType) => {
    const price = beat.prices[licenseType];
    
    const newItem = {
      beat_id: beat.id,
      beat_name: beat.name,
      cover_image: beat.coverImage,
      license_type: licenseType,
      price: price
    };

    setCartItems(prevItems => {
      const exists = prevItems.some(
        item => item.beat_id === beat.id && item.license_type === licenseType
      );
      
      if (exists) {
        toast.info('Este beat ya está en tu carrito con esta licencia');
        return prevItems;
      }
      
      toast.success(`"${beat.name}" agregado al carrito`, {
        description: `Licencia ${licenseType} - $${price}`
      });
      
      return [...prevItems, newItem];
    });
  }, []);

  const removeFromCart = useCallback(async (beatId, licenseType) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.beat_id === beatId && item.license_type === licenseType))
    );
    
    // También eliminar del backend si hay usuario logueado
    if (userEmail) {
      try {
        await axios.delete(`${API}/cart/${encodeURIComponent(userEmail)}/item/${beatId}/${licenseType}`);
      } catch (error) {
        console.error('Error eliminando item del backend:', error);
      }
    }
    
    toast.success('Item eliminado del carrito');
  }, [userEmail]);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('home_cart');
    
    // También limpiar en backend si hay usuario logueado
    if (userEmail) {
      await clearCartInBackend(userEmail);
    }
  }, [userEmail, clearCartInBackend]);

  const isInCart = useCallback((beatId, licenseType) => {
    return cartItems.some(
      item => item.beat_id === beatId && item.license_type === licenseType
    );
  }, [cartItems]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        userEmail,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        syncCartOnLogin,
        handleLogout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
