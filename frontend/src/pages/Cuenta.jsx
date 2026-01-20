import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Lock, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PhoneInput, defaultCountry, getCountryByDialCode } from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Cuenta = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  
  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Email change
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data);
      setUsername(response.data.username || '');
      setPhone(response.data.phone || '');
      
      if (response.data.phone_country_code) {
        const country = getCountryByDialCode(response.data.phone_country_code);
        setSelectedCountry(country);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    
    if (phone.length < 10) {
      toast.error('El número de teléfono debe tener al menos 10 dígitos');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await axios.put(`${API}/auth/profile`, {
        username,
        phone,
        phone_country_code: selectedCountry.dialCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('¡Cambios guardados exitosamente!');
      
      // Refresh profile
      fetchProfile();
      
      // Force page refresh to update header after showing toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setSavingPassword(true);
    
    try {
      await axios.post(`${API}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('¡Contraseña actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Error al cambiar la contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast.error('Ingresa el nuevo email');
      return;
    }
    
    setSavingEmail(true);
    
    try {
      const response = await axios.post(`${API}/auth/change-email`, {
        new_email: newEmail,
        password: emailPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update token
      localStorage.setItem('home_token', response.data.access_token);
      
      toast.success('¡Email actualizado exitosamente!');
      
      // Refresh page to update everything
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error(error.response?.data?.detail || 'Error al cambiar el email');
    } finally {
      setSavingEmail(false);
    }
  };

  // Estilos comunes
  const cardStyle = "bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl mb-6";
  const inputStyle = "w-full px-4 h-[42px] bg-black/50 border border-white/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-white/60 transition-colors";
  const inputWithIconStyle = "w-full pl-10 pr-4 h-[42px] bg-black/50 border border-white/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-white/60 transition-colors";
  const inputWithIconRightStyle = "w-full pl-10 pr-10 h-[42px] bg-black/50 border border-white/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-white/60 transition-colors";
  const labelStyle = "block text-white font-medium mb-1";
  const subLabelStyle = "text-xs text-gray-400 mb-2";

  if (loading) {
    return (
      <div className="min-h-screen text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen text-white pt-24 pb-20 flex items-center justify-center">
        <div className={cardStyle + " max-w-md p-6"}>
          <p className="text-gray-300 mb-4 text-center">Debes iniciar sesión para ver tu cuenta</p>
          <Link to="/login">
            <Button className="w-full bg-white hover:bg-gray-200 text-black">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-20 relative overflow-hidden">
      {/* Fondo con GIF */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_mirror-project-9/artifacts/3q1dlevl_The_eyes_blink_202601171659.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(0.5px)',
          transform: 'scale(1.02)'
        }}
      ></div>
      
      {/* Overlay oscuro suave */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Contenido */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-white">Mi Cuenta</h1>

        {/* Profile Info */}
        <div className={cardStyle}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Información del Perfil
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className={labelStyle}>Nombre de Usuario</label>
              <p className={subLabelStyle}>Este nombre es visible en la plataforma</p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="TuNombreDeUsuario"
                  maxLength={20}
                  className={inputWithIconStyle}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelStyle}>Número de Teléfono</label>
              <p className={subLabelStyle}>Para recuperar tu cuenta</p>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                placeholder="Número de teléfono"
              />
            </div>

            {/* Email (read-only display) */}
            <div>
              <label className={labelStyle}>Email Actual</label>
              <div className="flex items-center gap-2 p-3 bg-black/50 border border-white/30 rounded-md">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-white">{profile?.email}</span>
                {profile?.auth_provider === 'google' && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-auto">Google</span>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-[42px]"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Change Password - Only for non-Google users */}
        {profile?.auth_provider !== 'google' && (
          <div className={cardStyle}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Cambiar Contraseña
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                {showPasswordSection ? 'Cancelar' : 'Cambiar'}
              </Button>
            </div>
            {showPasswordSection && (
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="currentPassword" className={labelStyle}>Contraseña Actual</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputWithIconRightStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className={labelStyle}>Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputWithIconRightStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="text-red-400 text-xs mt-1">Mínimo 6 caracteres</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelStyle}>Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputWithIconRightStyle} ${
                        confirmPassword.length > 0 && newPassword !== confirmPassword ? 'border-red-500' : ''
                      } ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'border-green-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                  )}
                  {newPassword === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-green-400 text-xs mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={savingPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-[42px]"
                >
                  {savingPassword ? 'Guardando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Change Email - Only for non-Google users */}
        {profile?.auth_provider !== 'google' && (
          <div className={cardStyle}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Cambiar Email
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailSection(!showEmailSection)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                {showEmailSection ? 'Cancelar' : 'Cambiar'}
              </Button>
            </div>
            {showEmailSection && (
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="newEmail" className={labelStyle}>Nuevo Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={inputWithIconStyle}
                      placeholder="nuevo@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emailPassword" className={labelStyle}>Confirma tu Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="emailPassword"
                      type={showEmailPassword ? 'text' : 'password'}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      className={inputWithIconRightStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showEmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleChangeEmail}
                  disabled={savingEmail || !newEmail || !emailPassword}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-[42px]"
                >
                  {savingEmail ? 'Guardando...' : 'Actualizar Email'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Google Account Notice */}
        {profile?.auth_provider === 'google' && (
          <div className={cardStyle}>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Cuenta de Google</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Tu cuenta está vinculada a Google. El email y la contraseña se administran desde tu cuenta de Google.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={logout}
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 h-[42px]"
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
