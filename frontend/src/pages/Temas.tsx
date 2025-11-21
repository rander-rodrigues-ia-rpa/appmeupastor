import { useState, useEffect } from "react";
import api from "../services/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Tema {
  id: number;
  descricao: string;
  ativo: string;
}

const Temas = () => {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTema, setNewTema] = useState("");
  const [editingTema, setEditingTema] = useState<Tema | null>(null);

  const fetchTemas = async () => {
    try {
      const response = await api.get("/temas");
      setTemas(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erro ao carregar temas.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemas();
  }, []);

  const handleCreateTema = async () => {
    if (!newTema.trim()) return;
    try {
      const response = await api.post("/temas", { descricao: newTema });
      setTemas([...temas, response.data]);
      setNewTema("");
    } catch (err) {
      alert("Erro ao criar tema.");
    }
  };

  const handleUpdateTema = async () => {
    if (!editingTema || !editingTema.descricao.trim()) return;
    try {
      const response = await api.put(`/temas/${editingTema.id}`, { 
        descricao: editingTema.descricao,
        ativo: editingTema.ativo
      });
      setTemas(temas.map(t => (t.id === editingTema.id ? response.data : t)));
      setEditingTema(null);
    } catch (err) {
      alert("Erro ao atualizar tema.");
    }
  };

  const handleDeleteTema = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este tema? Todos os subtemas, esboços e versículos relacionados serão afetados.")) return;
    try {
      await api.delete(`/temas/${id}`);
      setTemas(temas.filter(t => t.id !== id));
    } catch (err) {
      alert("Erro ao deletar tema.");
    }
  };

  if (loading) return <div className="text-center">Carregando temas...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Cadastro de Temas e Sub-Temas</h2>

      {/* Formulário de Criação */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Novo Tema</h3>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Descrição do novo tema"
            value={newTema}
            onChange={(e) => setNewTema(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
          <button
            onClick={handleCreateTema}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Criar
          </button>
        </div>
      </div>

      {/* Lista de Temas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Temas Existentes</h3>
        <ul className="divide-y divide-gray-200">
          {temas.map((tema) => (
            <li key={tema.id} className="py-4 flex justify-between items-center">
              {editingTema?.id === tema.id ? (
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={editingTema.descricao}
                    onChange={(e) => setEditingTema({ ...editingTema, descricao: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                  <select
                    value={editingTema.ativo}
                    onChange={(e) => setEditingTema({ ...editingTema, ativo: e.target.value })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="S">Ativo</option>
                    <option value="N">Inativo</option>
                  </select>
                  <button onClick={handleUpdateTema} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">Salvar</button>
                  <button onClick={() => setEditingTema(null)} className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600">Cancelar</button>
                </div>
              ) : (
                <span className={`flex-1 ${tema.ativo === 'N' ? 'line-through text-gray-500' : ''}`}>
                  {tema.descricao} ({tema.ativo === 'S' ? 'Ativo' : 'Inativo'})
                </span>
              )}
              
              <div className="space-x-2">
                <button
                  onClick={() => setEditingTema(tema)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                  title="Editar Tema"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteTema(tema.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                  title="Deletar Tema"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Sub-Temas - Implementação simplificada, o CRUD completo de subtemas seria em um modal ou tela separada */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Gerenciamento de Sub-Temas</h3>
        <p className="text-gray-600">Para gerenciar sub-temas, você precisaria de um modal ou uma tela de detalhes do tema. Por enquanto, a API de subtemas está pronta, mas a interface será simplificada.</p>
      </div>
    </div>
  );
};

export default Temas;
