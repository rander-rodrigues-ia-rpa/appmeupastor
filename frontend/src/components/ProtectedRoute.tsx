import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Adicionamos 'loading' que vamos criar no AuthContext
  const { isAuthenticated, isProfileComplete, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto verifica o token, mostre um loading para não redirecionar errado
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 2. Se não estiver logado, manda pro login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se o perfil não estiver completo E o usuário NÃO estiver na página de cadastro
  if (!isProfileComplete && location.pathname !== "/meu-cadastro") {
    return <Navigate to="/meu-cadastro" replace />;
  }

  // 4. Se o perfil JÁ estiver completo e o usuário tentar acessar /meu-cadastro
  // Opcional: redirecionar para dashboard para evitar acesso desnecessário
  if (isProfileComplete && location.pathname === "/meu-cadastro") {
     return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
