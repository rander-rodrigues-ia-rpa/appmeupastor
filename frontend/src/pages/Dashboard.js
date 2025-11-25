import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import IndicatorCard from "../components/IndicatorCard";
import api from "../services/api";
import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/solid";
const Dashboard = () => {
    const [indicators, setIndicators] = useState({
        quantidade_esbocos: 0,
        quantidade_versiculos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        setLoading(true);
        api.get("/dashboard/indicators")
            .then(response => {
            // A API retorna um objeto com 'data' que é uma string JSON se vier do cache
            const data = typeof response.data.data === 'string'
                ? JSON.parse(response.data.data)
                : response.data.data;
            setIndicators(data);
            setLoading(false);
        })
            .catch(err => {
            console.error("Erro ao buscar indicadores:", err);
            setError("Não foi possível carregar os indicadores do dashboard.");
            setLoading(false);
        });
    }, []);
    if (loading) {
        return _jsx("div", { className: "text-center text-gray-500", children: "Carregando Dashboard..." });
    }
    if (error) {
        return _jsx("div", { className: "text-center text-red-500", children: error });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsx(IndicatorCard, { title: "Quantidade de Esbo\u00E7os", value: indicators.quantidade_esbocos, icon: BookOpenIcon }), _jsx(IndicatorCard, { title: "Vers\u00EDculos por Tema", value: indicators.quantidade_versiculos, icon: BookmarkIcon })] })] }));
};
export default Dashboard;
