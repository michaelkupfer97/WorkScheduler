import axios from 'axios';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? (window as any).__API_BASE_URL__ : undefined) ||
  '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('tokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const tokens = localStorage.getItem('tokens');
        if (!tokens) throw new Error('No tokens');

        const { refreshToken } = JSON.parse(tokens);
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newTokens = res.data.tokens;

        localStorage.setItem('tokens', JSON.stringify(newTokens));
        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
