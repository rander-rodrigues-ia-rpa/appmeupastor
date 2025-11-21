import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import MeuCadastro from "./pages/MeuCadastro";
import Temas from "./pages/Temas";
import Esbocos from "./pages/Esbocos";
import VersiculosPorTema from "./pages/VersiculosPorTema";
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";

// Componente de Rota Protegida
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isProfileComplete } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, mas o perfil não estiver completo,
  // redireciona para a página de cadastro para completar.
  if (!isProfileComplete && children.type !== MeuCadastro) {
    return <Navigate to="/meu-cadastro" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "meu-cadastro",
        element: <MeuCadastro />,
      },
      {
        path: "temas",
        element: <Temas />,
      },
      {
        path: "esbocos",
        element: <Esbocos />,
      },
      {
        path: "versiculos-por-tema",
        element: <VersiculosPorTema />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
