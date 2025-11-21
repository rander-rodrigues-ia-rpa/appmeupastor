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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Erro ao atualizar o cadastro.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = user?.is_profile_complete === "S";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Cadastro</h2>
      
      {!isProfileComplete && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Atenção!</p>
          <p>Seu cadastro está incompleto. Por favor, preencha os campos obrigatórios (Telefone e Perfil) para acessar todas as funcionalidades do sistema.</p>
        </div>
      )}

      {message && (
        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-6">
        <UserCircleIcon className="h-16 w-16 text-green-600" />
        <div>
          <p className="text-xl font-semibold">{user?.nome}</p>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            name="nome"
            id="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="telefone_contato" className="block text-sm font-medium text-gray-700">Telefone de Contato {isProfileComplete ? '' : '*'}</label>
          <input
            type="text"
            name="telefone_contato"
            id="telefone_contato"
            value={formData.telefone_contato}
            onChange={handleChange}
            required={!isProfileComplete}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="perfil_usuario" className="block text-sm font-medium text-gray-700">Perfil de Usuário {isProfileComplete ? '' : '*'}</label>
          <select
            name="perfil_usuario"
            id="perfil_usuario"
            value={formData.perfil_usuario}
            onChange={handleChange}
            required={!isProfileComplete}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">Selecione um perfil</option>
            <option value="Pastor">Pastor</option>
            <option value="Lider">Líder</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default MeuCadastro;
