import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import IndicatorCard from "../components/IndicatorCard";
import api from "../services/api";
import { BookOpenIcon, BookmarkIcon, TagIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState({
    quantidade_esbocos: 0,
    quantidade_versiculos: 0,
    quantidade_temas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await api.get("/dashboard/indicators");
        const data = typeof response.data.data === 'string' 
          ? JSON.parse(response.data.data) 
          : response.data.data;
        setIndicators(data);
      } catch (err) {
        setError("Não foi possível carregar os indicadores");
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  const isProfileIncomplete = user?.is_profile_complete !== "S";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Olá, {user?.nome?.split(' ')[0] || 'Pastor'}! 👋
        </h1>
        <p className="text-green-100">
          Bem-vindo ao seu painel de controle de pregações e esboços
        </p>
      </div>

      {/* Profile Warning */}
      {isProfileIncomplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-yellow-700">
                Seu perfil está incompleto.{' '}
                <Link to="/meu-cadastro" className="font-semibold underline hover:text-yellow-800">
                  Complete agora
                </Link>
                {' '}para ter acesso a todas as funcionalidades.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicators Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando dashboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IndicatorCard
            title="Total de Esboços"
            value={indicators.quantidade_esbocos}
            icon={BookOpenIcon}
          />
          <IndicatorCard
            title="Versículos Catalogados"
            value={indicators.quantidade_versiculos}
            icon={BookmarkIcon}
          />
          <IndicatorCard
            title="Temas Cadastrados"
            value={indicators.quantidade_temas || 0}
            icon={TagIcon}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/temas"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <TagIcon className="h-10 w-10 text-green-600 mr-3" />
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-green-700">Gerenciar Temas</p>
              <p className="text-sm text-gray-600">Organize seus temas</p>
            </div>
          </Link>

          <Link
            to="/esbocos"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <BookOpenIcon className="h-10 w-10 text-blue-600 mr-3" />
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-blue-700">Novo Esboço</p>
              <p className="text-sm text-gray-600">Crie um esboço</p>
            </div>
          </Link>

          <Link
            to="/versiculos-por-tema"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <BookmarkIcon className="h-10 w-10 text-purple-600 mr-3" />
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-purple-700">Adicionar Versículo</p>
              <p className="text-sm text-gray-600">Catalogue versículos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Atividade Recente</h2>
        <p className="text-gray-600 text-center py-8">
          Seus esboços e atividades recentes aparecerão aqui
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
