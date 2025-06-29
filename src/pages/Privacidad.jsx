export default function Privacidad() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Política de privacidad</h1>
      <p className="mb-4">
        En JoinGroup, nos comprometemos a proteger tu privacidad y a garantizar el uso responsable de tus datos. Esta política detalla cómo recopilamos, almacenamos, usamos y compartimos tu información personal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Información recopilada</h2>
      <p className="mb-4">
        JoinGroup recopila únicamente la información necesaria para el funcionamiento del servicio. Esto incluye:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>ID de los grupos donde se ha instalado el bot.</li>
        <li>Configuración del grupo (nombre, descripción, permisos).</li>
        <li>ID y datos públicos del administrador que autoriza el bot.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Finalidad del tratamiento</h2>
      <p className="mb-4">
        La información recopilada se utiliza exclusivamente para ofrecer funcionalidades administrativas al usuario, personalizar la experiencia y garantizar la continuidad del servicio. No utilizamos los datos para fines comerciales, publicitarios ni de analítica externa.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Conservación de datos</h2>
      <p className="mb-4">
        Los datos serán conservados mientras el grupo mantenga activo el bot. El usuario podrá solicitar la eliminación de sus datos y la desvinculación del bot en cualquier momento, escribiendo a nuestro correo de contacto.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Compartición de datos</h2>
      <p className="mb-4">
        JoinGroup no comparte, vende ni transfiere la información recopilada a terceros. Solo se dará acceso a la información cuando sea requerido por ley o mediante autorización expresa del usuario.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Seguridad</h2>
      <p className="mb-4">
        Implementamos medidas técnicas y organizativas para proteger la información contra accesos no autorizados, alteraciones o destrucción. Sin embargo, ningún sistema es completamente infalible, por lo que no podemos garantizar la seguridad absoluta.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Derechos del usuario</h2>
      <p className="mb-4">
        Como titular de los datos, el usuario tiene derecho a acceder, rectificar, eliminar o limitar el uso de su información. Para ejercer estos derechos, puede enviar una solicitud a <a href="mailto:privacidad@joingroup.app" className="text-blue-600 underline">privacidad@joingroup.app</a>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Cambios en la política</h2>
      <p className="mb-4">
        JoinGroup se reserva el derecho de modificar esta política de privacidad en cualquier momento. En caso de cambios sustanciales, se notificará a los usuarios mediante la plataforma.
      </p>

      <p className="mt-6 text-sm text-gray-600">
        Última actualización: junio 2025.
      </p>
    </div>
  );
}
