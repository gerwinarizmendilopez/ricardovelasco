import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TerminosCondiciones = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80')`,
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Términos y Condiciones</h1>
          <p className="text-gray-400 mb-8">Última actualización: Enero 2025</p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-300 leading-relaxed">
                Al acceder y utilizar el sitio web de HØME Records (en adelante, "la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio. Los materiales contenidos en este sitio web están protegidos por las leyes de derechos de autor y marcas comerciales aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Definiciones</h2>
              <p className="text-gray-300 leading-relaxed mb-4">Para efectos de estos Términos y Condiciones:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">"Beat"</strong>: Composición musical instrumental creada y producida por HØME Records disponible para licenciamiento.</li>
                <li><strong className="text-white">"Licencia"</strong>: Autorización legal otorgada al comprador para usar un Beat bajo términos específicos.</li>
                <li><strong className="text-white">"Licenciatario"</strong>: Persona física o jurídica que adquiere una licencia para usar un Beat.</li>
                <li><strong className="text-white">"Productor"</strong>: HØME Records, creador y propietario original de los Beats.</li>
                <li><strong className="text-white">"Obra Derivada"</strong>: Cualquier grabación, canción o producción que incorpore un Beat licenciado.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Tipos de Licencias</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Licencia Básica</h3>
              <p className="text-gray-300 leading-relaxed mb-3">La Licencia Básica otorga los siguientes derechos:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Uso del Beat en formato MP3 para grabaciones de audio.</li>
                <li>Distribución de hasta 10,000 reproducciones en plataformas de streaming (Spotify, Apple Music, etc.).</li>
                <li>Uso en plataformas de video sin monetización (YouTube, TikTok, etc.).</li>
                <li>Prohibida la reventa, sublicenciamiento o transferencia de la licencia.</li>
                <li>Obligación de dar crédito al productor en todas las publicaciones.</li>
                <li>Uso no exclusivo: el Beat puede ser licenciado a otros artistas.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Licencia Premium</h3>
              <p className="text-gray-300 leading-relaxed mb-3">La Licencia Premium incluye todos los derechos de la Licencia Básica, más:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Archivos en formato MP3 y WAV de alta calidad.</li>
                <li>Distribución de hasta 500,000 reproducciones en plataformas de streaming.</li>
                <li>Monetización permitida en YouTube y otras plataformas de video.</li>
                <li>Uso en hasta 1 video musical oficial.</li>
                <li>Distribución en radio y televisión local.</li>
                <li>Venta de hasta 2,000 copias físicas.</li>
                <li>Uso no exclusivo: el Beat puede ser licenciado a otros artistas.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Licencia Exclusiva</h3>
              <p className="text-gray-300 leading-relaxed mb-3">La Licencia Exclusiva otorga:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Todos los archivos del proyecto: MP3, WAV y Stems (pistas separadas).</li>
                <li>Derechos exclusivos sobre el Beat: se retira permanentemente del catálogo.</li>
                <li>Uso comercial ilimitado sin restricciones de reproducciones o ventas.</li>
                <li>Transferencia de derechos de autor sobre la composición (según jurisdicción).</li>
                <li>Posibilidad de registrar la obra ante sociedades de gestión colectiva.</li>
                <li>El productor renuncia a licenciar el Beat a terceros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Proceso de Compra</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Al realizar una compra en la Plataforma, el usuario declara y garantiza que:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Es mayor de edad según las leyes de su jurisdicción.</li>
                <li>Tiene capacidad legal para celebrar contratos vinculantes.</li>
                <li>La información proporcionada es verdadera, precisa y completa.</li>
                <li>Está autorizado a usar el método de pago seleccionado.</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Una vez completado el pago, el Licenciatario recibirá automáticamente los archivos correspondientes a su licencia y un contrato PDF con los términos específicos de uso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Restricciones de Uso</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Independientemente del tipo de licencia adquirida, queda estrictamente prohibido:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Registrar el Beat como composición propia ante sociedades de gestión (excepto Licencia Exclusiva).</li>
                <li>Usar el Beat en contenido que promueva odio, violencia, discriminación o actividades ilegales.</li>
                <li>Sublicenciar, revender o distribuir el Beat de forma aislada.</li>
                <li>Usar el Beat en proyectos de NFT sin autorización expresa.</li>
                <li>Modificar el Beat para crear nuevos instrumentales para venta.</li>
                <li>Reclamar la autoría original del Beat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Propiedad Intelectual</h2>
              <p className="text-gray-300 leading-relaxed">
                Todos los Beats, diseños, logos, textos y demás contenido de la Plataforma son propiedad de HØME Records o de sus respectivos propietarios y están protegidos por las leyes de propiedad intelectual. La adquisición de una licencia no transfiere la propiedad del Beat, sino únicamente el derecho de uso según los términos de la licencia adquirida. El productor conserva los derechos morales sobre todas las composiciones.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Entrega de Archivos</h2>
              <p className="text-gray-300 leading-relaxed">
                Los archivos adquiridos se entregarán de forma inmediata tras la confirmación del pago a través de descarga directa en la Plataforma y/o envío al correo electrónico proporcionado. HØME Records no se hace responsable por errores en la dirección de correo electrónico proporcionada por el usuario. En caso de problemas con la descarga, el usuario puede contactar a soporte para asistencia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disputas de Derechos de Autor</h2>
              <p className="text-gray-300 leading-relaxed">
                Si el Licenciatario recibe una reclamación de derechos de autor en plataformas como YouTube relacionada con un Beat licenciado legítimamente, HØME Records proporcionará asistencia para resolver la disputa. El Licenciatario deberá proporcionar prueba de compra y el contrato de licencia. HØME Records se reserva el derecho de verificar la legitimidad de la compra antes de intervenir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitación de Responsabilidad</h2>
              <p className="text-gray-300 leading-relaxed">
                HØME Records no será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar los Beats o la Plataforma. La responsabilidad total de HØME Records en ningún caso excederá el monto pagado por la licencia en cuestión.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modificaciones</h2>
              <p className="text-gray-300 leading-relaxed">
                HØME Records se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la Plataforma. El uso continuado de la Plataforma después de la publicación de cambios constituye la aceptación de dichos cambios. Las licencias adquiridas antes de cualquier modificación se regirán por los términos vigentes al momento de la compra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Ley Aplicable y Jurisdicción</h2>
              <p className="text-gray-300 leading-relaxed">
                Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes aplicables. Cualquier disputa que surja en relación con estos términos será sometida a la jurisdicción exclusiva de los tribunales competentes. Las partes acuerdan intentar resolver cualquier disputa de manera amistosa antes de recurrir a procedimientos legales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Para cualquier pregunta sobre estos Términos y Condiciones, puede contactarnos a través de nuestro correo electrónico de soporte. Nos comprometemos a responder todas las consultas en un plazo máximo de 48 horas hábiles.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
