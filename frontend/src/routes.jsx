import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./context/AuthContext";

// Importe seus componentes (garanta que os caminhos estejam certos)
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import MeuCadastro from "./pages/MeuCadastro";
import Temas from "./pages/Temas";
import Esbocos from "./pages/Esbocos";
import VersiculosPorTema from "./pages/VersiculosPorTema";
import Login from "./pages/Login";

// Componente de Rota Protegida
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isProfileComplete, loading } = useAuth();

    // Se estiver carregando a verificação de auth, pode mostrar um loading
    if (loading) return <div>Carregando...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário logou mas não completou cadastro
    if (!isProfileComplete && children.type !== MeuCadastro) {
        return <Navigate to="/meu-cadastro" replace />;
    }

    return children;
};

// Definição das Rotas usando a API moderna (createBrowserRouter)
const router = createBrowserRouter([
    // Coloca o AuthProvider dentro do Router: assim hooks como useNavigate
    // podem ser usados pelo próprio provider.
    {
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/",
                // Protege todo o Layout Principal
                element: (
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                ),
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
        ],
    },
]);

export default router;