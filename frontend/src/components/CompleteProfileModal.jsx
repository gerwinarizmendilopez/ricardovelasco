import React, { useState } from 'react';
import { User, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { PhoneInput, defaultCountry } from './PhoneInput';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CompleteProfileModal = ({ isOpen, onClose, onSuccess, userEmail }) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneConfirm, setPhoneConfirm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [loading, setLoading] = useState(false);

  const phonesMatch = phone === phoneConfirm && phone.length >= 10;
  const usernameValid = username.length >= 3 && username.length <= 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usernameValid) {
      toast.error('El nombre de usuario debe tener entre 3 y 20 caracteres');
      return;
    }
    
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
      const token = localStorage.getItem('home_token');
      await axios.post(`${API}/auth/complete-profile`, {
        username: username,
        phone: phone,
        phone_country_code: selectedCountry.dialCode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('¡Perfil completado exitosamente!');
      onSuccess(username);
    } catch (error) {
      console.error('Error completando perfil:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/70 backdrop-blur-sm border border-white/30 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Completa tu Perfil</h2>
              <p className="text-gray-300 text-sm mt-1">
                Un paso más para comenzar
              </p>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="bg-black/50 border border-white/20 rounded-lg p-4 mb-6">
            <p className="text-gray-200 text-sm leading-relaxed">
              Para poder usar la plataforma, necesitas crear tu nombre de usuario 
              y registrar tu número de teléfono. Esto nos ayuda a mantener tu cuenta segura.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-white">Nombre de Usuario</Label>
              <p className="text-xs text-gray-400 mb-2">Este nombre será visible en la plataforma</p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="TuNombreDeUsuario"
                  maxLength={20}
                  className="pl-10 bg-black/50 border-white/30 text-white h-[42px] placeholder:text-gray-500"
                />
              </div>
              {username.length > 0 && username.length < 3 && (
                <p className="text-red-400 text-xs mt-1">Mínimo 3 caracteres</p>
              )}
              {usernameValid && (
                <p className="text-green-400 text-xs mt-1 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Nombre válido
                </p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-white">Número de Teléfono</Label>
              <p className="text-xs text-gray-400 mb-2">Para recuperar tu cuenta si olvidas tu contraseña</p>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                placeholder="Número de teléfono"
              />
            </div>
            
            {/* Phone Confirm */}
            <div>
              <Label htmlFor="phoneConfirm" className="text-white">Confirmar Número de Teléfono</Label>
              <p className="text-xs text-gray-400 mb-2">Escríbelo nuevamente para verificar</p>
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
            
            <Button
              type="submit"
              size="lg"
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold mt-4"
              disabled={loading || !phonesMatch || !usernameValid}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Completar Perfil
                </span>
              )}
            </Button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-center text-gray-400 text-xs">
            Tu información está segura y solo se usa para verificar tu identidad.
          </p>
        </div>
      </div>
    </div>
  );
};
