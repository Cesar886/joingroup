import '@mantine/core/styles.css';
import { Container } from '@mantine/core';
import { Header } from './components/Header';
import { HashRouter } from 'react-router-dom';
import Footer from './pages/Footer';
import AppRoutes from './routes/AppRoutes'; 


export default function App() {
  return (
  <HashRouter basename="/">
      <Header />
      <Container size="md" py="xl">
        <AppRoutes />
      </Container>
      <Footer />
  </HashRouter>
  );
}
