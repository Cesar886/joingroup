import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

export default function InstruccionesCrearGrupoTelegram() {
    useEffect(() => {
    document.title = 'Cómo Crear un Grupo de Telegram – Guía Paso a Paso';
    }, []);
    
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Cómo Crear un Grupo de Telegram – Guía Paso a Paso</title>
        <meta
          name="description"
          content="Aprende cómo crear un grupo de Telegram fácilmente. Guía paso a paso para principiantes: desde la configuración hasta invitar miembros y gestionar ajustes del grupo."
        />
        <meta
          name="keywords"
          content="crear grupo Telegram, comunidad Telegram, administrador grupo Telegram, configuración grupo Telegram, tutorial Telegram"
        />
        <link rel="canonical" href="https://joingroups.pro/como-crear-grupo-telegram" />

        {/* Open Graph */}
        <meta property="og:title" content="Cómo Crear un Grupo de Telegram" />
        <meta
          property="og:description"
          content="Guía completa para crear y gestionar grupos de Telegram. Empieza tu comunidad hoy mismo."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://joingroups.pro/como-crear-grupo-telegram" />
        <meta property="og:image" content="https://joingroups.pro/og-preview.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo Crear un Grupo de Telegram" />
        <meta
          name="twitter:description"
          content="Aprende cómo crear y hacer crecer tu grupo de Telegram paso a paso. Perfecto para principiantes."
        />
        <meta name="twitter:image" content="https://joingroups.pro/og-preview.png" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Cómo Crear un Grupo de Telegram</h1>
      <p className="mb-4">
        Los grupos de Telegram son una excelente manera de crear una comunidad, conectar con personas y compartir contenido. Ya sea que estés empezando un grupo de discusión, un círculo de estudio o un club de fans, crear un grupo en Telegram es fácil y gratuito.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Abre la aplicación de Telegram</h2>
      <p className="mb-4">
        Abre la aplicación de Telegram en tu teléfono (Android o iOS) o en tu escritorio. Asegúrate de haber iniciado sesión con tu cuenta de Telegram.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Toca "Nuevo Grupo"</h2>
      <p className="mb-4">
        En móvil, toca el ícono de lápiz (✏️) en la esquina inferior derecha y luego selecciona <strong>"Nuevo Grupo"</strong>. En escritorio, haz clic en el menú y elige <strong>"Nuevo Grupo"</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Añade miembros</h2>
      <p className="mb-4">
        Selecciona al menos un contacto para agregar al grupo. Siempre puedes añadir más miembros después, hasta un máximo de 200,000 participantes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Ponle nombre y foto al grupo</h2>
      <p className="mb-4">
        Elige un nombre para tu grupo, que será visible para todos los miembros. También puedes poner una foto de perfil o un ícono para que el grupo destaque.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Personaliza la configuración del grupo</h2>
      <p className="mb-4">
        Una vez creado el grupo, abre la configuración para:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Escribir una descripción</li>
        <li>Asignar roles y permisos de administradores</li>
        <li>Crear enlaces o códigos QR para invitar</li>
        <li>Controlar quién puede publicar, fijar mensajes o enviar medios</li>
        <li>Activar bots para moderación, mensajes de bienvenida, etc.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Comparte tu grupo</h2>
        <p className="mb-4">
        Usa el enlace de invitación de tu grupo para compartirlo en redes sociales, sitios web o plataformas como <a href="https://joingroups.pro" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">JoinGroups</a>, donde puedes publicar tu grupo para que más personas lo descubran fácilmente.
        </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Mantén y haz crecer tu grupo</h2>
      <p className="mb-4">
        Mantén tu grupo activo publicando regularmente, moderando las conversaciones e interactuando con los miembros. Un grupo bien gestionado crece de forma natural.
      </p>

      <p className="mt-6 text-sm text-gray-600">Última actualización: junio 2025</p>
    </div>
  );
}
