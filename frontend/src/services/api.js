import axios from 'axios';

// Tenta pegar a URL do arquivo .env, se não existir, usa localhost como fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: baseURL,
});

// Interceptor: Adiciona o Token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor: Se der erro 401 (Sessão expirada), desloga o usuário
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        // Evita loop infinito se o erro for na rota de login ou callback
        if (error.response?.status === 401 && !originalRequest.url.includes('/auth/')) {
            localStorage.removeItem('token');
            // Redirecionamento forçado via window para garantir limpeza
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;