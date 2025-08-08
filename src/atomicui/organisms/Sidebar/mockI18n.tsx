// mockI18n.ts
import type { i18n, TFunction } from 'i18next';

const tMock = ((key: string, options?: Record<string, any>) => {
  // Simple key echo + optional interpolation e.g. hello_name -> "hello name" when { name }
  let result = key;
  if (options) {
    Object.entries(options).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
    });
  }
  return result as any;
}) as unknown as TFunction;

const i18nMock: Partial<i18n> = {
  t: tMock,
  changeLanguage: async () => tMock as TFunction,
  language: 'en',
  on: () => i18nMock as any,
  off: () => i18nMock as any,
};

export default i18nMock as i18n;
