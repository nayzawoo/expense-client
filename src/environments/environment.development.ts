export const environment = {
  production: false,
  /** Empty = same-origin via `proxy.conf.json` → local expense-api (default http://localhost:8080). */
  apiBaseUrl: '',
  defaultLanguage: 'en' as 'en' | 'my',
};
