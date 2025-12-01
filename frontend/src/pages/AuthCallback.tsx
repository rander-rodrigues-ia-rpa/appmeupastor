import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Se o token estiver presente, realiza o login e redireciona
      login(token);
      // O login já chama checkProfileStatus e redireciona para a dashboard
      // se o perfil estiver completo, ou para /meu-cadastro se estiver incompleto.
    } else {
      // Se não houver token, algo deu errado (ex: erro no backend)
      console.error("Token não encontrado no callback de autenticação.");
      // Redireciona para a página de login com uma mensagem de erro
      navigate('/login', { state: { error: 'Falha na autenticação com Google. Tente novamente.' } });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Processando autenticação...</h2>
        <p className="text-gray-500 mt-2">Você será redirecionado em breve.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
