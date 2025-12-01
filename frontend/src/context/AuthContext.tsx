import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  loading: boolean; // Novo campo
  user: any;
  login: (token: string) => void;
  logout: () => void;
  checkProfileStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Inicia como true
  const navigate = useNavigate();

  const checkProfileStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setIsProfileComplete(false);
      setUser(null);
      setLoading(false); // Parar loading
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Busca status
      const response = await api.get('/users/me/status');
      setIsAuthenticated(true);
      setIsProfileComplete(response.data.is_profile_complete);

      // Busca dados do usuário
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);

    } catch (error) {
      console.error("Erro ao verificar status:", error);
      logout();
    } finally {
      setLoading(false); // Sempre parar o loading no final
    }
  }, []);

  useEffect(() => {
    checkProfileStatus();
  }, [checkProfileStatus]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setLoading(true); // Ativa loading ao logar
    setIsAuthenticated(true);
    checkProfileStatus().then(() => {
        navigate('/');
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsProfileComplete(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isProfileComplete, loading, user, login, logout, checkProfileStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
