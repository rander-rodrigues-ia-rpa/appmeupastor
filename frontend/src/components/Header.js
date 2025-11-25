import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
import { UserCircleIcon } from "@heroicons/react/24/solid";
const Header = () => {
    const { user } = useAuth();
    return (_jsxs("header", { className: "flex items-center justify-between p-4 bg-white shadow-md", children: [_jsx("h1", { className: "text-xl font-semibold text-green-700", children: "App Meu Pastor" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-gray-700 hidden sm:inline", children: user?.nome || user?.email }), _jsx(UserCircleIcon, { className: "h-8 w-8 text-green-600" })] })] }));
};
export default Header;
