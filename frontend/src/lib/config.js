const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://myfinance-backend-staging.up.railway.app/api';

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://myfinance-backend-staging.up.railway.app/api',
  appName: import.meta.env.VITE_APP_NAME || 'MyFinance',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  scanEndpoint: import.meta.env.VITE_SCAN_ENDPOINT || '/scan',
  // Toggle whether to patch transactions cache after create (useful for mock servers)
  useTransactionCachePatch: import.meta.env.VITE_USE_TRANSACTION_CACHE_PATCH !== 'false',
};
