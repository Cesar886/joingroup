export default function Acerca() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Acerca de JoinGroup - Plataforma de Administración de Grupos en Telegram</h1>

      <p className="mb-6">
        JoinGroup es una solución integral orientada a la <strong>gestión inteligente de grupos en Telegram</strong>. Ofrecemos un sistema moderno y automatizado que permite a los administradores ejercer un control total sobre sus comunidades, simplificando tareas administrativas, mejorando la organización del grupo y garantizando una experiencia de usuario óptima para todos sus miembros.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">¿Qué es JoinGroup?</h2>
      <p className="mb-4">
        JoinGroup es una <strong>plataforma web integrada con bots de Telegram</strong>, diseñada específicamente para facilitar la administración remota de grupos públicos o privados. A través de un <strong>panel administrativo intuitivo</strong>, el administrador puede modificar en tiempo real la información del grupo (nombre, descripción, foto, permisos), controlar eventos clave como el ingreso y salida de usuarios, y mantener un historial operativo para la trazabilidad de cambios.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Principales funcionalidades de JoinGroup</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Modificación del título, descripción y foto del grupo desde el panel web.</li>
        <li>Configuración de permisos para usuarios (envío de mensajes, multimedia, enlaces, etc.).</li>
        <li>Control y monitoreo de entradas y salidas de miembros en tiempo real.</li>
        <li>Historial de actividad y eventos administrativos del grupo.</li>
        <li>Panel centralizado para la gestión de múltiples grupos vinculados.</li>
        <li>Visualización detallada del estado y configuración actual del bot en cada grupo.</li>
        <li>Comandos especiales de administración como <code>/panel</code>, <code>/grupos</code>, <code>/debug_grupos</code>.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Tecnología y arquitectura</h2>
      <p className="mb-4">
        JoinGroup ha sido desarrollado sobre tecnologías modernas y seguras. Utilizamos <strong>React</strong> para el frontend, <strong>Node.js y Telegram Bot API</strong> en el backend, y sistemas de persistencia basados en <strong>archivos JSON cifrados</strong> para almacenar los identificadores de grupos y configuraciones sin comprometer datos sensibles.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Orientación legal y cumplimiento</h2>
      <p className="mb-4">
        JoinGroup se compromete al cumplimiento normativo en materia de protección de datos y responsabilidad digital. No accedemos ni almacenamos contenido de los mensajes, ni recopilamos información privada de los miembros de los grupos. Toda la información registrada se limita a la configuración estructural del grupo y el ID del administrador responsable.
      </p>
      <p className="mb-4">
        Para más información, puedes consultar nuestra <a href="/privacidad" className="text-blue-600 underline">Política de Privacidad</a> y nuestros <a href="/terminos" className="text-blue-600 underline">Términos y Condiciones</a>.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Palabras clave: ¿para quién es JoinGroup?</h2>
      <p className="mb-4">
        JoinGroup está diseñado para <strong>administradores de grupos grandes</strong>, <strong>gestores de comunidades online</strong>, <strong>equipos de soporte en Telegram</strong>, <strong>proyectos educativos</strong>, <strong>organizaciones no gubernamentales</strong>, <strong>comunidades de código abierto</strong> y cualquier persona que desee <strong>optimizar la moderación y administración de su grupo en Telegram</strong>.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Ventajas competitivas</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>100% basado en la nube:</strong> no se requiere instalación de software.</li>
        <li><strong>Sin acceso a mensajes privados:</strong> máximo respeto a la privacidad de los miembros.</li>
        <li><strong>Fácil integración:</strong> solo debes invitar al bot y usar el comando <code>/panel</code>.</li>
        <li><strong>Diseño escalable:</strong> ideal para manejar decenas o cientos de grupos desde una sola interfaz.</li>
        <li><strong>Actualizaciones constantes:</strong> basado en feedback real de usuarios.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Desarrollo y visión futura</h2>
      <p className="mb-4">
        JoinGroup es un proyecto en evolución constante. Nuestra hoja de ruta incluye la implementación de nuevas funcionalidades como:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Estadísticas de participación y métricas grupales.</li>
        <li>Automatización de reglas y respuestas personalizadas.</li>
        <li>Integraciones con otras plataformas de mensajería y APIs externas.</li>
        <li>Soporte para múltiples administradores con diferentes roles.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Transparencia y soporte</h2>
      <p className="mb-4">
        Nuestra relación con los usuarios se basa en la transparencia. Publicamos nuestros cambios, escuchamos activamente las sugerencias de la comunidad y proporcionamos soporte técnico mediante correo electrónico. Si tienes preguntas, ideas o necesitas ayuda, no dudes en escribirnos.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Contacto</h2>
      <p className="mb-4">
        Puedes contactarnos en cualquier momento a través del correo <a href="mailto:contacto@joingroup.app" className="text-blue-600 underline">contacto@joingroup.app</a>.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Última revisión</h2>
      <p className="mb-4 text-sm text-gray-600">
        Este documento fue actualizado por última vez el 29 de junio de 2025. JoinGroup se reserva el derecho de modificar esta sección en función del desarrollo del proyecto o cambios legales aplicables.
      </p>
    </div>
  );
}
