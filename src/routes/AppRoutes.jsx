import { Routes, Route } from 'react-router-dom';
import TableSort from '../components/TableSort';
import GroupForm from '../components/GroupForm';
import GroupDetail from '../pages/GrupoDetails';
import AdminGroups from '../pages/AdminGroups';
import NotFoundImage from '../pages/404';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TableSort />} />
      <Route path="/form" element={<GroupForm />} />
      <Route path="/grupo/:id" element={<GroupDetail />} />
      <Route path="/admin" element={<AdminGroups />} />

      <Route path="*" element={<NotFoundImage />} />


    </Routes>
  );
}
