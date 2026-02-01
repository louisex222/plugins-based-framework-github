import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resource from '@/i18n/resource'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    resources: resource,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
