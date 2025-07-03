import { Routes, Route } from 'react-router-dom';
import TableSort from '../components/TableSort';
import GroupForm from '../components/GroupForm';
import GroupDetail from '../pages/GrupoDetails';
import AdminGroups from '../pages/AdminGroups';
import Home from '../components/Home';
import NotFoundImage from '../pages/404';

import Telegram from '../pages/Telegram';
import Whatsapp from '../pages/Whatsapp';

import Terminos from '../pages/Terminos';
import Privacidad from '../pages/Privacidad';
import Acerca from '../pages/Acerca';

import HowToCreateTelegramGroup from '../pages/HowToCreateTelegramGroup';
import InstruccionesCrearGrupoTelegram from '../pages/InstruccionesCrearGrupoTelegram';

// Gaming the routes for the application
import Clanes from '../pagesGaming/TableSort';
import GroupDetailClanes from '../pagesGaming/GrupoDetails';
import ClashRoyale from '../pagesGaming/ClanClashRoyale';
import ClanesGroupForm from '../pagesGaming/ClanesGroupForm';
import ClashOfClans from '../pagesGaming/ClanClashOfClans';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/comunidades" element={<TableSort />} />
      <Route path="/comunidades/form" element={<GroupForm />} />
      <Route path="/comunidades/grupos-de-telegram" element={<Telegram />} />
      <Route path="/comunidades/grupos-de-whatsapp" element={<Whatsapp />} />
      <Route path="/comunidades/grupos-de-telegram/:id" element={<GroupDetail />} />
      <Route path="/comunidades/grupos-de-whatsapp/:id" element={<GroupDetail />} />
      <Route path="/admin" element={<AdminGroups />} />

      <Route path="/clanes" element={<Clanes />} />
      <Route path="/clanes/form" element={<ClanesGroupForm />} />
      <Route path="/clanes/clanes-de-clash-royale" element={<ClashRoyale />} />
      <Route path="/clanes/clanes-de-clash-of-clans" element={<ClashOfClans />} />
      <Route path="/clanes/clanes-de-clash-of-clans/:id" element={<GroupDetailClanes />} />
      <Route path="/clanes/clanes-de-clash-royale/:id" element={<GroupDetailClanes />} />

      {/* Additional routes for terms, privacy, and about pages */}

      <Route path="/terminos" element={<Terminos />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/acerca" element={<Acerca />} />

      <Route path="/comunidades/how-to-create-telegram-group" element={<HowToCreateTelegramGroup />} />
      <Route path="/comunidades/instrucciones-crear-grupo-telegram" element={<InstruccionesCrearGrupoTelegram />} />


      {/* Catch-all route for 404 Not Found */}

      <Route path="*" element={<NotFoundImage />} />


    </Routes>
  );
}
