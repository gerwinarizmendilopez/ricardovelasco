import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Download, ChevronDown, ChevronUp, FileText, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const licenseNames = {
  basica: 'Básica',
  premium: 'Premium',
  exclusiva: 'Exclusiva'
};

const licenseColors = {
  basica: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  premium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  exclusiva: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

export const Historial = () => {
  const { user, token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPurchase, setExpandedPurchase] = useState(null);
  const [contractMenuOpen, setContractMenuOpen] = useState(null);
  const [downloadingContract, setDownloadingContract] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.email) return;
      
      try {
        const response = await axios.get(`${API}/payment/purchases/${encodeURIComponent(user.email)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(response.data.purchases || []);
      } catch (error) {
        console.error('Error cargando historial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user, token]);

  const toggleExpand = (purchaseId) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (beatId, fileType, licenseType, beatName) => {
    try {
      toast.loading('Descargando archivo...');
      
      const response = await axios.get(
        `${API}/payment/download/${beatId}/${fileType}?license_type=${licenseType}&buyer_email=${encodeURIComponent(user.email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Verificar si la respuesta es un error JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const error = JSON.parse(text);
        toast.dismiss();
        toast.error(error.detail || 'Error al descargar');
        return;
      }
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determinar extensión según tipo
      const ext = fileType === 'mp3' ? 'mp3' : fileType === 'wav' ? 'wav' : fileType === 'stems' ? 'zip' : 'pdf';
      const fileName = `${beatName || beatId}_${licenseType}.${ext}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Archivo descargado');
    } catch (error) {
      toast.dismiss();
      console.error('Error descargando archivo:', error);
      
      // Manejar error 404 específicamente
      if (error.response?.status === 404) {
        if (fileType === 'stems') {
          toast.error('Los stems de este beat aún no están disponibles');
        } else if (fileType === 'wav') {
          toast.error('El archivo WAV de este beat no está disponible');
        } else {
          toast.error('Archivo no encontrado');
        }
        return;
      }
      
      // Intentar leer el mensaje de error
      if (error.response?.data) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          toast.error(errorData.detail || 'Error al descargar el archivo');
        } catch {
          toast.error('Error al descargar el archivo');
        }
      } else {
        toast.error('Error al descargar el archivo');
      }
    }
  };

  const handleDownloadContract = async (beatId, licenseType, beatName, language) => {
    const key = `${beatId}_${language}`;
    setDownloadingContract(key);
    try {
      const response = await axios.get(
        `${API}/payment/contract/${licenseType}/${language}?buyer_email=${encodeURIComponent(user.email)}&beat_id=${beatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Verificar si es error JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const error = JSON.parse(text);
        toast.error(error.detail || 'Contrato no disponible');
        return;
      }
      
      const langName = language === 'es' ? 'ESP' : 'ENG';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_${licenseType}_${beatName}_${langName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Contrato en ${language === 'es' ? 'español' : 'inglés'} descargado`);
      setContractMenuOpen(null);
    } catch (error) {
      console.error('Error descargando contrato:', error);
      if (error.response?.status === 404) {
        toast.error(`Contrato en ${language === 'es' ? 'español' : 'inglés'} no disponible aún`);
      } else {
        toast.error('Error al descargar el contrato');
      }
    } finally {
      setDownloadingContract(null);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen text-white pt-24 pb-20 flex items-center justify-center relative"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/72e1f1bs_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2819%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white pt-24 pb-20 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/72e1f1bs_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2819%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/cuenta" className="inline-flex items-center text-gray-300 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a mi cuenta
        </Link>

        <h1 className="text-3xl font-bold mb-8">Historial de Compras</h1>

        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-white">No tienes compras aún</h2>
            <p className="text-gray-300 mb-8">Explora nuestro catálogo y encuentra tus beats perfectos</p>
            <Link to="/catalogo">
              <Button className="bg-white hover:bg-gray-200 text-black font-semibold">
                Explorar Beats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card 
                key={purchase.payment_intent_id || purchase.sale_id} 
                className="bg-black/60 backdrop-blur-sm border-white/30 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header de la compra - clickeable */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpand(purchase.payment_intent_id || purchase.sale_id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={purchase.cover_url || `${API}/beats/cover/${purchase.beat_id}.jpg`}
                        alt={purchase.beat_name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=🎵'; }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{purchase.beat_name}</h3>
                        <p className="text-sm text-gray-300">{formatDate(purchase.created_at)}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${licenseColors[purchase.license_type]}`}>
                            {purchase.license_type === 'exclusiva' && '⭐ '}
                            Licencia {licenseNames[purchase.license_type]}
                          </span>
                          <p className="text-lg font-bold text-white mt-1">${purchase.amount?.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white"
                        >
                          {expandedPurchase === (purchase.payment_intent_id || purchase.sale_id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Panel expandible con opciones de descarga */}
                  {expandedPurchase === (purchase.payment_intent_id || purchase.sale_id) && (
                    <div className="border-t border-white/20 bg-black/40 p-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Archivos disponibles para descarga:</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* MP3 - Disponible para todas las licencias */}
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white hover:text-black justify-start"
                          onClick={() => handleDownload(purchase.beat_id, 'mp3', purchase.license_type, purchase.beat_name)}
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Descargar MP3
                        </Button>

                        {/* WAV - Disponible para Premium y Exclusiva */}
                        {(purchase.license_type === 'premium' || purchase.license_type === 'exclusiva') && (
                          <Button
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white hover:text-black justify-start"
                            onClick={() => handleDownload(purchase.beat_id, 'wav', purchase.license_type, purchase.beat_name)}
                          >
                            <Music className="w-4 h-4 mr-2" />
                            Descargar WAV
                          </Button>
                        )}

                        {/* Stems - Solo para Exclusiva */}
                        {purchase.license_type === 'exclusiva' && (
                          <Button
                            variant="outline"
                            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black justify-start"
                            onClick={() => handleDownload(purchase.beat_id, 'stems', purchase.license_type, purchase.beat_name)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Stems
                          </Button>
                        )}

                        {/* Contrato de Licencia */}
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white hover:text-black justify-start"
                          onClick={() => handleDownload(purchase.beat_id, 'license', purchase.license_type, purchase.beat_name)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Contrato de Licencia
                        </Button>
                      </div>

                      {purchase.license_type === 'exclusiva' && (
                        <p className="text-xs text-yellow-400/80 mt-4">
                          ⭐ Como propietario exclusivo, tienes acceso a todos los archivos incluyendo los stems del beat.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
