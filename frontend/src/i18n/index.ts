import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import am from './locales/am.json';
import om from './locales/om.json';

const resources = {
  en: { translation: en },
  am: { translation: am },
  om: { translation: om },
};

// Get saved language from localStorage or default to 'en'
const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: savedLang || 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
