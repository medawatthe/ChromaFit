import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || 'http://localhost:5000';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('chromafit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chromafit_token');
      localStorage.removeItem('chromafit_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function outfitImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return `${UPLOADS_BASE}${imageUrl}`;
}

export default client;
