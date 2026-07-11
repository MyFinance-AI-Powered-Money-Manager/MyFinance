const getEnv = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (!value && import.meta.env.DEV) {
    console.warn(`Configuration Warning: Environment variable "${key}" is not defined.`);
  }
  return value || defaultValue;
};

export const config = {
  apiUrl: getEnv('VITE_API_URL'),
  appName: getEnv('VITE_APP_NAME', 'MyFinance'),
  appVersion: getEnv('VITE_APP_VERSION', '1.0.0'),
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  aiApiUrl: getEnv('VITE_AI_API_URL'),
  aiServiceKey: getEnv('VITE_AI_SERVICE_KEY'),
  scanEndpoint: getEnv('VITE_SCAN_ENDPOINT', 'ocr'),
  streamlitUrl: getEnv('VITE_STREAMLIT_URL'),

  overbudgetEndpoint: getEnv('VITE_OVERBUDGET_ENDPOINT'),
  useTransactionCachePatch: import.meta.env.VITE_USE_TRANSACTION_CACHE_PATCH !== 'false',
};

// Validasi konfigurasi krusial pada saat runtime
if (!config.apiUrl) {
  console.error(
    'CRITICAL CONFIGURATION ERROR: VITE_API_URL is missing. Please define it in your environment variables (.env).'
  );
}
