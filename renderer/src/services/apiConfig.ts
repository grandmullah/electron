// Centralized API configuration for the renderer app
// Update these values to point all services to the same backend

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

// Choose your environment: 'local' | 'remote'
const ENVIRONMENT = 'remote'; // ← Using 'remote' (working backend with all API keys)

// API Keys (these work on the REMOTE server at 64.227.130.74:8007)
const API_KEYS = {
      web: 'bz_web_9c755d5167055bc668a18d78432ab6f73a8b88f20bbc883ae0743ff0b644a9b3',
      mobile: 'bz_mobile_def2137c0254d169d4bb28cdbfa77f10de1b9fa12f1b66217524f61edc33bd79',
      admin: 'bz_admin_931d890acd68cfe89cde00b027f5d2eb700b6c29fcc7106597865cb06ff7384b',
};

// Environment-specific configuration
const ENVIRONMENTS = {
      local: {
            url: 'http://localhost:8000/api',
            apiKey: API_KEYS.admin, // Same key works for local after DB setup
      },
      remote: {
            url: 'https://api.betzone.co/api',
            apiKey: API_KEYS.admin, // Using admin key for agent application
      },
      staging: {
            url: 'https://api-v1.betzone.co/api',
            apiKey: API_KEYS.admin, // Using admin key for agent application
      },
};

// Select configuration based on environment
const selectedConfig = ENVIRONMENTS[ENVIRONMENT];

export const API_BASE_URL = selectedConfig.url;
export const API_KEY = process.env['REACT_APP_API_KEY'] || selectedConfig.apiKey;

// Helper function to get common headers for API requests
export const getApiHeaders = (includeAuth: boolean = true): Record<string, string> => {
      const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
      };

      if (includeAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                  headers['Authorization'] = `Bearer ${token}`;
            }
      }

      return headers;
};

// Optionally, expose a helper to build URLs
export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

// Export apiConfig object for services that need it
export const apiConfig = {
      baseURL: API_BASE_URL,
      baseUrl: API_BASE_URL,  // Add both for compatibility
      apiKey: API_KEY,
      getHeaders: getApiHeaders,
};

