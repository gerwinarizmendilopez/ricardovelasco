import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, ArrowLeft, Eye, EyeOff, Phone, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { PhoneInput, defaultCountry, getCountryByDialCode } from '../components/PhoneInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Estados para el teléfono en registro
  const [phone, setPhone] = useState('');
  const [phoneConfirm, setPhoneConfirm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  
  // Estados para forgot password con verificación por teléfono
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: phone verification, 3: new password
  const [phoneHint, setPhoneHint] = useState('');
  const [storedDialCode, setStoredDialCode] = useState('');
  const [verifyPhone, setVerifyPhone] = useState('');
  const [verifyCountry, setVerifyCountry] = useState(defaultCountry);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [userEmailForReset, setUserEmailForReset] = useState('');

  const { login, register, verifyEmail, resendVerification, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Validación de que los teléfonos coinciden
  const phonesMatch = phone === phoneConfirm && phone.length >= 10;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido de vuelta!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validar teléfonos
    if (!phonesMatch) {
      toast.error('Los números de teléfono no coinciden');
      return;
    }
    
    if (phone.length < 10) {
      toast.error('El número de teléfono debe tener al menos 10 dígitos');
      return;
    }
    
    setLoading(true);

    try {
      // Registrar con teléfono
      const response = await axios.post(`${API}/auth/register`, {
        email,
        password,
        phone: phone,
        phone_country_code: selectedCountry.dialCode
      });
      
      // Registro exitoso - login automático
      if (response.data.access_token) {
        localStorage.setItem('home_token', response.data.access_token);
        toast.success('¡Cuenta creada exitosamente!', {
          description: 'Iniciando sesión...'
        });
        // Redirigir al inicio
        setTimeout(() => {
          window.location.href = from;
        }, 1000);
      } else {
        toast.success('Cuenta creada exitosamente');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyEmail(registeredEmail, verificationCode);
      toast.success('Email verificado exitosamente');
      setShowVerification(false);
      setIsLogin(true);
      setEmail(registeredEmail);
    } catch (error) {
      console.error('Error verificando email:', error);
      toast.error(error.response?.data?.detail || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await resendVerification(registeredEmail);
      toast.success('Código reenviado', {
        description: 'Revisa tu email para el nuevo código.'
      });
    } catch (error) {
      toast.error('Error al reenviar código');
    }
  };

  // Paso 1: Verificar email para password reset
  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await axios.post(`${API}/auth/forgot-password-phone`, { email: forgotEmail });
      
      if (response.data.success) {
        setPhoneHint(response.data.phone_hint);
        setStoredDialCode(response.data.dial_code);
        setUserEmailForReset(forgotEmail);
        // Pre-seleccionar el país basado en el dial code guardado
        const country = getCountryByDialCode(response.data.dial_code);
        setVerifyCountry(country);
        setForgotStep(2);
      } else {
        toast.error(response.data.message || 'Email no encontrado');
      }
    } catch (error) {
      console.error('Error en forgot password:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar solicitud');
    } finally {
      setForgotLoading(false);
    }
  };

  // Paso 2: Verificar teléfono
  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await axios.post(`${API}/auth/verify-phone-reset`, {
        email: userEmailForReset,
        phone: verifyPhone,
        phone_country_code: verifyCountry.dialCode
      });
      
      if (response.data.success) {
        setForgotStep(3);
        toast.success('Teléfono verificado correctamente');
      } else {
        toast.error('El número de teléfono no coincide');
      }
    } catch (error) {
      console.error('Error verificando teléfono:', error);
      toast.error(error.response?.data?.detail || 'El número de teléfono no es correcto');
    } finally {
      setForgotLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handleForgotPasswordStep3 = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setForgotLoading(true);

    try {
      const response = await axios.post(`${API}/auth/reset-password-phone`, {
        email: userEmailForReset,
        new_password: newPassword
      });
      
      // Guardar token y hacer login automático
      localStorage.setItem('home_token', response.data.access_token);
      
      toast.success('¡Contraseña actualizada! Iniciando sesión...');
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      toast.error(error.response?.data?.detail || 'Error al cambiar contraseña');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail('');
    setPhoneHint('');
    setStoredDialCode('');
    setVerifyPhone('');
    setNewPassword('');
    setConfirmNewPassword('');
    setUserEmailForReset('');
  };

  // Pantalla de verificación de email
  if (showVerification) {
    return (
      <div 
        className="min-h-screen text-white pt-24 pb-20 flex items-center justify-center relative"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/fcv5ghgk_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2818%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="bg-black/70 backdrop-blur-sm border-gray-800/30">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Verifica tu Email</CardTitle>
              <p className="text-center text-gray-300 text-sm mt-2">
                Ingresa el código de 6 dígitos que enviamos a<br />
                <strong className="text-white">{registeredEmail}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div>
                  <Label htmlFor="code" className="text-white">Código de Verificación</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="bg-black/50 border-gray-700 text-white text-center text-2xl tracking-widest placeholder:text-gray-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-white hover:bg-gray-200"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verificando...' : 'Verificar Email'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-700 text-gray-300"
                  onClick={handleResendCode}
                >
                  Reenviar Código
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pantalla de olvidé mi contraseña
  if (showForgotPassword) {
    return (
      <div 
        className="min-h-screen text-white pt-24 pb-20 relative"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/fcv5ghgk_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2818%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={resetForgotPassword}
            className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al login
          </button>

          <div className="max-w-md mx-auto">
            <Card className="bg-black/70 backdrop-blur-sm border-gray-800/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-white">
                  {forgotStep === 1 && 'Recuperar Contraseña'}
                  {forgotStep === 2 && 'Verificar Teléfono'}
                  {forgotStep === 3 && 'Nueva Contraseña'}
                </CardTitle>
                {/* Indicador de pasos */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-1 rounded-full ${
                        forgotStep >= step ? 'bg-white' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {/* Paso 1: Ingresar email */}
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-6">
                    <p className="text-gray-300 text-sm text-center mb-4">
                      Ingresa tu email para verificar tu identidad.
                    </p>
                    <div>
                      <Label htmlFor="forgotEmail" className="text-white">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          id="forgotEmail"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="pl-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? 'Verificando...' : 'Continuar'}
                    </Button>
                  </form>
                )}

                {/* Paso 2: Verificar teléfono */}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotPasswordStep2} className="space-y-6">
                    <div className="bg-zinc-800/50 border border-gray-700 rounded-lg p-4 text-center">
                      <Phone className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-gray-300 text-sm">
                        Escribe el número de teléfono que termina en:
                      </p>
                      <p className="text-2xl font-bold text-white mt-2 tracking-wider">
                        {phoneHint}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="verifyPhone" className="text-white">Número de Teléfono</Label>
                      <PhoneInput
                        value={verifyPhone}
                        onChange={setVerifyPhone}
                        selectedCountry={verifyCountry}
                        onCountryChange={setVerifyCountry}
                        placeholder="Tu número completo"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold"
                      disabled={forgotLoading || verifyPhone.length < 10}
                    >
                      {forgotLoading ? 'Verificando...' : 'Verificar Teléfono'}
                    </Button>
                    
                    <button
                      type="button"
                      className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={() => setForgotStep(1)}
                    >
                      Usar otro email
                    </button>
                  </form>
                )}

                {/* Paso 3: Nueva contraseña */}
                {forgotStep === 3 && (
                  <form onSubmit={handleForgotPasswordStep3} className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-400 text-sm">
                        Identidad verificada correctamente
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword" className="text-white">Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
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
                      <Label htmlFor="confirmNewPassword" className="text-white">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className={`pl-10 pr-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 ${
                            confirmNewPassword.length > 0 && newPassword !== confirmNewPassword ? 'border-red-500' : ''
                          } ${newPassword === confirmNewPassword && confirmNewPassword.length > 0 ? 'border-green-500' : ''}`}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                        <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                      )}
                      {newPassword === confirmNewPassword && confirmNewPassword.length > 0 && (
                        <p className="text-green-400 text-xs mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Las contraseñas coinciden
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold"
                      disabled={forgotLoading || newPassword !== confirmNewPassword || newPassword.length < 6}
                    >
                      {forgotLoading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla principal de login/registro
  return (
    <div 
      className="min-h-screen text-white pt-24 pb-20 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/fcv5ghgk_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2818%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="max-w-md mx-auto">
          <Card className="bg-black/70 backdrop-blur-sm border-gray-800/30">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-white">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Campos de teléfono solo en registro */}
                {!isLogin && (
                  <>
                    <div>
                      <Label htmlFor="phone" className="text-white">Número de Teléfono</Label>
                      <p className="text-xs text-gray-400 mb-2">Para recuperar tu contraseña</p>
                      <PhoneInput
                        value={phone}
                        onChange={setPhone}
                        selectedCountry={selectedCountry}
                        onCountryChange={setSelectedCountry}
                        placeholder="Número de teléfono"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneConfirm" className="text-white">Confirmar Número de Teléfono</Label>
                      <PhoneInput
                        value={phoneConfirm}
                        onChange={setPhoneConfirm}
                        selectedCountry={selectedCountry}
                        onCountryChange={setSelectedCountry}
                        placeholder="Repite el número"
                      />
                      {phoneConfirm.length > 0 && !phonesMatch && (
                        <p className="text-red-400 text-xs mt-1">Los números no coinciden</p>
                      )}
                      {phonesMatch && phone.length >= 10 && (
                        <p className="text-green-400 text-xs mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Los números coinciden
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold"
                  disabled={loading || (!isLogin && !phonesMatch)}
                >
                  {loading ? 'Procesando...' : (
                    <>
                      {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                      {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black/70 text-gray-300">O continúa con</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-gray-700 text-white hover:bg-white/10"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setPhone('');
                      setPhoneConfirm('');
                    }}
                  >
                    {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
