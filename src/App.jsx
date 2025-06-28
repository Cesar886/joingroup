import '@mantine/core/styles.css';
import { Container } from '@mantine/core';
import { Header } from './components/Header';
import TableSort from './components/TableSort';
import GroupForm from './components/GroupForm';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Container size="md" py="xl">
        <Routes>
          <Route path="/" element={<TableSort />} />
          <Route path="/form" element={<GroupForm />} />
          {/* <Route path="/list" element={<GroupList />} /> */}
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
