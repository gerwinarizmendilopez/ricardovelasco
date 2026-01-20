import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80')`,
          filter: 'grayscale(100%)'
        }}
      />
      
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Privacidad</h1>
          <p className="text-gray-400 mb-8">Última actualización: Enero 2025</p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introducción</h2>
              <p className="text-gray-300 leading-relaxed">
                En HØME Records, nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza nuestra plataforma. Al acceder o utilizar nuestros servicios, usted acepta las prácticas descritas en esta política. Le recomendamos leer detenidamente este documento para comprender nuestras prácticas de privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Información que Recopilamos</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Información proporcionada directamente</h3>
              <p className="text-gray-300 leading-relaxed mb-3">Recopilamos información que usted nos proporciona directamente, incluyendo:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Datos de registro:</strong> nombre, apellido, dirección de correo electrónico y contraseña al crear una cuenta.</li>
                <li><strong className="text-white">Datos de facturación:</strong> nombre completo, dirección de correo electrónico, número de teléfono y tipo de cuenta (individual o empresa) al realizar una compra.</li>
                <li><strong className="text-white">Información de pago:</strong> datos de tarjeta de crédito o débito procesados de forma segura a través de Stripe. HØME Records no almacena información completa de tarjetas de pago.</li>
                <li><strong className="text-white">Comunicaciones:</strong> información contenida en mensajes que nos envía a través de correo electrónico o formularios de contacto.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Información recopilada automáticamente</h3>
              <p className="text-gray-300 leading-relaxed mb-3">Cuando utiliza nuestra plataforma, recopilamos automáticamente:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Datos de uso:</strong> páginas visitadas, tiempo de permanencia, beats reproducidos y acciones realizadas en la plataforma.</li>
                <li><strong className="text-white">Información del dispositivo:</strong> tipo de navegador, sistema operativo, identificadores únicos del dispositivo y configuración de idioma.</li>
                <li><strong className="text-white">Datos de conexión:</strong> dirección IP, proveedor de servicios de internet y ubicación geográfica aproximada.</li>
                <li><strong className="text-white">Cookies y tecnologías similares:</strong> utilizamos cookies para mejorar su experiencia, recordar preferencias y analizar el uso del sitio.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Uso de la Información</h2>
              <p className="text-gray-300 leading-relaxed mb-4">Utilizamos la información recopilada para los siguientes fines:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Prestación de servicios:</strong> procesar compras, entregar archivos adquiridos y proporcionar soporte al cliente.</li>
                <li><strong className="text-white">Comunicaciones:</strong> enviar confirmaciones de compra, actualizaciones de la cuenta y responder a consultas.</li>
                <li><strong className="text-white">Marketing:</strong> enviar promociones, novedades y ofertas exclusivas, únicamente si el usuario ha dado su consentimiento expreso.</li>
                <li><strong className="text-white">Mejora del servicio:</strong> analizar patrones de uso para mejorar la funcionalidad y experiencia de la plataforma.</li>
                <li><strong className="text-white">Seguridad:</strong> detectar y prevenir fraudes, actividades no autorizadas y otros problemas de seguridad.</li>
                <li><strong className="text-white">Cumplimiento legal:</strong> cumplir con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Compartición de Información</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                HØME Records no vende, alquila ni comercializa su información personal. Podemos compartir su información únicamente en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Proveedores de servicios:</strong> compartimos información con terceros que nos ayudan a operar la plataforma, como procesadores de pago (Stripe), servicios de correo electrónico y proveedores de alojamiento web.</li>
                <li><strong className="text-white">Requisitos legales:</strong> podemos divulgar información si es requerido por ley, orden judicial o proceso legal.</li>
                <li><strong className="text-white">Protección de derechos:</strong> podemos compartir información para proteger los derechos, propiedad o seguridad de HØME Records, nuestros usuarios u otros.</li>
                <li><strong className="text-white">Transacciones comerciales:</strong> en caso de fusión, adquisición o venta de activos, la información del usuario puede ser transferida como parte de la transacción.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Seguridad de los Datos</h2>
              <p className="text-gray-300 leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen cifrado SSL/TLS para la transmisión de datos, almacenamiento seguro con acceso restringido, autenticación de usuarios y monitoreo continuo de nuestros sistemas. Siendo que ningún método o toda transacción por internet es susceptible a fallas de seguridad, el cliente deberá conducirse con la debida prudencia a la hora de proporcionar sus datos. Se recomienda evitar acceder desde redes públicas o navegadores que no sean seguros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Retención de Datos</h2>
              <p className="text-gray-300 leading-relaxed">
                Conservamos su información personal durante el tiempo necesario para cumplir con los fines descritos en esta política, a menos que la ley exija o permita un período de retención más largo. Los datos de transacciones se conservan durante el período requerido para fines contables y legales. Puede solicitar la eliminación de su cuenta y datos personales en cualquier momento, sujeto a ciertas excepciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Sus Derechos</h2>
              <p className="text-gray-300 leading-relaxed mb-4">Dependiendo de su jurisdicción, usted puede tener los siguientes derechos:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Acceso:</strong> solicitar una copia de la información personal que tenemos sobre usted.</li>
                <li><strong className="text-white">Rectificación:</strong> corregir información personal inexacta o incompleta.</li>
                <li><strong className="text-white">Eliminación:</strong> solicitar la eliminación de su información personal, sujeto a ciertas excepciones.</li>
                <li><strong className="text-white">Portabilidad:</strong> recibir su información en un formato estructurado y de uso común.</li>
                <li><strong className="text-white">Oposición:</strong> oponerse al procesamiento de su información para fines de marketing directo.</li>
                <li><strong className="text-white">Retiro del consentimiento:</strong> retirar su consentimiento en cualquier momento cuando el procesamiento se base en él.</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Para ejercer cualquiera de estos derechos, contáctenos a través del correo electrónico proporcionado en la sección de contacto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
              <p className="text-gray-300 leading-relaxed mb-4">Utilizamos los siguientes tipos de cookies:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Cookies esenciales:</strong> necesarias para el funcionamiento básico del sitio, como la autenticación y el carrito de compras.</li>
                <li><strong className="text-white">Cookies de rendimiento:</strong> nos ayudan a entender cómo los usuarios interactúan con el sitio para mejorar su funcionamiento.</li>
                <li><strong className="text-white">Cookies de funcionalidad:</strong> permiten recordar sus preferencias y personalizar su experiencia.</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Menores de Edad</h2>
              <p className="text-gray-300 leading-relaxed">
                Nuestra plataforma no está dirigida a menores de edad. No recopilamos intencionalmente información personal de menores. Si tiene conocimiento de que un menor nos ha proporcionado información personal sin el consentimiento de sus padres o tutores, contáctenos para que podamos tomar las medidas necesarias para eliminar dicha información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Transferencias Internacionales</h2>
              <p className="text-gray-300 leading-relaxed">
                Su información puede ser transferida y almacenada en servidores ubicados fuera de su país de residencia. Nos aseguramos de que cualquier transferencia internacional de datos cumpla con las leyes aplicables y que se implementen las salvaguardas apropiadas para proteger su información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Cambios a esta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por otros motivos operativos, legales o regulatorios. Publicaremos cualquier cambio en esta página y actualizaremos la fecha de "última actualización". Le recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos su información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos a través de nuestro correo electrónico de soporte. Responderemos a su consulta en el menor tiempo posible.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
