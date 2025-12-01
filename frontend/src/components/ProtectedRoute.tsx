import React, { isValidElement, ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MeuCadastro from "../pages/MeuCadastro";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // A verificação de isProfileComplete deve ser feita usando o objeto user,
  // pois o estado isProfileComplete no AuthContext pode não estar atualizado
  // no momento da renderização inicial.
  const isProfileComplete = user?.is_profile_complete === "S";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, mas o perfil não estiver completo,
  // redireciona para a página de cadastro para completar.
  // Verifica se children é um elemento React válido antes de acessar .type
  // E garante que não está tentando redirecionar a própria página MeuCadastro
  if (!isProfileComplete && isValidElement(children) && children.type !== MeuCadastro) {
    return <Navigate to="/meu-cadastro" replace />;
  }

  return children;
};

export default ProtectedRoute;
