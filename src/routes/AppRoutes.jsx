import { Routes, Route } from 'react-router-dom';
import TableSort from '../components/TableSort';
import GroupForm from '../components/GroupForm';
import GroupDetail from '../pages/GrupoDetails';
import AdminGroups from '../pages/AdminGroups';
import NotFoundImage from '../pages/404';

import Telegram from '../pages/Telegram';
import Whatsapp from '../pages/Whatsapp';

import Terminos from '../pages/Terminos';
import Privacidad from '../pages/Privacidad';
import Acerca from '../pages/Acerca';

import HowToCreateTelegramGroup from '../pages/HowToCreateTelegramGroup';
import InstruccionesCrearGrupoTelegram from '../pages/InstruccionesCrearGrupoTelegram';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TableSort />} />
      <Route path="/form" element={<GroupForm />} />
      <Route path="/telegram" element={<Telegram />} />
      <Route path="/whatsapp" element={<Whatsapp />} />
      <Route path="/telegram/:id" element={<GroupDetail />} />
      <Route path="/whatsapp/:id" element={<GroupDetail />} />
      <Route path="/admin" element={<AdminGroups />} />

      <Route path="/terminos" element={<Terminos />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/acerca" element={<Acerca />} />

      <Route path="/how-to-create-telegram-group" element={<HowToCreateTelegramGroup />} />
      <Route path="/instrucciones-crear-grupo-telegram" element={<InstruccionesCrearGrupoTelegram />} />

      {/* Catch-all route for 404 Not Found */}

      <Route path="*" element={<NotFoundImage />} />


    </Routes>
  );
}
