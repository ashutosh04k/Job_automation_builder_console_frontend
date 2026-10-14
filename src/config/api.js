// Centralized API Base URL configuration & Authenticated Fetch Helper
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'https://resume-backend-api-pvx4.onrender.com';

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Universal authenticated fetch helper
 * Automatically injects JWT Bearer token from localStorage
 */
export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('autoresume_token');
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set application/json only if body is not FormData and not already set
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : apiUrl(endpoint);
  return fetch(url, { ...options, headers });
};
