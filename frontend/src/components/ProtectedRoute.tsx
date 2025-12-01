import React, { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom"; // Adicione useLocation
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation(); // Hook para pegar a URL atual
  
  const isProfileComplete = user?.is_profile_complete === "S";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o perfil está incompleto E se o usuário JÁ NÃO ESTÁ na página de cadastro
  if (!isProfileComplete && location.pathname !== "/meu-cadastro") {
    return <Navigate to="/meu-cadastro" replace />;
  }

  // Se o perfil ESTIVER completo e o usuário tentar acessar a tela de cadastro manualmente,
  // você pode opcionalmente redirecionar para a home, ou deixar ele acessar.
  // if (isProfileComplete && location.pathname === "/meu-cadastro") {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
