import { Routes, Route } from 'react-router-dom';
import TableSort from '../components/TableSort';
import GroupForm from '../components/GroupForm';
import GroupDetail from '../pages/GrupoDetails';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TableSort />} />
      <Route path="/form" element={<GroupForm />} />
      <Route path="/grupo/:id" element={<GroupDetail />} />
    </Routes>
  );
}
