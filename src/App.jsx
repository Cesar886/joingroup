// App.jsx
import '@mantine/core/styles.css';
import { useState } from 'react';
import {
  MantineProvider,
  Container,
  localStorageColorSchemeManager,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/Header';
import Footer from './pages/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';
import ThemeToggle from './components/ThemeToggle';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const colorSchemeManager = localStorageColorSchemeManager();

export default function App() {
  const [colorScheme, setColorScheme] = useState(colorSchemeManager.get());

  const toggleColorScheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    colorSchemeManager.set(next); // ¡Asegura persistencia!
  };

  return (
    <MantineProvider
      defaultColorScheme={colorScheme}
      theme={{ colorScheme }}
      colorSchemeManager={colorSchemeManager}
    >
      <ModalsProvider>
        <Notifications position="top-right" zIndex={1000} />
        <HelmetProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Container px="md" py="xl">
              <AppRoutes />
            </Container>
            <Footer />
            <ThemeToggle
              colorScheme={colorScheme}
              toggleColorScheme={toggleColorScheme}
            />
          </BrowserRouter>
        </HelmetProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
