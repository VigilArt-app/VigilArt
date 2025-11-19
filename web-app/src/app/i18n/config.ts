import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { getCookie } from '../cookies';

const initI18n = async () => {
  const savedLanguage = typeof window !== 'undefined' ? getCookie('language') : null;

  if (!i18n.isInitialized) {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        lng: savedLanguage || 'fr',
        supportedLngs: ['en', 'fr'],
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          escapeValue: false
        },
        backend: {
          loadPath: '/locales/{{lng}}/translation.json'
        },
        react: {
          useSuspense: true
        }
      });
  }

  return i18n;
};

export default initI18n;