import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, User, Building2, Phone, Mail, Check, X, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'Aa5r62yjJvixaNFIoG0qCQxcNd4eiMKo5V3IfpRCCbCHy9W-KC6rYowIXOVsQZ8e6bJGlLcr5FSti7HF';

let stripePromise = null;

const getStripeConfig = async () => {
  try {
    const response = await axios.get(`${API}/payment/config`);
    return response.data.publishable_key;
  } catch (error) {
    console.error('Error obteniendo config de Stripe:', error);
    return null;
  }
};

const licenseNames = {
  basica: 'Básica',
  premium: 'Premium',
  exclusiva: 'Exclusiva'
};

// Componente de formulario de Stripe
const StripeCheckoutForm = ({ cartItems, cartTotal, onSuccess, navigate, billingInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    const buyerName = `${billingInfo.firstName} ${billingInfo.lastName}`;
    
    let lastPurchasedItem = null;

    try {
      for (const item of cartItems) {
        const { data: paymentIntent } = await axios.post(`${API}/payment/create-payment-intent`, {
          beat_id: item.beat_id,
          beat_name: item.beat_name,
          license_type: item.license_type,
          amount: item.price,
          buyer_email: billingInfo.email,
          buyer_name: buyerName
        });

        const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: buyerName,
              email: billingInfo.email,
              phone: billingInfo.phone || undefined,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        const confirmResponse = await axios.post(`${API}/payment/confirm-payment`, {
          payment_intent_id: result.paymentIntent.id,
          beat_id: item.beat_id,
          license_type: item.license_type,
          buyer_email: billingInfo.email,
          buyer_name: buyerName,
          buyer_phone: billingInfo.phone,
          account_type: billingInfo.accountType,
          accept_promos: billingInfo.acceptPromos
        });

        lastPurchasedItem = {
          beat_id: item.beat_id,
          license_type: item.license_type,
          purchase_id: confirmResponse.data.sale_id || result.paymentIntent.id
        };

        if (confirmResponse.data.exclusive) {
          toast.success('¡Licencia Exclusiva Adquirida!', {
            description: 'El beat ha sido retirado del catálogo.'
          });
        }
      }

      toast.success('¡Compra exitosa!');
      onSuccess();
      
      if (lastPurchasedItem) {
        navigate(`/purchase-success?beat_id=${lastPurchasedItem.beat_id}&license=${lastPurchasedItem.license_type}&purchase_id=${lastPurchasedItem.purchase_id}`);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast.error('Error al procesar el pago', {
        description: error.message || 'Por favor intenta nuevamente'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Tarjeta de Crédito/Débito</Label>
        <div className="bg-black/50 border border-gray-700 rounded-lg p-4" style={{ minHeight: '50px' }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  fontFamily: 'system-ui, sans-serif',
                  '::placeholder': { color: '#9ca3af' },
                  iconColor: '#ffffff',
                  lineHeight: '24px',
                },
                invalid: { color: '#ef4444', iconColor: '#ef4444' },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Número de tarjeta, fecha de expiración y CVC</p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-4"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            Procesando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagar ${cartTotal.toFixed(2)} USD
          </span>
        )}
      </Button>
    </form>
  );
};

// Componente de PayPal
const PayPalCheckout = ({ cartItems, cartTotal, onSuccess, navigate, billingInfo }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const createPayPalOrder = async () => {
    try {
      const buyerName = `${billingInfo.firstName} ${billingInfo.lastName}`;
      
      // Crear orden en nuestro backend
      const response = await axios.post(`${API}/payment/paypal/create-order`, {
        items: cartItems.map(item => ({
          beat_id: item.beat_id,
          beat_name: item.beat_name,
          license_type: item.license_type,
          price: item.price
        })),
        total_amount: cartTotal,
        buyer_email: billingInfo.email,
        buyer_name: buyerName,
        buyer_phone: billingInfo.phone,
        account_type: billingInfo.accountType,
        accept_promos: billingInfo.acceptPromos
      });
      
      // Retornar el order_id para PayPal SDK v2
      return response.data.order_id;
    } catch (err) {
      console.error('Error creando orden PayPal:', err);
      setError('Error al crear la orden de PayPal');
      throw err;
    }
  };

  const onApprove = async (data) => {
    setProcessing(true);
    setError(null);
    
    try {
      // Capturar la orden usando el nuevo endpoint
      const response = await axios.post(`${API}/payment/paypal/capture-order?order_id=${data.orderID}`);
      
      if (response.data.success) {
        toast.success('¡Compra exitosa con PayPal!');
        onSuccess();
        
        const item = cartItems[0];
        navigate(`/purchase-success?beat_id=${item.beat_id}&license=${item.license_type}&purchase_id=${response.data.sale_id}&method=paypal`);
      } else {
        setError('Error al procesar el pago');
      }
    } catch (err) {
      console.error('Error capturando pago PayPal:', err);
      setError('Error al procesar el pago de PayPal');
      toast.error('Error al procesar el pago de PayPal');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {processing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-400">Procesando pago...</p>
        </div>
      )}
      
      {!processing && (
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }}
          createOrder={createPayPalOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error('Error PayPal:', err);
            setError('Error con PayPal. Por favor intenta de nuevo.');
            toast.error('Error con PayPal');
          }}
          onCancel={() => {
            toast.info('Pago cancelado');
          }}
        />
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Serás redirigido a PayPal para completar el pago de forma segura.
      </p>
    </div>
  );
};

// Componente principal del Checkout
const CheckoutForm = ({ cartItems, cartTotal, onSuccess, navigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 = datos, 2 = método de pago
  const [paymentMethod, setPaymentMethod] = useState(null); // 'stripe' o 'paypal'
  const [stripeLoaded, setStripeLoaded] = useState(false);
  
  // Billing info - pre-llenar con datos del usuario si está logueado
  const [accountType, setAccountType] = useState('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [acceptPromos, setAcceptPromos] = useState(true);
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    // Pre-llenar email si el usuario se loguea después de abrir el checkout
    if (user?.email && !email) {
      setEmail(user.email);
    }
    // Pre-llenar nombre si está disponible
    if (user?.username && !firstName) {
      setFirstName(user.username);
    }
  }, [user, email, firstName]);

  useEffect(() => {
    const loadStripeConfig = async () => {
      const publishableKey = await getStripeConfig();
      if (publishableKey) {
        stripePromise = loadStripe(publishableKey);
        setStripeLoaded(true);
      }
    };
    loadStripeConfig();
  }, []);

  const billingInfo = {
    accountType,
    firstName,
    lastName,
    phone,
    email,
    acceptPromos
  };

  const handleContinueToPayment = () => {
    // Validaciones
    if (!firstName || !lastName || !email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isAdult) {
      toast.error('Debes confirmar que eres mayor de edad para realizar la compra');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setStep(2);
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        {/* Billing Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-white/30 pb-2">
            Información de Facturación
          </h3>
          
          {/* Account Type */}
          <div>
            <Label className="text-sm text-gray-300 mb-3 block">Tipo de cuenta</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAccountType('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                  accountType === 'individual'
                    ? 'bg-white border-white text-black'
                    : 'bg-black/50 border-white/30 text-white hover:border-white/50'
                }`}
              >
                <User className="w-4 h-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                  accountType === 'business'
                    ? 'bg-white border-white text-black'
                    : 'bg-black/50 border-white/30 text-white hover:border-white/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Empresa
              </button>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm text-gray-300">
                Nombre *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 bg-black/50 border-white/30 text-white placeholder:text-gray-500"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm text-gray-300">
                Apellido *
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 bg-black/50 border-white/30 text-white placeholder:text-gray-500"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm text-gray-300">
              Teléfono (opcional)
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-black/50 border-white/30 text-white placeholder:text-gray-500"
                placeholder="+52 123 456 7890"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm text-gray-300">
              Email *
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-black/50 border-white/30 text-white placeholder:text-gray-500"
                placeholder="tu@email.com"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tu licencia y archivos serán enviados a este email
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 border-t border-white/30 pt-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div 
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                acceptPromos 
                  ? 'bg-white border-white' 
                  : 'border-white/50 group-hover:border-white'
              }`}
              onClick={() => setAcceptPromos(!acceptPromos)}
            >
              {acceptPromos && <Check className="w-3 h-3 text-black" />}
            </div>
            <span className="text-sm text-gray-300">
              Me gustaría recibir ofertas exclusivas, beats gratuitos y promociones especiales de HØME RECORDS
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div 
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                isAdult 
                  ? 'bg-white border-white' 
                  : 'border-white/50 group-hover:border-white'
              }`}
              onClick={() => setIsAdult(!isAdult)}
            >
              {isAdult && <Check className="w-3 h-3 text-black" />}
            </div>
            <span className="text-sm text-gray-300">
              Confirmo que soy mayor de 18 años y acepto los{' '}
              <Link to="/terminos" className="text-white underline hover:text-gray-300">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacidad" className="text-white underline hover:text-gray-300">
                Política de Privacidad
              </Link>
              {' '}*
            </span>
          </label>
        </div>

        <Button
          onClick={handleContinueToPayment}
          className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-4"
        >
          Continuar al Pago
        </Button>
      </div>
    );
  }

  // Step 2: Selección de método de pago
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => { setStep(1); setPaymentMethod(null); }}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          Selecciona método de pago
        </h3>
      </div>

      {/* Selector de método de pago */}
      {!paymentMethod && (
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('stripe')}
            className="w-full flex items-center gap-4 p-4 bg-black/50 border border-white/30 rounded-lg hover:border-white/70 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white">Tarjeta de Crédito/Débito</p>
              <p className="text-sm text-gray-300">Visa, Mastercard, American Express</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('paypal')}
            className="w-full flex items-center gap-4 p-4 bg-black/50 border border-white/30 rounded-lg hover:border-white/70 transition-colors"
          >
            <div className="w-12 h-12 bg-[#003087] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Pay</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white">PayPal</p>
              <p className="text-sm text-gray-300">Paga con tu cuenta de PayPal</p>
            </div>
          </button>
        </div>
      )}

      {/* Formulario de Stripe */}
      {paymentMethod === 'stripe' && stripeLoaded && stripePromise && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => setPaymentMethod(null)}
              className="text-gray-300 hover:text-white text-sm"
            >
              ← Cambiar método
            </button>
          </div>
          <Elements stripe={stripePromise}>
            <StripeCheckoutForm
              cartItems={cartItems}
              cartTotal={cartTotal}
              onSuccess={onSuccess}
              navigate={navigate}
              billingInfo={billingInfo}
            />
          </Elements>
        </div>
      )}

      {/* PayPal */}
      {paymentMethod === 'paypal' && (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD" }}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setPaymentMethod(null)}
                className="text-gray-300 hover:text-white text-sm"
              >
                ← Cambiar método
              </button>
            </div>
            <PayPalCheckout
              cartItems={cartItems}
              cartTotal={cartTotal}
              onSuccess={onSuccess}
              navigate={navigate}
              billingInfo={billingInfo}
            />
          </div>
        </PayPalScriptProvider>
      )}

      {/* Loading de Stripe */}
      {paymentMethod === 'stripe' && !stripeLoaded && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-300">Cargando...</p>
        </div>
      )}
    </div>
  );
};

export const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleCheckoutSuccess = () => {
    clearCart();
    setShowCheckout(false);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowCheckout(true);
    }
  };

  const handleIgnoreLogin = () => {
    setShowLoginModal(false);
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white pt-24 pb-20 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_beatstore-preview/artifacts/f5jpsafc_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2816%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalogo" className="inline-flex items-center text-gray-300 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Seguir comprando
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Tu Carrito</h1>
          {cartItems.length > 0 && (
            <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-white">Tu carrito está vacío</h2>
            <p className="text-gray-300 mb-8">Explora nuestro catálogo y encuentra tus beats perfectos</p>
            <Link to="/catalogo">
              <Button className="bg-white hover:bg-gray-200 text-black font-semibold">
                Explorar Beats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={`${item.beat_id}-${item.license_type}`} className="bg-black/60 backdrop-blur-sm border-white/30">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.cover_image || `${BACKEND_URL}/api/beats/cover/${item.beat_id}.jpg`}
                        alt={item.beat_name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=🎵'; }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.beat_name}</h3>
                        <p className="text-sm text-gray-300">
                          Licencia {licenseNames[item.license_type]}
                        </p>
                        <p className="text-lg font-bold text-white mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.beat_id, item.license_type)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-black/60 backdrop-blur-sm border-white/30 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-white">Resumen</h3>
                  
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={`${item.beat_id}-${item.license_type}`} className="flex justify-between text-sm">
                        <span className="text-gray-300 truncate max-w-[60%]">
                          {item.beat_name} ({licenseNames[item.license_type]})
                        </span>
                        <span className="text-white">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/30 pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {!showCheckout ? (
                    <Button
                      size="lg"
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-6 text-lg"
                      onClick={handleProceedToCheckout}
                    >
                      Proceder al Pago
                    </Button>
                  ) : (
                    <CheckoutForm
                      cartItems={cartItems}
                      cartTotal={cartTotal}
                      onSuccess={handleCheckoutSuccess}
                      navigate={navigate}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modal de recomendación de login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/80 backdrop-blur-sm border border-white/30 rounded-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                ¿Continuar sin cuenta?
              </h3>
              
              <p className="text-gray-200 mb-6 text-sm leading-relaxed">
                Te recomendamos iniciar sesión para poder conservar tus archivos, 
                contrato de licencia e historial de compras. Si no lo haces, 
                <span className="text-yellow-400 font-medium"> no podrás reclamar tus archivos </span>
                después de cerrar la página.
              </p>
              
              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button 
                    className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                
                <Button 
                  variant="outline"
                  className="w-full border-white/50 text-white hover:bg-white/10 py-3"
                  onClick={handleIgnoreLogin}
                >
                  Continuar sin cuenta
                </Button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Al continuar sin cuenta, aceptas que no podrás recuperar tus archivos posteriormente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
