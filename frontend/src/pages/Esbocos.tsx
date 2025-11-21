import { useState, useEffect } from "react";
import api from "../services/api";
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon } from "@heroicons/react/24/outline";

interface Esboco {
  id: number;
  titulo: string;
  texto_biblico: string;
  resumo: string;
  link_arquivo_esboco: string | null;
  link_arquivo_pregacao_completa: string | null;
  esboco_manual: string | null;
  tema_id: number;
  subtema_id: number | null;
  created_at: string;
}

const Esbocos = () => {
  const [esbocos, setEsbocos] = useState<Esboco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEsbocos = async () => {
    try {
      const response = await api.get("/esbocos");
      setEsbocos(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erro ao carregar esboços.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEsbocos();
  }, []);

  const handleDeleteEsboco = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este esboço?")) return;
    try {
      await api.delete(`/esbocos/${id}`);
      setEsbocos(esbocos.filter(e => e.id !== id));
    } catch (err) {
      alert("Erro ao deletar esboço.");
    }
  };

  if (loading) return <div className="text-center">Carregando esboços...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Catálogo de Esboços</h2>

      {/* Botão de Criação (Simples) */}
      <div className="flex justify-end">
        <button
          // Ação de abrir modal ou redirecionar para formulário de criação
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Novo Esboço
        </button>
      </div>

      {/* Lista de Esboços */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Meus Esboços</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Texto Bíblico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {esbocos.map((esboco) => (
                <tr key={esboco.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{esboco.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{esboco.texto_biblico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {esboco.link_arquivo_esboco && (
                      <a href={esboco.link_arquivo_esboco} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 mr-2" title="Arquivo Esboço">
                        <LinkIcon className="h-5 w-5 inline" />
                      </a>
                    )}
                    {esboco.link_arquivo_pregacao_completa && (
                      <a href={esboco.link_arquivo_pregacao_completa} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900" title="Pregação Completa">
                        <LinkIcon className="h-5 w-5 inline" />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      // Ação de editar
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 mr-2"
                      title="Editar Esboço"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEsboco(esboco.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                      title="Deletar Esboço"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Esbocos;
