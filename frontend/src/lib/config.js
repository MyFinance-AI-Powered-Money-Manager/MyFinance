
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  aiApiUrl: import.meta.env.VITE_AI_API_URL,
  aiServiceKey: import.meta.env.VITE_AI_SERVICE_KEY,
  scanEndpoint: import.meta.env.VITE_SCAN_ENDPOINT,

  overbudgetEndpoint: import.meta.env.VITE_OVERBUDGET_ENDPOINT,
  useTransactionCachePatch: import.meta.env.VITE_USE_TRANSACTION_CACHE_PATCH !== 'false',
};
