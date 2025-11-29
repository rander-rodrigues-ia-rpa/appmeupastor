import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BookmarkIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

interface Versiculo {
  id: number;
  versiculo: string;
  descricao_versiculo: string;
  tema_id: number;
  subtema_id: number | null;
  created_at: string;
}

interface Tema {
  id: number;
  descricao: string;
}

interface Subtema {
  id: number;
  descricao: string;
  tema_id: number;
}

const VersiculosPorTema = () => {
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVersiculo, setEditingVersiculo] = useState<Versiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTema, setFilterTema] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    versiculo: "",
    descricao_versiculo: "",
    tema_id: 0,
    subtema_id: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.tema_id) {
      fetchSubtemas(formData.tema_id);
    }
  }, [formData.tema_id]);

  const fetchData = async () => {
    try {
      const [versiculosRes, temasRes] = await Promise.all([
        api.get("/versiculos"),
        api.get("/temas")
      ]);
      setVersiculos(versiculosRes.data);
      setTemas(temasRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setLoading(false);
    }
  };

  const fetchSubtemas = async (temaId: number) => {
    try {
      const response = await api.get(`/temas/${temaId}/subtemas`);
      setSubtemas(response.data);
    } catch (err) {
      console.error("Erro ao carregar subtemas:", err);
      setSubtemas([]);
    }
  };

  const handleOpenModal = (versiculo?: Versiculo) => {
    if (versiculo) {
      setEditingVersiculo(versiculo);
      setFormData({
        versiculo: versiculo.versiculo,
        descricao_versiculo: versiculo.descricao_versiculo,
        tema_id: versiculo.tema_id,
        subtema_id: versiculo.subtema_id || 0
      });
      fetchSubtemas(versiculo.tema_id);
    } else {
      setEditingVersiculo(null);
      setFormData({
        versiculo: "",
        descricao_versiculo: "",
        tema_id: 0,
        subtema_id: 0
      });
      setSubtemas([]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      subtema_id: formData.subtema_id || null
    };
    
    try {
      if (editingVersiculo) {
        await api.put(`/versiculos/${editingVersiculo.id}`, dataToSend);
      } else {
        await api.post("/versiculos", dataToSend);
      }
      
      fetchData();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao salvar versículo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este versículo?")) {
      return;
    }
    
    try {
      await api.delete(`/versiculos/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao deletar versículo");
    }
  };

  const getTemaDescricao = (temaId: number) => {
    return temas.find(t => t.id === temaId)?.descricao || "N/A";
  };

  const filteredVersiculos = versiculos.filter(versiculo => {
    const matchesSearch = versiculo.versiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      versiculo.descricao_versiculo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTema = filterTema === 0 || versiculo.tema_id === filterTema;
    return matchesSearch && matchesTema;
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Versículos por Tema</h2>
          <p className="text-gray-600 mt-1">Catalogue e organize versículos bíblicos por temas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Versículo
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar versículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterTema}
          onChange={(e) => setFilterTema(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value={0}>Todos os Temas</option>
          {temas.map(tema => (
            <option key={tema.id} value={tema.id}>{tema.descricao}</option>
          ))}
        </select>
      </div>

      {/* Versículos Grid */}
      <div className="grid gap-4">
        {filteredVersiculos.map((versiculo) => (
          <div key={versiculo.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <BookmarkIcon className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">{versiculo.versiculo}</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {getTemaDescricao(versiculo.tema_id)}
                        </span>
                      </div>
                      <p className="text-gray-700 italic">"{versiculo.descricao_versiculo}"</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Adicionado em: {new Date(versiculo.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(versiculo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(versiculo.id)}
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

        {filteredVersiculos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterTema ? "Nenhum versículo encontrado" : "Nenhum versículo cadastrado ainda"}
            </p>
            {!searchTerm && !filterTema && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Cadastrar seu primeiro versículo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVersiculo ? "Editar Versículo" : "Novo Versículo"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versículo (Referência) *
            </label>
            <input
              type="text"
              required
              value={formData.versiculo}
              onChange={(e) => setFormData({ ...formData, versiculo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: João 3:16, Salmos 23:1-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto do Versículo *
            </label>
            <textarea
              required
              rows={4}
              value={formData.descricao_versiculo}
              onChange={(e) => setFormData({ ...formData, descricao_versiculo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Digite o texto do versículo aqui..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema *
              </label>
              <select
                required
                value={formData.tema_id}
                onChange={(e) => setFormData({ ...formData, tema_id: Number(e.target.value), subtema_id: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={0}>Selecione um tema</option>
                {temas.map(tema => (
                  <option key={tema.id} value={tema.id}>{tema.descricao}</option>
                ))}
              </select>
            </div>

            {subtemas.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Tema (Opcional)
                </label>
                <select
                  value={formData.subtema_id}
                  onChange={(e) => setFormData({ ...formData, subtema_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={0}>Nenhum</option>
                  {subtemas.map(subtema => (
                    <option key={subtema.id} value={subtema.id}>{subtema.descricao}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
              {editingVersiculo ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VersiculosPorTema;
