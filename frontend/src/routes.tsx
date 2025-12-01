import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import MeuCadastro from "./pages/MeuCadastro";
import Temas from "./pages/Temas";
import Esbocos from "./pages/Esbocos";
import VersiculosPorTema from "./pages/VersiculosPorTema";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";




const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
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
