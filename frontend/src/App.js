import React from 'react';
// Ajuste o caminho '../context/AuthContext' se necessário, baseando-se na sua estrutura de pastas
import { AuthProvider } from './context/AuthContext'; 
import AppRoutes from './routes'; 

function App() {
  return (
    // Se você tem AuthProvider, ele fica aqui dentro, mas NÃO coloque outro BrowserRouter
    <AuthProvider>
       <AppRoutes />
    </AuthProvider>
  );
}

export default App;
