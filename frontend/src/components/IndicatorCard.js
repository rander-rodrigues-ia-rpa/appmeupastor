import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const IndicatorCard = ({ title, value, icon: Icon }) => {
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-[1.02]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: title }), _jsx("p", { className: "text-3xl font-bold text-green-700 mt-1", children: value })] }), _jsx("div", { className: "p-3 bg-green-100 rounded-full", children: _jsx(Icon, { className: "h-8 w-8 text-green-600" }) })] }));
};
export default IndicatorCard;
