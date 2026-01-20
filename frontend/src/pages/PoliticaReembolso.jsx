import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PoliticaReembolso = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80')`,
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Reembolso</h1>
          <p className="text-gray-400 mb-8">Última actualización: Enero 2025</p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Naturaleza de los Productos Digitales</h2>
              <p className="text-gray-300 leading-relaxed">
                HØME Records comercializa productos digitales en forma de licencias de uso para composiciones musicales instrumentales (beats). Debido a la naturaleza intangible e inmediatamente descargable de estos productos, una vez que se completa la transacción y se entregan los archivos, el producto no puede ser "devuelto" en el sentido tradicional. Esta característica fundamental de los productos digitales afecta directamente nuestra política de reembolsos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Política General de No Reembolso</h2>
              <p className="text-gray-300 leading-relaxed">
                Como norma general, HØME Records no ofrece reembolsos para licencias de beats adquiridas a través de nuestra plataforma. Esta política existe porque: los archivos digitales pueden ser copiados y conservados incluso después de un reembolso; ofrecemos previsualizaciones completas de todos los beats antes de la compra; la información sobre cada licencia está claramente detallada antes del pago; y el usuario debe confirmar que ha leído y acepta los términos antes de completar la transacción.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Excepciones a la Política</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                A pesar de nuestra política general, consideraremos solicitudes de reembolso en las siguientes circunstancias excepcionales:
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Problemas técnicos</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Archivos corruptos o dañados que no pueden reproducirse correctamente.</li>
                <li>Archivos que no corresponden al beat comprado.</li>
                <li>Fallas técnicas de la plataforma que impidieron la descarga correcta.</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                En estos casos, primero intentaremos resolver el problema proporcionando nuevos enlaces de descarga o archivos corregidos. Si el problema persiste, se considerará el reembolso.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Cobros duplicados</h3>
              <p className="text-gray-300 leading-relaxed">
                Si debido a un error técnico se realizaron múltiples cobros por la misma licencia, reembolsaremos inmediatamente los cargos duplicados. El usuario deberá proporcionar los comprobantes de los cobros múltiples.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Transacciones no autorizadas</h3>
              <p className="text-gray-300 leading-relaxed">
                Si puede demostrar que una compra fue realizada sin su autorización (fraude con tarjeta de crédito, uso no autorizado de su cuenta), trabajaremos con usted y con nuestro procesador de pagos para resolver la situación. Deberá presentar documentación que respalde su reclamo.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Discrepancias significativas</h3>
              <p className="text-gray-300 leading-relaxed">
                Si el producto entregado difiere sustancialmente de lo descrito o promocionado en la plataforma (por ejemplo, si la calidad del archivo es significativamente inferior a lo anunciado), evaluaremos la solicitud de reembolso caso por caso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Proceso de Solicitud de Reembolso</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Para solicitar un reembolso bajo las excepciones mencionadas, debe seguir el siguiente proceso:
              </p>
              <ol className="list-decimal pl-6 text-gray-300 space-y-3">
                <li><strong className="text-white">Contacto inicial:</strong> Envíe un correo electrónico a nuestro equipo de soporte dentro de los 7 días posteriores a la compra.</li>
                <li><strong className="text-white">Información requerida:</strong> Incluya su nombre completo, correo electrónico asociado a la compra, número de transacción o ID del pedido, nombre del beat adquirido, motivo detallado de la solicitud, y cualquier evidencia que respalde su caso (capturas de pantalla, mensajes de error, etc.).</li>
                <li><strong className="text-white">Evaluación:</strong> Nuestro equipo revisará su solicitud en un plazo de 3-5 días hábiles.</li>
                <li><strong className="text-white">Resolución:</strong> Le notificaremos nuestra decisión por correo electrónico. Si se aprueba el reembolso, se procesará a través del mismo método de pago utilizado en la compra original.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Plazos de Reembolso</h2>
              <p className="text-gray-300 leading-relaxed">
                Las solicitudes de reembolso deben presentarse dentro de los 7 días calendario siguientes a la fecha de compra. Solicitudes presentadas después de este período serán evaluadas a discreción de HØME Records, pero generalmente no serán aprobadas salvo circunstancias excepcionales. Una vez aprobado un reembolso, el tiempo de procesamiento dependerá del método de pago: las tarjetas de crédito y débito pueden tardar de 5 a 10 días hábiles en reflejar el reembolso, mientras que otros métodos pueden variar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Licencias Exclusivas</h2>
              <p className="text-gray-300 leading-relaxed">
                Las licencias exclusivas tienen consideraciones especiales debido a su naturaleza única. Una vez que se completa la compra de una licencia exclusiva, el beat se retira permanentemente del catálogo. Por esta razón, las licencias exclusivas no son elegibles para reembolso bajo ninguna circunstancia, excepto en casos de fraude comprobado o error técnico grave por parte de HØME Records. Recomendamos encarecidamente a los compradores que escuchen completamente el preview y lean todos los términos antes de adquirir una licencia exclusiva.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Cancelaciones</h2>
              <p className="text-gray-300 leading-relaxed">
                Debido a la entrega inmediata de los productos digitales, no es posible cancelar un pedido una vez que se ha completado el proceso de pago. Si desea cancelar una compra, debe hacerlo antes de finalizar el proceso de pago. Una vez que el pago es procesado y los archivos están disponibles para descarga, la transacción se considera final.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Chargebacks y Disputas</h2>
              <p className="text-gray-300 leading-relaxed">
                Si un cliente inicia un chargeback (contracargo) a través de su banco o compañía de tarjeta de crédito sin antes contactarnos para resolver el problema, HØME Records se reserva el derecho de: revocar inmediatamente todas las licencias asociadas a la cuenta del usuario, prohibir futuras compras desde esa cuenta o método de pago, y tomar acciones legales si se determina que el chargeback fue fraudulento. Le instamos a contactarnos primero para resolver cualquier problema antes de iniciar una disputa con su institución financiera.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Cambios de Licencia</h2>
              <p className="text-gray-300 leading-relaxed">
                Si ha adquirido una licencia y desea actualizar a una licencia superior (por ejemplo, de Básica a Premium, o de Premium a Exclusiva), puede hacerlo pagando la diferencia de precio. Contáctenos para gestionar la actualización. No ofrecemos "downgrades" ni reembolsos parciales por cambiar a una licencia inferior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Responsabilidad del Usuario</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Antes de realizar una compra, el usuario es responsable de:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Escuchar completamente el preview del beat para asegurarse de que cumple con sus expectativas.</li>
                <li>Leer y comprender los términos de la licencia que está adquiriendo.</li>
                <li>Verificar que tiene los requisitos técnicos necesarios para descargar y reproducir los archivos.</li>
                <li>Proporcionar información de contacto correcta para recibir los archivos.</li>
                <li>Verificar que el método de pago utilizado es válido y está autorizado.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Resolución de Disputas</h2>
              <p className="text-gray-300 leading-relaxed">
                Nos comprometemos a resolver cualquier disputa de manera justa y eficiente. Si no está satisfecho con la resolución inicial de su solicitud de reembolso, puede solicitar una revisión adicional por parte de nuestro equipo de gestión. Haremos todo lo posible por llegar a una solución mutuamente aceptable. Si la disputa no puede resolverse de manera amistosa, se someterá a los mecanismos de resolución establecidos en nuestros Términos y Condiciones.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Modificaciones a esta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                HØME Records se reserva el derecho de modificar esta Política de Reembolso en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. Las compras realizadas antes de cualquier modificación se regirán por la política vigente al momento de la transacción.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Para solicitudes de reembolso o preguntas sobre esta política, contáctenos a través de nuestro correo electrónico de soporte. Incluya toda la información relevante para agilizar el proceso de revisión. Nos comprometemos a responder todas las solicitudes de reembolso dentro de los 3-5 días hábiles siguientes a su recepción.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
