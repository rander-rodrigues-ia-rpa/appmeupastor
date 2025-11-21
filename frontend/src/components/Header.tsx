import { useAuth } from "../hooks/useAuth";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <h1 className="text-xl font-semibold text-green-700">App Meu Pastor</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 hidden sm:inline">{user?.nome || user?.email}</span>
        <UserCircleIcon className="h-8 w-8 text-green-600" />
      </div>
    </header>
  );
};

export default Header;
