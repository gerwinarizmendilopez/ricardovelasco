import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Music, FileAudio, Archive, ArrowRight, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const licenseLabels = {
  basica: 'Básica',
  premium: 'Premium',
  exclusiva: 'Exclusiva'
};

const licenseColors = {
  basica: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  exclusiva: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

// Componente para cada beat comprado
const PurchasedBeatCard = ({ sale, isExpanded, onToggle }) => {
  const { user, token } = useAuth();
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (fileType) => {
    setDownloading(fileType);
    try {
      const buyerEmail = user?.email || sale.buyer_email;
      const response = await axios.get(
        `${API}/payment/download/${sale.beat_id}/${fileType}?license_type=${sale.license_type}&buyer_email=${encodeURIComponent(buyerEmail)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          responseType: 'blob'
        }
      );
      
      // Verificar si es error JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const error = JSON.parse(text);
        toast.info(error.detail || 'Archivo no disponible. Contacta a soporte: home.recordsinfo@gmail.com');
        return;
      }
      
      const ext = fileType === 'mp3' ? 'mp3' : fileType === 'wav' ? 'wav' : fileType === 'stems' ? 'zip' : 'pdf';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sale.beat_name}_${sale.license_type}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Archivo descargado');
    } catch (error) {
      console.error('Error descargando:', error);
      // Mensaje amigable sin error crítico
      const fileNames = {
        mp3: 'MP3',
        wav: 'WAV',
        stems: 'Stems',
        contract: 'Contrato'
      };
      toast.info(`El archivo ${fileNames[fileType] || fileType} no está disponible. Contacta a soporte: home.recordsinfo@gmail.com`, {
        duration: 5000
      });
    } finally {
      setDownloading(null);
    }
  };

  const license = sale.license_type?.toLowerCase() || 'basica';

  return (
    <Card className="bg-black/60 backdrop-blur-sm border-white/30 overflow-hidden">
      <CardContent className="p-0">
        {/* Header clickeable */}
        <div 
          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <img 
              src={`${API}/beats/cover/${sale.beat_id}.jpg`}
              alt={sale.beat_name}
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=🎵'; }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{sale.beat_name}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${licenseColors[license]}`}>
                {license === 'exclusiva' && '⭐ '}
                Licencia {licenseLabels[license]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">${sale.amount?.toFixed(2)}</span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-300" />
              )}
            </div>
          </div>
        </div>

        {/* Panel expandible con descargas */}
        {isExpanded && (
          <div className="border-t border-white/20 bg-black/40 p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Archivos disponibles:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MP3 - siempre disponible */}
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 justify-start"
                onClick={() => handleDownload('mp3')}
                disabled={downloading === 'mp3'}
              >
                {downloading === 'mp3' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                ) : (
                  <Music className="w-4 h-4 mr-2" />
                )}
                Descargar MP3
              </Button>

              {/* WAV - Premium y Exclusiva */}
              {(license === 'premium' || license === 'exclusiva') && (
                <Button
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 justify-start"
                  onClick={() => handleDownload('wav')}
                  disabled={downloading === 'wav'}
                >
                  {downloading === 'wav' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                  ) : (
                    <FileAudio className="w-4 h-4 mr-2" />
                  )}
                  Descargar WAV
                </Button>
              )}

              {/* Stems - Solo Exclusiva */}
              {license === 'exclusiva' && (
                <Button
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 justify-start"
                  onClick={() => handleDownload('stems')}
                  disabled={downloading === 'stems'}
                >
                  {downloading === 'stems' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                  ) : (
                    <Archive className="w-4 h-4 mr-2" />
                  )}
                  Descargar Stems
                </Button>
              )}

              {/* Contrato */}
              <Button
                variant="outline"
                className="border-white/30 text-gray-300 hover:bg-white/10 justify-start"
                onClick={() => toast.info('Contrato en desarrollo')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Contrato de Licencia
              </Button>
            </div>

            {license === 'exclusiva' && (
              <p className="text-xs text-yellow-500/70 mt-3">
                ⭐ Como propietario exclusivo, tienes todos los derechos sobre este beat.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  const purchaseId = searchParams.get('purchase_id');
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        // Si hay un usuario logueado, buscar sus compras recientes
        const buyerEmail = user?.email;
        
        if (buyerEmail) {
          const response = await axios.get(
            `${API}/payment/purchases/${encodeURIComponent(buyerEmail)}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          
          // Filtrar las compras más recientes (últimos 5 minutos)
          const recentPurchases = response.data.purchases?.filter(p => {
            const purchaseTime = new Date(p.created_at);
            const now = new Date();
            const diffMinutes = (now - purchaseTime) / 1000 / 60;
            return diffMinutes <= 5; // Compras de los últimos 5 minutos
          }) || [];
          
          if (recentPurchases.length > 0) {
            setPurchases(recentPurchases);
            // Expandir el primer item por defecto
            setExpandedItems({ 0: true });
          } else {
            // Si no hay compras recientes, mostrar todas las del día
            const todayPurchases = response.data.purchases?.filter(p => {
              const purchaseTime = new Date(p.created_at);
              const today = new Date();
              return purchaseTime.toDateString() === today.toDateString();
            }).slice(0, 10) || [];
            
            setPurchases(todayPurchases);
            if (todayPurchases.length > 0) {
              setExpandedItems({ 0: true });
            }
          }
        } else if (purchaseId) {
          // Si no hay usuario pero hay purchase_id, buscar esa compra específica
          try {
            const response = await axios.get(`${API}/payment/purchase/${purchaseId}`);
            if (response.data) {
              setPurchases([response.data]);
              setExpandedItems({ 0: true });
            }
          } catch (err) {
            console.log('No se pudo obtener la compra específica');
          }
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    // Pequeño delay para dar tiempo a que se guarden las compras
    const timer = setTimeout(fetchPurchases, 1000);
    return () => clearTimeout(timer);
  }, [user, token, purchaseId]);

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen text-white pt-24 flex items-center justify-center relative"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/50jqjm6n_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2817%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando tu compra...</p>
        </div>
      </div>
    );
  }

  const totalAmount = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div 
      className="min-h-screen text-white pt-24 pb-32 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/50jqjm6n_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2817%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Main Title */}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight text-center mb-4"
          style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}
        >
          ¡GRACIAS POR TU COMPRA!
        </h1>

        {purchases.length > 0 && (
          <p className="text-center text-gray-300 mb-8">
            {purchases.length === 1 
              ? 'Tu beat está listo para descargar'
              : `Tus ${purchases.length} beats están listos para descargar`
            }
            {paymentMethod && ` • Pagado con ${paymentMethod === 'paypal' ? 'PayPal' : 'Tarjeta'}`}
          </p>
        )}

        {/* Resumen de compra */}
        {purchases.length > 1 && (
          <div className="bg-black/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total de tu compra:</span>
              <span className="text-2xl font-bold text-green-500">${totalAmount.toFixed(2)} USD</span>
            </div>
          </div>
        )}

        {/* Lista de beats comprados */}
        {purchases.length > 0 ? (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white">
              {purchases.length === 1 ? 'Tu compra:' : 'Tus compras:'}
            </h3>
            {purchases.map((sale, index) => (
              <PurchasedBeatCard
                key={sale.sale_id || sale.payment_intent_id || index}
                sale={sale}
                isExpanded={expandedItems[index]}
                onToggle={() => toggleExpand(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-300 mb-4">No se encontraron compras recientes.</p>
            <p className="text-sm text-gray-400">
              Si acabas de realizar una compra, por favor espera unos segundos o revisa tu historial.
            </p>
          </div>
        )}

        {/* Aviso importante */}
        {user && (
          <Card className="bg-green-500/10 border-green-500/40 mb-8 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-green-400 text-sm">
                ✓ Tus compras han sido guardadas en tu cuenta. Puedes acceder a ellas en cualquier momento desde tu <Link to="/historial" className="underline font-semibold">Historial de Compras</Link>.
              </p>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="bg-yellow-500/10 border-yellow-500/40 mb-8 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ No estás logueado. Descarga tus archivos ahora, ya que no podrás recuperarlos después de cerrar esta página.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user && (
            <Link to="/historial">
              <Button className="w-full sm:w-auto bg-white hover:bg-gray-200 text-black px-8 py-6 text-lg">
                Ver mi Historial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
          <Link to="/catalogo">
            <Button variant={user ? "outline" : "default"} className={`w-full sm:w-auto px-8 py-6 text-lg ${user ? 'border-white/30 text-gray-300 hover:text-white hover:bg-white/10' : 'bg-white hover:bg-gray-200 text-black'}`}>
              Explorar más beats
              {!user && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
