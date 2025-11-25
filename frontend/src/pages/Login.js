import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            // Troca o código por um token JWT
            api.get(`/auth/google/callback?code=${code}`)
                .then(response => {
                const { access_token } = response.data;
                login(access_token);
            })
                .catch(error => {
                console.error("Erro ao fazer login com o Google:", error);
                // Redireciona de volta para a página de login em caso de erro
                navigate("/login");
            });
        }
    }, [searchParams, login, navigate]);
    const handleGoogleLogin = () => {
        // Redireciona para a URL de autorização do Google no backend
        window.location.href = "http://localhost:8000/auth/google/login";
    };
    return (_jsx("div", { className: "flex items-center justify-center h-screen bg-gray-200", children: _jsxs("div", { className: "p-8 bg-white rounded-lg shadow-md text-center", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "App Meu Pastor" }), _jsx("p", { className: "mb-6", children: "Fa\u00E7a login para continuar" }), _jsx("button", { onClick: handleGoogleLogin, className: "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors", children: "Entrar com Google" })] }) }));
};
export default Login;
