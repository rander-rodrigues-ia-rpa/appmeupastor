import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estado para alternar entre Login e Cadastro
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dados do formulário de LOGIN
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Dados do formulário de CADASTRO
  const [registerData, setRegisterData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefone_contato: "",
    perfil_usuario: ""
  });

  // Função para LOGIN MANUAL
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/auth/login", {
        email: loginData.email,
        password: loginData.password
      });
      
      login(response.data.access_token);
      navigate("/");
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Erro ao fazer login. Verifique suas credenciais.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Função para CADASTRO MANUAL
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validação de senha
    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        nome: registerData.nome,
        email: registerData.email,
        password: registerData.password,
        telefone_contato: registerData.telefone_contato || null,
        perfil_usuario: registerData.perfil_usuario || null
      });
      
      setSuccess("Conta criada com sucesso! Redirecionando...");
      
      // Login automático após cadastro
      setTimeout(() => {
        login(response.data.access_token);
        navigate("/");
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Erro ao criar conta. Tente novamente.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Função para LOGIN COM GOOGLE
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/auth/google/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header com Logo */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {import.meta.env.VITE_APP_NAME || 'App Meu Pastor'}
            </h1>
            <p className="text-green-100">
              Organize suas pregações e esboços
            </p>
          </div>

          <div className="p-8">
            {/* Toggle Buttons - LOGIN / CADASTRO */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  isLogin 
                    ? "bg-white text-green-700 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  !isLogin 
                    ? "bg-white text-green-700 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Mensagens de Erro/Sucesso */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* FORMULÁRIO DE LOGIN */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>
            ) : (
              /* FORMULÁRIO DE CADASTRO */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={registerData.nome}
                    onChange={(e) => setRegisterData({...registerData, nome: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Digite a senha novamente"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    value={registerData.telefone_contato}
                    onChange={(e) => setRegisterData({...registerData, telefone_contato: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="(00) 00000-0000"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-profile" className="block text-sm font-semibold text-gray-700 mb-2">
                    Perfil <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <select
                    id="register-profile"
                    value={registerData.perfil_usuario}
                    onChange={(e) => setRegisterData({...registerData, perfil_usuario: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={loading}
                  >
                    <option value="">Selecione...</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Líder">Líder</option>
                    <option value="Missionário">Missionário</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Ao criar uma conta, você concorda com nossos termos de uso
                </p>
              </form>
            )}

            {/* Divider - OU */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">ou continue com</span>
              </div>
            </div>

            {/* Botão Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
