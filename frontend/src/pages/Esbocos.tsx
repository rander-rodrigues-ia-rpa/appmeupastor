import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BookOpenIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

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

interface Tema {
  id: number;
  descricao: string;
}

interface Subtema {
  id: number;
  descricao: string;
  tema_id: number;
}

const Esbocos = () => {
  const [esbocos, setEsbocos] = useState<Esboco[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEsboco, setEditingEsboco] = useState<Esboco | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    texto_biblico: "",
    resumo: "",
    tema_id: 0,
    subtema_id: 0,
    link_arquivo_esboco: "",
    link_arquivo_pregacao_completa: "",
    esboco_manual: ""
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
      const [esbocosRes, temasRes] = await Promise.all([
        api.get("/esbocos"),
        api.get("/temas")
      ]);
      setEsbocos(esbocosRes.data);
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

  const handleOpenModal = (esboco?: Esboco) => {
    if (esboco) {
      setEditingEsboco(esboco);
      setFormData({
        titulo: esboco.titulo,
        texto_biblico: esboco.texto_biblico,
        resumo: esboco.resumo,
        tema_id: esboco.tema_id,
        subtema_id: esboco.subtema_id || 0,
        link_arquivo_esboco: esboco.link_arquivo_esboco || "",
        link_arquivo_pregacao_completa: esboco.link_arquivo_pregacao_completa || "",
        esboco_manual: esboco.esboco_manual || ""
      });
      fetchSubtemas(esboco.tema_id);
    } else {
      setEditingEsboco(null);
      setFormData({
        titulo: "",
        texto_biblico: "",
        resumo: "",
        tema_id: 0,
        subtema_id: 0,
        link_arquivo_esboco: "",
        link_arquivo_pregacao_completa: "",
        esboco_manual: ""
      });
      setSubtemas([]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      subtema_id: formData.subtema_id || null,
      link_arquivo_esboco: formData.link_arquivo_esboco || null,
      link_arquivo_pregacao_completa: formData.link_arquivo_pregacao_completa || null,
      esboco_manual: formData.esboco_manual || null
    };
    
    try {
      if (editingEsboco) {
        await api.put(`/esbocos/${editingEsboco.id}`, dataToSend);
      } else {
        await api.post("/esbocos", dataToSend);
      }
      
      fetchData();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao salvar esboço");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este esboço?")) {
      return;
    }
    
    try {
      await api.delete(`/esbocos/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao deletar esboço");
    }
  };

  const filteredEsbocos = esbocos.filter(esboco =>
    esboco.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esboco.texto_biblico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esboco.resumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemaDescricao = (temaId: number) => {
    return temas.find(t => t.id === temaId)?.descricao || "N/A";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Catálogo de Esboços</h2>
          <p className="text-gray-600 mt-1">Organize e gerencie seus esboços de pregação</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Esboço
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar esboços por título, texto bíblico ou resumo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Esboços Grid */}
      <div className="grid gap-6">
        {filteredEsbocos.map((esboco) => (
          <div key={esboco.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <BookOpenIcon className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{esboco.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-semibold">Texto:</span> {esboco.texto_biblico}
                      </p>
                      <p className="text-gray-700 mb-3">{esboco.resumo}</p>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {getTemaDescricao(esboco.tema_id)}
                        </span>
                        {esboco.link_arquivo_esboco && (
                          <a
                            href={esboco.link_arquivo_esboco}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                          >
                            📄 Ver Esboço
                          </a>
                        )}
                        {esboco.link_arquivo_pregacao_completa && (
                          <a
                            href={esboco.link_arquivo_pregacao_completa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
                          >
                            🎤 Pregação Completa
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(esboco)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(esboco.id)}
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

        {filteredEsbocos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? "Nenhum esboço encontrado" : "Nenhum esboço cadastrado ainda"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Criar seu primeiro esboço
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEsboco ? "Editar Esboço" : "Novo Esboço"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: O Amor de Deus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto Bíblico *
              </label>
              <input
                type="text"
                required
                value={formData.texto_biblico}
                onChange={(e) => setFormData({ ...formData, texto_biblico: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: João 3:16"
              />
            </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumo *
            </label>
            <textarea
              required
              rows={3}
              value={formData.resumo}
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Breve resumo do esboço..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link do Arquivo do Esboço
            </label>
            <input
              type="url"
              value={formData.link_arquivo_esboco}
              onChange={(e) => setFormData({ ...formData, link_arquivo_esboco: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link da Pregação Completa
            </label>
            <input
              type="url"
              value={formData.link_arquivo_pregacao_completa}
              onChange={(e) => setFormData({ ...formData, link_arquivo_pregacao_completa: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Esboço Manual (Opcional)
            </label>
            <textarea
              rows={5}
              value={formData.esboco_manual}
              onChange={(e) => setFormData({ ...formData, esboco_manual: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Digite o esboço completo aqui..."
            />
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
              {editingEsboco ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Esbocos;
