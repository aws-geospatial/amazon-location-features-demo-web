// // _mocks_/@demo/locales/i18n.ts
// import { createInstance } from 'i18next';
// import resourcesToBackend from 'i18next-resources-to-backend';
// import { initReactI18next } from 'react-i18next';

// const i18n = createInstance();

// // Provide a minimal resource bundle so t() calls don’t throw
// i18n
//   .use(initReactI18next)
//   .use(
//     resourcesToBackend((lng: string, ns: string) =>
//       Promise.resolve({
//         hello: 'Hello (mock)',
//         test: 'Test (mock)',
//       })
//     )
//   )
//   .init({
//     lng: 'en',
//     fallbackLng: 'en',
//     ns: ['translation'],
//     defaultNS: 'translation',
//     interpolation: { escapeValue: false },
//   });

// export default i18n;
