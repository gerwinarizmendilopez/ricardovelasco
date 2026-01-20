import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';

// Lista de países con código ISO para las banderas SVG
const countries = [
  { code: 'MX', name: 'México', dialCode: '+52' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'ES', name: 'España', dialCode: '+34' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'PE', name: 'Perú', dialCode: '+51' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502' },
  { code: 'CU', name: 'Cuba', dialCode: '+53' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1809' },
  { code: 'HN', name: 'Honduras', dialCode: '+504' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'PA', name: 'Panamá', dialCode: '+507' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1787' },
  { code: 'BR', name: 'Brasil', dialCode: '+55' },
  { code: 'CA', name: 'Canadá', dialCode: '+1' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44' },
  { code: 'FR', name: 'Francia', dialCode: '+33' },
  { code: 'DE', name: 'Alemania', dialCode: '+49' },
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'JP', name: 'Japón', dialCode: '+81' },
  { code: 'KR', name: 'Corea del Sur', dialCode: '+82' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'NZ', name: 'Nueva Zelanda', dialCode: '+64' },
  { code: 'ZA', name: 'Sudáfrica', dialCode: '+27' },
  { code: 'EG', name: 'Egipto', dialCode: '+20' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'KE', name: 'Kenia', dialCode: '+254' },
  { code: 'MA', name: 'Marruecos', dialCode: '+212' },
  { code: 'AE', name: 'Emiratos Árabes', dialCode: '+971' },
  { code: 'SA', name: 'Arabia Saudita', dialCode: '+966' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'TR', name: 'Turquía', dialCode: '+90' },
  { code: 'RU', name: 'Rusia', dialCode: '+7' },
  { code: 'PL', name: 'Polonia', dialCode: '+48' },
  { code: 'NL', name: 'Países Bajos', dialCode: '+31' },
  { code: 'BE', name: 'Bélgica', dialCode: '+32' },
  { code: 'SE', name: 'Suecia', dialCode: '+46' },
  { code: 'NO', name: 'Noruega', dialCode: '+47' },
  { code: 'DK', name: 'Dinamarca', dialCode: '+45' },
  { code: 'FI', name: 'Finlandia', dialCode: '+358' },
  { code: 'CH', name: 'Suiza', dialCode: '+41' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'GR', name: 'Grecia', dialCode: '+30' },
  { code: 'IE', name: 'Irlanda', dialCode: '+353' },
  { code: 'PH', name: 'Filipinas', dialCode: '+63' },
  { code: 'TH', name: 'Tailandia', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'MY', name: 'Malasia', dialCode: '+60' },
  { code: 'SG', name: 'Singapur', dialCode: '+65' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
];

// Componente para renderizar la bandera SVG
const CountryFlag = ({ countryCode, className = '' }) => {
  const FlagComponent = Flags[countryCode];
  if (!FlagComponent) {
    // Fallback si no existe la bandera
    return <span className={`inline-block ${className}`}>{countryCode}</span>;
  }
  return <FlagComponent className={className} />;
};

export const PhoneInput = ({ 
  value, 
  onChange, 
  selectedCountry, 
  onCountryChange,
  placeholder = 'Número de teléfono',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtrar países por búsqueda
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus en búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handlePhoneChange = (e) => {
    // Solo permitir números
    const value = e.target.value.replace(/\D/g, '');
    onChange(value);
  };

  return (
    <div className={`flex items-stretch ${className}`}>
      {/* Selector de país */}
      <div className="relative flex" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 bg-black/50 border border-white/30 border-r-0 rounded-l-md text-white hover:bg-black/70 transition-colors min-w-[110px] justify-between h-[42px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CountryFlag countryCode={selectedCountry.code} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
          <span className="text-sm text-gray-300">{selectedCountry.dialCode}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-zinc-900 border border-gray-800/20 rounded-md shadow-xl z-50 max-h-80 overflow-hidden">
            {/* Buscador */}
            <div className="p-2 border-b border-gray-800/20">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar país..."
                  className="w-full pl-8 pr-3 py-2 bg-black border border-gray-800/20 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>
            
            {/* Lista de países */}
            <div className="overflow-y-auto max-h-60">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left ${
                      selectedCountry.code === country.code && selectedCountry.dialCode === country.dialCode ? 'bg-zinc-800' : ''
                    }`}
                  >
                    <CountryFlag countryCode={country.code} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
                    <span className="text-white text-sm flex-1 truncate">{country.name}</span>
                    <span className="text-gray-400 text-sm">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                  No se encontraron países
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input de teléfono */}
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex-1 px-4 bg-black/50 border border-white/30 rounded-r-md text-white placeholder-gray-500 focus:outline-none focus:border-white/60 h-[42px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

// Exportar lista de países para uso en otros componentes
export const countryList = countries;

// Función helper para obtener país por código
export const getCountryByCode = (code) => {
  return countries.find(c => c.code === code) || countries[0];
};

// Función helper para obtener país por dialCode
export const getCountryByDialCode = (dialCode) => {
  // Normalizar el dialCode (quitar espacios y asegurar que tenga +)
  const normalizedDialCode = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return countries.find(c => c.dialCode === normalizedDialCode) || countries[0];
};

// País por defecto (México)
export const defaultCountry = countries[0];

// Exportar componente de bandera para uso externo
export { CountryFlag };
