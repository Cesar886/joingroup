import '@mantine/core/styles.css';
import { Container } from '@mantine/core';
import { Header } from './components/Header';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes'; // Asegurate de que esta ruta sea correcta

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Container size="md" py="xl">
        <AppRoutes />
      </Container>
    </BrowserRouter>
  );
}
