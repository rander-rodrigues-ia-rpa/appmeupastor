import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import api from "../services/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
const VersiculosPorTema = () => {
    const [versiculos, setVersiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchVersiculos = async () => {
        try {
            const response = await api.get("/versiculos");
            setVersiculos(response.data);
            setLoading(false);
        }
        catch (err) {
            setError("Erro ao carregar versículos.");
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchVersiculos();
    }, []);
    const handleDeleteVersiculo = async (id) => {
        if (!window.confirm("Tem certeza que deseja deletar este versículo?"))
            return;
        try {
            await api.delete(`/versiculos/${id}`);
            setVersiculos(versiculos.filter(v => v.id !== id));
        }
        catch (err) {
            alert("Erro ao deletar versículo.");
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center", children: "Carregando vers\u00EDculos..." });
    if (error)
        return _jsx("div", { className: "text-center text-red-500", children: error });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800", children: "Vers\u00EDculos por Tema" }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { 
                    // Ação de abrir modal ou redirecionar para formulário de criação
                    className: "flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-5 w-5 mr-2" }), " Novo Vers\u00EDculo"] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Meus Vers\u00EDculos" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Vers\u00EDculo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Descri\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: versiculos.map((versiculo) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: versiculo.versiculo }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: versiculo.descricao_versiculo }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { 
                                                        // Ação de editar
                                                        className: "text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 mr-2", title: "Editar Vers\u00EDculo", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleDeleteVersiculo(versiculo.id), className: "text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100", title: "Deletar Vers\u00EDculo", children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] })] }, versiculo.id))) })] }) })] })] }));
};
export default VersiculosPorTema;
