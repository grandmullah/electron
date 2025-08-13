// Centralized API base URL for the renderer app
// Update this value to point all services to the same backend

export const API_BASE_URL = 'http://64.227.130.74:8007/api';

// Optionally, expose a helper to build URLs
export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;


