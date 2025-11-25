import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { HomeIcon, UserIcon, TagIcon, BookOpenIcon, BookmarkIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
const navItems = [
    { to: "/", icon: HomeIcon, label: "Dashboard" },
    { to: "/meu-cadastro", icon: UserIcon, label: "Meu Cadastro" },
    { to: "/temas", icon: TagIcon, label: "Temas" },
    { to: "/esbocos", icon: BookOpenIcon, label: "Esboços" },
    { to: "/versiculos-por-tema", icon: BookmarkIcon, label: "Versículos por Tema" },
];
const Sidebar = () => {
    const { logout } = useAuth();
    return (_jsxs("div", { className: "flex flex-col w-64 bg-green-800 text-white p-4 space-y-6", children: [_jsx("div", { className: "text-2xl font-bold text-center border-b border-green-700 pb-4", children: "Meu Pastor" }), _jsx("nav", { className: "flex-1 space-y-2", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `flex items-center space-x-3 p-2 rounded-lg transition-colors ${isActive ? "bg-green-600" : "hover:bg-green-700"}`, children: [_jsx(item.icon, { className: "h-6 w-6" }), _jsx("span", { children: item.label })] }, item.to))) }), _jsx("div", { className: "border-t border-green-700 pt-4", children: _jsxs("button", { onClick: logout, className: "flex items-center space-x-3 p-2 rounded-lg w-full text-left hover:bg-green-700 transition-colors", children: [_jsx(ArrowLeftStartOnRectangleIcon, { className: "h-6 w-6" }), _jsx("span", { children: "Logout (Sair)" })] }) })] }));
};
export default Sidebar;
