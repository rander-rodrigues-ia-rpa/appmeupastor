import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const checkProfileStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setIsProfileComplete(false);
            setUser(null);
            return;
        }
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/users/me/status');
            const status = response.data;
            setIsAuthenticated(true);
            setIsProfileComplete(status.is_profile_complete);
            // Opcional: buscar dados completos do usuário
            const userResponse = await api.get('/users/me');
            setUser(userResponse.data);
        }
        catch (error) {
            console.error("Erro ao verificar status do perfil:", error);
            // Se o token for inválido ou expirado, desloga
            logout();
        }
    }, []);
    useEffect(() => {
        checkProfileStatus();
    }, [checkProfileStatus]);
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        checkProfileStatus(); // Verifica o status do perfil após o login
        navigate('/');
    };
    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setUser(null);
        navigate('/login');
    };
    return (_jsx(AuthContext.Provider, { value: { isAuthenticated, isProfileComplete, user, login, logout, checkProfileStatus }, children: children }));
};
