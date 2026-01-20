import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth, setAuthCallbacks } from "./context/AuthContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CompleteProfileModal } from "./components/CompleteProfileModal";
import { Home } from "./pages/Home";
import { Catalogo } from "./pages/Catalogo";
import { BeatDetail } from "./pages/BeatDetail";
import { Licencias } from "./pages/Licencias";
import { Admin } from "./pages/Admin";
import { Cart } from "./pages/Cart";
import { Login } from "./pages/Login";
import { Cuenta } from "./pages/Cuenta";
import { PurchaseSuccess } from "./pages/PurchaseSuccess";
import { TerminosCondiciones } from "./pages/TerminosCondiciones";
import { PoliticaPrivacidad } from "./pages/PoliticaPrivacidad";
import { PoliticaReembolso } from "./pages/PoliticaReembolso";
import { AboutUs } from "./pages/AboutUs";
import { Contacto } from "./pages/Contacto";
import { ResetPassword } from "./pages/ResetPassword";
import { Historial } from "./pages/Historial";

// Componente para conectar Auth con Cart
function AuthCartConnector({ children }) {
  const { syncCartOnLogin, handleLogout } = useCart();
  
  useEffect(() => {
    setAuthCallbacks(syncCartOnLogin, handleLogout);
  }, [syncCartOnLogin, handleLogout]);
  
  return children;
}

// Componente que detecta session_id en el hash de la URL
// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function AppRouter() {
  const location = useLocation();
  const { needsProfile, user, updateProfileStatus } = useAuth();
  
  // Detectar session_id durante el render (NO en useEffect para evitar race conditions)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/beat/:id" element={<BeatDetail />} />
        <Route path="/licencias" element={<Licencias />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/reembolso" element={<PoliticaReembolso />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/historial" element={
          <ProtectedRoute>
            <Historial />
          </ProtectedRoute>
        } />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Footer />
      <GlobalAudioPlayer />
      
      {/* Modal para usuarios que necesitan completar su perfil (username + teléfono) */}
      <CompleteProfileModal 
        isOpen={needsProfile}
        onClose={() => {}} // No se puede cerrar sin completar perfil
        onSuccess={updateProfileStatus}
        userEmail={user?.email}
      />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AuthCartConnector>
              <AudioPlayerProvider>
                <AppRouter />
                <Toaster />
              </AudioPlayerProvider>
            </AuthCartConnector>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
