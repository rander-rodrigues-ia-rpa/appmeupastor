import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { 
  UserCircleIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

const MeuCadastro = () => {
  const { user, checkProfileStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    telefone_contato: "",
    perfil_usuario: "",
  });

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
    setSaving(true);
    setMessage(null);

    try {
      // Endpoint correto baseado no status do perfil
      const endpoint = user?.is_profile_complete === "N" 
        ? "/users/me/complete-profile" 
        : "/users/me";

      // Dados a enviar (não incluir email)
      const dataToSend = {
        nome: formData.nome,
        username: formData.username,
        telefone_contato: formData.telefone_contato,
        perfil_usuario: formData.perfil_usuario,
      };

      await api.put(endpoint, dataToSend);
      
      setMessage({ 
        type: 'success', 
        text: user?.is_profile_complete === "N" 
          ? "Perfil completado com sucesso! Agora você tem acesso completo ao sistema." 
          : "Dados atualizados com sucesso!"
      });
      
      // Atualiza o status do perfil no contexto
      await checkProfileStatus();
      setIsEditing(false);
      
      // Scroll para o topo para ver a mensagem
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Erro ao atualizar o cadastro.";
      setMessage({ type: 'error', text: errorMessage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const isProfileIncomplete = user?.is_profile_complete !== "S";
  const hasRequiredFields = formData.telefone_contato && formData.perfil_usuario;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Meu Cadastro</h2>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Aviso de Perfil Incompleto */}
      {isProfileIncomplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">
                Complete seu cadastro
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Preencha os campos <span className="font-semibold">Telefone</span> e{' '}
                <span className="font-semibold">Perfil</span> para ter acesso completo ao sistema.
              </p>
              {!hasRequiredFields && (
                <p className="text-sm text-yellow-700 mt-2 font-medium">
                  ⚠️ Campos obrigatórios faltando!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso/Erro */}
      {message && (
        <div className={`p-4 rounded-lg border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-start">
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <p className={`ml-3 text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Card Principal */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nome}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                  <UserCircleIcon className="w-20 h-20 text-green-600" />
                </div>
              )}
              
              {/* Badge de Status */}
              <div className="absolute -bottom-2 -right-2">
                {isProfileIncomplete ? (
                  <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                    <ExclamationCircleIcon className="w-3 h-3" />
                    Incompleto
                  </div>
                ) : (
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                    <CheckCircleIcon className="w-3 h-3" />
                    Completo
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white">{user?.nome}</h3>
              <p className="text-green-100 mt-1">{user?.email}</p>
              {user?.perfil_usuario && (
                <p className="text-green-200 text-sm mt-1">
                  {user.perfil_usuario}
                </p>
              )}
              {user?.social_provider === 'google' && (
                <p className="text-green-200 text-xs mt-2 flex items-center justify-center sm:justify-start gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                  Conectado via Google
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Toggle Edição (apenas se perfil completo) */}
          {!isProfileIncomplete && (
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  ✏️ Editar informações
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form
                    if (user) {
                      setFormData({
                        nome: user.nome || "",
                        username: user.username || "",
                        email: user.email || "",
                        telefone_contato: user.telefone_contato || "",
                        perfil_usuario: user.perfil_usuario || "",
                      });
                    }
                    setMessage(null);
                  }}
                  className="text-gray-600 hover:text-gray-700 font-semibold text-sm"
                >
                  ❌ Cancelar edição
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={!isEditing && !isProfileIncomplete}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  (!isEditing && !isProfileIncomplete) ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                placeholder="Seu nome completo"
              />
            </div>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome de Usuário
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing && !isProfileIncomplete}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  (!isEditing && !isProfileIncomplete) ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                placeholder="usuario123"
              />
            </div>

            {/* Email (não editável) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone_contato" className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone de Contato {isProfileIncomplete && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                name="telefone_contato"
                id="telefone_contato"
                value={formData.telefone_contato}
                onChange={handleChange}
                required={isProfileIncomplete}
                disabled={!isEditing && !isProfileIncomplete}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  (!isEditing && !isProfileIncomplete) ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Perfil */}
            <div className="md:col-span-2">
              <label htmlFor="perfil_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                Perfil de Usuário {isProfileIncomplete && <span className="text-red-500">*</span>}
              </label>
              <select
                name="perfil_usuario"
                id="perfil_usuario"
                value={formData.perfil_usuario}
                onChange={handleChange}
                required={isProfileIncomplete}
                disabled={!isEditing && !isProfileIncomplete}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  (!isEditing && !isProfileIncomplete) ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Selecione um perfil...</option>
                <option value="Pastor">Pastor</option>
                <option value="Líder">Líder</option>
                <option value="Missionário">Missionário</option>
                <option value="Diácono">Diácono</option>
                <option value="Presbítero">Presbítero</option>
                <option value="Obreiro">Obreiro</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Botão Salvar (apenas se editando ou perfil incompleto) */}
          {(isEditing || isProfileIncomplete) && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving || (isProfileIncomplete && !hasRequiredFields)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    {isProfileIncomplete ? 'Completar Cadastro' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info adicional */}
          {isProfileIncomplete && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Importante:</span> Após completar seu cadastro, você terá acesso a todas as funcionalidades do sistema, incluindo criação de temas, esboços e catalogação de versículos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Card de Informações da Conta */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações da Conta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Status da Conta</p>
            <p className="text-gray-900 mt-1">
              {user?.ativo === 'S' ? (
                <span className="text-green-600 font-semibold">✓ Ativa</span>
              ) : (
                <span className="text-red-600 font-semibold">✗ Inativa</span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Método de Login</p>
            <p className="text-gray-900 mt-1">
              {user?.social_provider === 'google' ? 'Google OAuth' : 'Email e Senha'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Membro desde</p>
            <p className="text-gray-900 mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              }) : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Último acesso</p>
            <p className="text-gray-900 mt-1">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuCadastro;
