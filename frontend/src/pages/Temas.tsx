import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from "@heroicons/react/24/outline";

interface Tema {
  id: number;
  descricao: string;
  ativo: string;
}

interface Subtema {
  id: number;
  descricao: string;
  tema_id: number;
  ativo: string;
}

const Temas = () => {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [subtemas, setSubtemas] = useState<Record<number, Subtema[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [subtemaModalOpen, setSubtemaModalOpen] = useState(false);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);
  const [selectedTemaId, setSelectedTemaId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    descricao: "",
    ativo: "S"
  });

  const [subtemaFormData, setSubtemaFormData] = useState({
    descricao: "",
    tema_id: 0,
    ativo: "S"
  });

  useEffect(() => {
    fetchTemas();
  }, []);

  const fetchTemas = async () => {
    try {
      const response = await api.get("/temas");
      setTemas(response.data);
      
      // Fetch subtemas para cada tema
      response.data.forEach((tema: Tema) => {
        fetchSubtemas(tema.id);
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar temas:", err);
      setLoading(false);
    }
  };

  const fetchSubtemas = async (temaId: number) => {
    try {
      const response = await api.get(`/temas/${temaId}/subtemas`);
      setSubtemas(prev => ({ ...prev, [temaId]: response.data }));
    } catch (err) {
      console.error("Erro ao carregar subtemas:", err);
    }
  };

  const handleOpenModal = (tema?: Tema) => {
    if (tema) {
      setEditingTema(tema);
      setFormData({
        descricao: tema.descricao,
        ativo: tema.ativo
      });
    } else {
      setEditingTema(null);
      setFormData({
        descricao: "",
        ativo: "S"
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTema) {
        await api.put(`/temas/${editingTema.id}`, formData);
      } else {
        await api.post("/temas", { descricao: formData.descricao });
      }
      
      fetchTemas();
      setModalOpen(false);
      setFormData({ descricao: "", ativo: "S" });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao salvar tema");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este tema? Todos os subtemas relacionados também serão deletados.")) {
      return;
    }
    
    try {
      await api.delete(`/temas/${id}`);
      fetchTemas();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao deletar tema");
    }
  };

  const handleOpenSubtemaModal = (temaId: number) => {
    setSelectedTemaId(temaId);
    setSubtemaFormData({
      descricao: "",
      tema_id: temaId,
      ativo: "S"
    });
    setSubtemaModalOpen(true);
  };

  const handleSubtemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post(`/temas/${selectedTemaId}/subtemas`, subtemaFormData);
      if (selectedTemaId) {
        fetchSubtemas(selectedTemaId);
      }
      setSubtemaModalOpen(false);
      setSubtemaFormData({ descricao: "", tema_id: 0, ativo: "S" });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao salvar subtema");
    }
  };

  const handleDeleteSubtema = async (subtemaId: number, temaId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este subtema?")) {
      return;
    }
    
    try {
      await api.delete(`/temas/subtemas/${subtemaId}`);
      fetchSubtemas(temaId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao deletar subtema");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Temas e Sub-Temas</h2>
          <p className="text-gray-600 mt-1">Organize os temas das suas pregações</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Tema
        </button>
      </div>

      {/* Temas List */}
      <div className="grid gap-4">
        {temas.map((tema) => (
          <div key={tema.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{tema.descricao}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tema.ativo === "S" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {tema.ativo === "S" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  
                  {/* Subtemas */}
                  <div className="mt-4 ml-9">
                    {subtemas[tema.id] && subtemas[tema.id].length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Sub-Temas:</p>
                        <div className="flex flex-wrap gap-2">
                          {subtemas[tema.id].map((subtema) => (
                            <div key={subtema.id} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="text-sm text-gray-700">{subtema.descricao}</span>
                              <button
                                onClick={() => handleDeleteSubtema(subtema.id, tema.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum sub-tema cadastrado</p>
                    )}
                    <button
                      onClick={() => handleOpenSubtemaModal(tema.id)}
                      className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      + Adicionar Sub-Tema
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(tema)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tema.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {temas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum tema cadastrado ainda</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Criar seu primeiro tema
            </button>
          </div>
        )}
      </div>

      {/* Modal Tema */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTema ? "Editar Tema" : "Novo Tema"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Tema *
            </label>
            <input
              type="text"
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Fé, Esperança, Amor..."
            />
          </div>

          {editingTema && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="S">Ativo</option>
                <option value="N">Inativo</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingTema ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Subtema */}
      <Modal
        isOpen={subtemaModalOpen}
        onClose={() => setSubtemaModalOpen(false)}
        title="Novo Sub-Tema"
      >
        <form onSubmit={handleSubtemaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Sub-Tema *
            </label>
            <input
              type="text"
              required
              value={subtemaFormData.descricao}
              onChange={(e) => setSubtemaFormData({ ...subtemaFormData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Fé em tempos difíceis"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setSubtemaModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Criar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Temas;
