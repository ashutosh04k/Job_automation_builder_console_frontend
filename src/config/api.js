// Centralized API Base URL configuration
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'https://resume-backend-api-pvx4.onrender.com';

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
