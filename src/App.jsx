import '@mantine/core/styles.css';
import { Container } from '@mantine/core';
import { Header } from './components/Header';
import { HashRouter } from 'react-router-dom';
import Footer from './pages/Footer';
import AppRoutes from './routes/AppRoutes'; 
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function App() {
  return (
  <HelmetProvider>
    <HashRouter basename="/">
      <ScrollToTop />
        <Header />
        <Container px="md" py="xl">
          <AppRoutes />
        </Container>
        <Footer />
    </HashRouter>
  </HelmetProvider>
  );
}
