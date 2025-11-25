import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import api from "../services/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
const Temas = () => {
    const [temas, setTemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTema, setNewTema] = useState("");
    const [editingTema, setEditingTema] = useState(null);
    const fetchTemas = async () => {
        try {
            const response = await api.get("/temas");
            setTemas(response.data);
            setLoading(false);
        }
        catch (err) {
            setError("Erro ao carregar temas.");
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTemas();
    }, []);
    const handleCreateTema = async () => {
        if (!newTema.trim())
            return;
        try {
            const response = await api.post("/temas", { descricao: newTema });
            setTemas([...temas, response.data]);
            setNewTema("");
        }
        catch (err) {
            alert("Erro ao criar tema.");
        }
    };
    const handleUpdateTema = async () => {
        if (!editingTema || !editingTema.descricao.trim())
            return;
        try {
            const response = await api.put(`/temas/${editingTema.id}`, {
                descricao: editingTema.descricao,
                ativo: editingTema.ativo
            });
            setTemas(temas.map(t => (t.id === editingTema.id ? response.data : t)));
            setEditingTema(null);
        }
        catch (err) {
            alert("Erro ao atualizar tema.");
        }
    };
    const handleDeleteTema = async (id) => {
        if (!window.confirm("Tem certeza que deseja deletar este tema? Todos os subtemas, esboços e versículos relacionados serão afetados."))
            return;
        try {
            await api.delete(`/temas/${id}`);
            setTemas(temas.filter(t => t.id !== id));
        }
        catch (err) {
            alert("Erro ao deletar tema.");
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center", children: "Carregando temas..." });
    if (error)
        return _jsx("div", { className: "text-center text-red-500", children: error });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800", children: "Cadastro de Temas e Sub-Temas" }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Novo Tema" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("input", { type: "text", placeholder: "Descri\u00E7\u00E3o do novo tema", value: newTema, onChange: (e) => setNewTema(e.target.value), className: "flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" }), _jsxs("button", { onClick: handleCreateTema, className: "flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-5 w-5 mr-2" }), " Criar"] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Temas Existentes" }), _jsx("ul", { className: "divide-y divide-gray-200", children: temas.map((tema) => (_jsxs("li", { className: "py-4 flex justify-between items-center", children: [editingTema?.id === tema.id ? (_jsxs("div", { className: "flex-1 flex space-x-2", children: [_jsx("input", { type: "text", value: editingTema.descricao, onChange: (e) => setEditingTema({ ...editingTema, descricao: e.target.value }), className: "flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" }), _jsxs("select", { value: editingTema.ativo, onChange: (e) => setEditingTema({ ...editingTema, ativo: e.target.value }), className: "rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500", children: [_jsx("option", { value: "S", children: "Ativo" }), _jsx("option", { value: "N", children: "Inativo" })] }), _jsx("button", { onClick: handleUpdateTema, className: "bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600", children: "Salvar" }), _jsx("button", { onClick: () => setEditingTema(null), className: "bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600", children: "Cancelar" })] })) : (_jsxs("span", { className: `flex-1 ${tema.ativo === 'N' ? 'line-through text-gray-500' : ''}`, children: [tema.descricao, " (", tema.ativo === 'S' ? 'Ativo' : 'Inativo', ")"] })), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { onClick: () => setEditingTema(tema), className: "text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100", title: "Editar Tema", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleDeleteTema(tema.id), className: "text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100", title: "Deletar Tema", children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] })] }, tema.id))) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Gerenciamento de Sub-Temas" }), _jsx("p", { className: "text-gray-600", children: "Para gerenciar sub-temas, voc\u00EA precisaria de um modal ou uma tela de detalhes do tema. Por enquanto, a API de subtemas est\u00E1 pronta, mas a interface ser\u00E1 simplificada." })] })] }));
};
export default Temas;
