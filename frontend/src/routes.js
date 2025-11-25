import { jsx as _jsx } from "react/jsx-runtime";
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
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isProfileComplete } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Se o usuário estiver autenticado, mas o perfil não estiver completo,
    // redireciona para a página de cadastro para completar.
    if (!isProfileComplete && children.type !== MeuCadastro) {
        return _jsx(Navigate, { to: "/meu-cadastro", replace: true });
    }
    return children;
};
const router = createBrowserRouter([
    {
        path: "/login",
        element: _jsx(Login, {}),
    },
    {
        path: "/",
        element: _jsx(ProtectedRoute, { children: _jsx(AppLayout, {}) }),
        children: [
            {
                index: true,
                element: _jsx(Dashboard, {}),
            },
            {
                path: "meu-cadastro",
                element: _jsx(MeuCadastro, {}),
            },
            {
                path: "temas",
                element: _jsx(Temas, {}),
            },
            {
                path: "esbocos",
                element: _jsx(Esbocos, {}),
            },
            {
                path: "versiculos-por-tema",
                element: _jsx(VersiculosPorTema, {}),
            },
        ],
    },
    {
        path: "*",
        element: _jsx(Navigate, { to: "/", replace: true }),
    },
]);
export default router;
