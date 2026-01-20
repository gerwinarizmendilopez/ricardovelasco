import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API}/auth/verify-reset-token/${token}`);
        setTokenValid(true);
        setUserEmail(response.data.email);
      } catch (error) {
        setTokenValid(false);
        toast.error(error.response?.data?.detail || 'Enlace inválido o expirado');
      } finally {
        setVerifying(false);
      }
    };
    
    verifyToken();
  }, [token]);

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const passwordValid = newPassword.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (!passwordValid) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: newPassword
      });
      
      // Guardar token y hacer login automático
      localStorage.setItem('home_token', response.data.access_token);
      
      setSuccess(true);
      toast.success('¡Contraseña actualizada! Iniciando sesión...');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.detail || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga mientras verifica token
  if (verifying) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Token inválido o no proporcionado
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Card className="bg-zinc-900 border-gray-800/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Enlace Inválido</h2>
                <p className="text-gray-400 mb-6">
                  Este enlace de restablecimiento es inválido o ha expirado.
                </p>
                <Link to="/login">
                  <Button className="bg-white hover:bg-gray-200 text-black">
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Card className="bg-zinc-900 border-gray-800/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Contraseña Actualizada!</h2>
                <p className="text-gray-400 mb-4">
                  Tu contraseña ha sido cambiada exitosamente.
                </p>
                <p className="text-sm text-gray-500">
                  Redirigiendo a la página principal...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Formulario de nueva contraseña
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al login
        </Link>

        <div className="max-w-md mx-auto">
          <Card className="bg-zinc-900 border-gray-800/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Nueva Contraseña</CardTitle>
              <p className="text-center text-gray-400 text-sm mt-2">
                Ingresa tu nueva contraseña para<br />
                <strong className="text-white">{userEmail}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 bg-black border-gray-800/20 text-white"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="text-red-400 text-xs mt-1">Mínimo 6 caracteres</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-black border-gray-800/20 text-white ${
                        confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : ''
                      } ${passwordsMatch && confirmPassword.length > 0 ? 'border-green-500' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                  )}
                  {passwordsMatch && confirmPassword.length > 0 && (
                    <p className="text-green-400 text-xs mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold"
                  disabled={loading || !passwordsMatch || !passwordValid}
                >
                  {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
