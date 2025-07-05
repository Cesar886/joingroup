// src/components/ScrollToTop.jsx
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lleva el scroll al inicio cada vez que cambia la ubicación.
 * Funciona también cuando vuelves a la misma ruta (“/”)
 * porque usamos location.key como dependencia.
 */
export default function ScrollToTop() {
  const location = useLocation();            // { pathname, hash, key, … }

  useLayoutEffect(() => {
    // 1 – desactiva la restauración automática del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2 – desplaza la ventana (o el contenedor, si lo usas) al comienzo
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    /* ------------------------------------------------------------------
     * Si tu “home” está dentro de un ScrollArea de Mantine u otro contenedor
     * con overflow, usa esto en vez del window.scrollTo:
     *
     * const area = document.querySelector('[data-scrollable="main"]');
     * area?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
     * ------------------------------------------------------------------*/
  }, [location.key]);                         // clave única por navegación

  return null;
}
