import React, { useState } from 'react';
import { X, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { PhoneInput, defaultCountry } from './PhoneInput';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PhoneRequiredModal = ({ isOpen, onClose, onSuccess, userEmail }) => {
  const [phone, setPhone] = useState('');
  const [phoneConfirm, setPhoneConfirm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [loading, setLoading] = useState(false);

  const phonesMatch = phone === phoneConfirm && phone.length >= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      await axios.post(`${API}/auth/update-phone`, {
        phone: phone,
        phone_country_code: selectedCountry.dialCode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Número de teléfono guardado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error guardando teléfono:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el teléfono');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-gray-800/30 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Actualización Importante</h2>
              <p className="text-gray-400 text-sm mt-1">
                Para mejorar la seguridad de tu cuenta
              </p>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="bg-zinc-800/50 border border-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Hemos implementado un nuevo sistema de recuperación de contraseña más seguro. 
              Ahora necesitas registrar tu número de teléfono para poder recuperar tu cuenta 
              en caso de que olvides tu contraseña.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-white">Número de Teléfono</Label>
              <p className="text-xs text-gray-500 mb-2">Selecciona tu país y escribe tu número</p>
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
              <p className="text-xs text-gray-500 mb-2">Escríbelo nuevamente para verificar</p>
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
              disabled={loading || !phonesMatch}
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
                  <Phone className="w-5 h-5 mr-2" />
                  Guardar Número de Teléfono
                </span>
              )}
            </Button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-center text-gray-500 text-xs">
            Tu número solo se usará para verificar tu identidad al recuperar contraseña.
            Nunca compartiremos tu información.
          </p>
        </div>
      </div>
    </div>
  );
};
