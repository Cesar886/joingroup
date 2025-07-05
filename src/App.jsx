import '@mantine/core/styles.css';
import { Container } from '@mantine/core';
import { Header } from './components/Header';
import { HashRouter } from 'react-router-dom';
import Footer from './pages/Footer';
import AppRoutes from './routes/AppRoutes'; 
import { HelmetProvider } from 'react-helmet-async';


export default function App() {
  return (
  <HelmetProvider>
    <HashRouter basename="/">
        <Header />
        <Container px="md" py="xl">
          <AppRoutes />
        </Container>
        <Footer />
    </HashRouter>
  </HelmetProvider>
  );
}
