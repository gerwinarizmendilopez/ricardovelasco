import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ShoppingCart, Menu, X, LogOut, User, ChevronDown, Settings, History } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const scrollPositionRef = useRef(0);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para abrir el menú - guarda posición ANTES de abrir
  const openMobileMenu = () => {
    scrollPositionRef.current = window.scrollY;
    setMobileMenuOpen(true);
  };

  // Función para cerrar el menú
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Bloquear scroll cuando el menú móvil está abierto - useLayoutEffect para evitar parpadeo
  useLayoutEffect(() => {
    if (mobileMenuOpen) {
      // Aplicar inmediatamente para evitar salto visual
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Solo restaurar si había una posición guardada
      const savedPosition = scrollPositionRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (savedPosition > 0) {
        window.scrollTo(0, savedPosition);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  // Obtener nombre para mostrar (username o primera parte del email)
  const displayName = user?.username || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-lg border-b border-white/10' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex justify-between items-center h-16">
          {/* Logo - más a la izquierda */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/7mofy2kc_holaaaa.png" 
                alt="HØME Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation - responsive spacing for tablets and desktops */}
          <nav className="hidden lg:flex items-center justify-center flex-1 space-x-8 xl:space-x-12 2xl:space-x-16">
            <Link
              to="/"
              className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
              isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'}`
              }>
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
              isActive('/catalogo') ? 'text-white' : 'text-gray-300 hover:text-white'}`
              }>
              Catálogo
            </Link>
            <Link
              to="/licencias"
              className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
              isActive('/licencias') ? 'text-white' : 'text-gray-300 hover:text-white'}`
              }>
              Licencias
            </Link>
            <Link
              to="/nosotros"
              className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
              isActive('/nosotros') ? 'text-white' : 'text-gray-300 hover:text-white'}`
              }>
              Nosotros
            </Link>
            {/* Admin solo visible para administradores */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
                isActive('/admin') ? 'text-white' : 'text-yellow-500 hover:text-yellow-400'}`
                }>
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions - responsive for tablets */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
            <Link to="/cart">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-white hover:bg-white hover:text-white transition-colors relative text-xs xl:text-sm">
                <ShoppingCart className="w-4 h-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">Carrito</span> ({cartCount})
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                {/* User Button with Username */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium max-w-[100px] xl:max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-gray-800/30 rounded-lg shadow-xl overflow-hidden z-50">
                    <Link
                      to="/cuenta"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Cuenta</span>
                    </Link>
                    <Link
                      to="/historial"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <History className="w-4 h-4" />
                      <span>Historial</span>
                    </Link>
                    <div className="border-t border-gray-800/30"></div>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-white hover:bg-white hover:text-white text-xs xl:text-sm">
                  <User className="w-4 h-4 mr-1 xl:mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile/Tablet menu button - visible on md and below */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile/Tablet Navigation - Fullscreen overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 w-screen h-screen bg-black z-[100] flex flex-col items-center justify-center"
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
        >
          {/* Close button at top right */}
          <button
            className="absolute top-4 right-4 text-white p-2 z-[101]"
            onClick={closeMobileMenu}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Logo at top left */}
          <div className="absolute top-4 left-4">
            <Link to="/" onClick={closeMobileMenu}>
              <img 
                src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/7mofy2kc_holaaaa.png" 
                alt="HØME Logo" 
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="flex flex-col items-center space-y-8">
            <Link
              to="/"
              className={`text-2xl font-medium transition-colors ${
                isActive('/') ? 'text-white' : 'text-white hover:text-white'
              }`}
              onClick={closeMobileMenu}
            >
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className={`text-2xl font-medium transition-colors ${
                isActive('/catalogo') ? 'text-white' : 'text-white hover:text-white'
              }`}
              onClick={closeMobileMenu}
            >
              Catálogo
            </Link>
            <Link
              to="/licencias"
              className={`text-2xl font-medium transition-colors ${
                isActive('/licencias') ? 'text-white' : 'text-white hover:text-white'
              }`}
              onClick={closeMobileMenu}
            >
              Licencias
            </Link>
            <Link
              to="/nosotros"
              className={`text-2xl font-medium transition-colors ${
                isActive('/nosotros') ? 'text-white' : 'text-white hover:text-white'
              }`}
              onClick={closeMobileMenu}
            >
              Nosotros
            </Link>
            {/* Admin solo visible para administradores */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`text-2xl font-medium transition-colors ${
                  isActive('/admin') ? 'text-white' : 'text-white hover:text-white'
                }`}
                onClick={closeMobileMenu}
              >
                Admin
              </Link>
            )}
            
            {/* Divider */}
            <div className="w-16 h-px bg-white/50 my-4"></div>

            {/* Cart Button */}
            <Link to="/cart" onClick={closeMobileMenu}>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-200 text-white hover:bg-white hover:text-white px-8"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrito ({cartCount})
              </Button>
            </Link>

            {/* Login/User */}
            {user ? (
              <div className="flex flex-col items-center gap-4">
                {/* Username badge */}
                <div className="bg-white text-black px-4 py-2 rounded-md font-medium">
                  {displayName}
                </div>
                
                {/* Account link */}
                <Link to="/cuenta" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-800/20 text-gray-300 hover:bg-white hover:text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Mi Cuenta
                  </Button>
                </Link>
                
                {/* Historial link */}
                <Link to="/historial" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-800/20 text-gray-300 hover:bg-white hover:text-white"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Historial
                  </Button>
                </Link>
                
                {/* Logout */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={closeMobileMenu}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 text-white hover:bg-white hover:text-white px-8"
                >
                  <User className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>);

};
