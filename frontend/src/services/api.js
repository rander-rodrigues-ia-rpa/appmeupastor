import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:8000', // URL base do backend FastAPI
});
// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Interceptor para lidar com erros de autenticação
api.interceptors.response.use((response) => response, (error) => {
    const originalRequest = error.config;
    // Se for erro 401 (Não Autorizado) e não for a rota de login
    if (error.response.status === 401 && originalRequest.url !== '/auth/google/callback') {
        // Força o logout
        localStorage.removeItem('token');
        // Redireciona para a página de login (o AuthProvider fará isso)
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export default api;
