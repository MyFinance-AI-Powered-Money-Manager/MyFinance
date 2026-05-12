const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:3000/api/v1'
  : 'https://myfinance-backend-production.up.railway.app/api/v1';

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || defaultApiUrl,
  appName: import.meta.env.VITE_APP_NAME || 'MyFinance',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  scanEndpoint: import.meta.env.VITE_SCAN_ENDPOINT || '',
  overbudgetEndpoint: import.meta.env.VITE_OVERBUDGET_ENDPOINT || '',
  // Toggle whether to patch transactions cache after create (useful for mock servers)
  useTransactionCachePatch: import.meta.env.VITE_USE_TRANSACTION_CACHE_PATCH !== 'false', 
};
