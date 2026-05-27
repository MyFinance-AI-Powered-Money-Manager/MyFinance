
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://myfinance-backend-app.up.railway.app/api/v1',
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'https://myfinance.nya.je/api/v1',
  aiServiceKey: import.meta.env.VITE_AI_SERVICE_KEY || 'secret-antara-express-dan-python',
  scanEndpoint: import.meta.env.VITE_SCAN_ENDPOINT || 'ocr',
  streamlitUrl: import.meta.env.VITE_STREAMLIT_URL || 'https://myfinance-dashboard-cp.streamlit.app/',

  overbudgetEndpoint: import.meta.env.VITE_OVERBUDGET_ENDPOINT,
  useTransactionCachePatch: import.meta.env.VITE_USE_TRANSACTION_CACHE_PATCH !== 'false',
};
