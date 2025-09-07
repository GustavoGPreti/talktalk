import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const supportedLanguages = ["pt", 'pt-BR', 'en-US', 'es-ES'];

const languageMap = {
  'pt': 'pt-BR',
  'pt-PT': 'pt-BR',
  'en': 'en-US', 
  'en-GB': 'en-US',
  'es': 'es-ES',
  'es-MX': 'es-ES'
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(resourcesToBackend((language, namespace, callback) => {
    let mappedLanguage = languageMap[language] || language;
    
    if (!supportedLanguages.includes(mappedLanguage)) {
      mappedLanguage = 'pt-BR';
    }
    
    import(`./app/locales/${mappedLanguage}/${namespace}.json`)
      .then((resources) => {
        callback(null, resources)
      })
      .catch((error) => {
        // Fallback to pt-BR if the requested language fails
        if (mappedLanguage !== 'pt-BR') {
          import(`./app/locales/pt-BR/${namespace}.json`)
            .then((resources) => {
              callback(null, resources)
            })
            .catch((fallbackError) => {
              callback(fallbackError, null)
            })
        } else {
          callback(error, null)
        }
      })
  }))  .init({
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: false,
    load: 'all',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      excludeCacheFor: ['cimode'],
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n;
