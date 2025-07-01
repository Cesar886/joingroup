import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationES from '../locales/es/translation.json';
import translationEN from '../locales/en/translation.json';

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN },
};

// Lee el idioma guardado en sessionStorage si existe
const savedLang = sessionStorage.getItem('lang');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'es', // usa idioma guardado o español por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
