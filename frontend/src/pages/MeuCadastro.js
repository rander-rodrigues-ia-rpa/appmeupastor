import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { UserCircleIcon } from "@heroicons/react/24/solid";
const MeuCadastro = () => {
    const { user, checkProfileStatus } = useAuth();
    const [formData, setFormData] = useState({
        nome: "",
        username: "",
        email: "",
        telefone_contato: "",
        perfil_usuario: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome || "",
                username: user.username || "",
                email: user.email || "",
                telefone_contato: user.telefone_contato || "",
                perfil_usuario: user.perfil_usuario || "",
            });
        }
    }, [user]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const endpoint = user?.is_profile_complete === "N"
                ? "/users/me/complete-profile"
                : "/users/me"; // Se já completo, pode ser uma rota de atualização geral
            // Filtra campos que não podem ser atualizados ou que são nulos
            const dataToSend = {
                nome: formData.nome,
                username: formData.username,
                telefone_contato: formData.telefone_contato,
                perfil_usuario: formData.perfil_usuario,
                // O email não deve ser alterado
            };
            const response = await api.put(endpoint, dataToSend);
            setMessage({ type: 'success', text: "Cadastro atualizado com sucesso!" });
            // Atualiza o status do perfil no contexto se for a rota de completar
            if (user?.is_profile_complete === "N") {
                await checkProfileStatus();
            }
        }
        catch (error) {
            const errorMessage = error.response?.data?.detail || "Erro ao atualizar o cadastro.";
            setMessage({ type: 'error', text: errorMessage });
        }
        finally {
            setLoading(false);
        }
    };
    const isProfileComplete = user?.is_profile_complete === "S";
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Meu Cadastro" }), !isProfileComplete && (_jsxs("div", { className: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6", role: "alert", children: [_jsx("p", { className: "font-bold", children: "Aten\u00E7\u00E3o!" }), _jsx("p", { children: "Seu cadastro est\u00E1 incompleto. Por favor, preencha os campos obrigat\u00F3rios (Telefone e Perfil) para acessar todas as funcionalidades do sistema." })] })), message && (_jsx("div", { className: `p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`, children: message.text })), _jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsx(UserCircleIcon, { className: "h-16 w-16 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-xl font-semibold", children: user?.nome }), _jsx("p", { className: "text-gray-500", children: user?.email })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "nome", className: "block text-sm font-medium text-gray-700", children: "Nome" }), _jsx("input", { type: "text", name: "nome", id: "nome", value: formData.nome, onChange: handleChange, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700", children: "Nome de Usu\u00E1rio" }), _jsx("input", { type: "text", name: "username", id: "username", value: formData.username, onChange: handleChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "telefone_contato", className: "block text-sm font-medium text-gray-700", children: ["Telefone de Contato ", isProfileComplete ? '' : '*'] }), _jsx("input", { type: "text", name: "telefone_contato", id: "telefone_contato", value: formData.telefone_contato, onChange: handleChange, required: !isProfileComplete, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "perfil_usuario", className: "block text-sm font-medium text-gray-700", children: ["Perfil de Usu\u00E1rio ", isProfileComplete ? '' : '*'] }), _jsxs("select", { name: "perfil_usuario", id: "perfil_usuario", value: formData.perfil_usuario, onChange: handleChange, required: !isProfileComplete, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500", children: [_jsx("option", { value: "", children: "Selecione um perfil" }), _jsx("option", { value: "Pastor", children: "Pastor" }), _jsx("option", { value: "Lider", children: "L\u00EDder" }), _jsx("option", { value: "Outro", children: "Outro" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50", children: loading ? "Salvando..." : "Salvar Alterações" })] })] }));
};
export default MeuCadastro;
