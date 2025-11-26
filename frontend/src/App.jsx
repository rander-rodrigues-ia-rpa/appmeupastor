import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import router from './routes'; // Importa o router que criamos acima

function App() {
  return (
    // 1. O AuthProvider fica por fora para fornecer o contexto
    <AuthProvider>
       {/* 2. O RouterProvider consome o router configurado */}
       <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;