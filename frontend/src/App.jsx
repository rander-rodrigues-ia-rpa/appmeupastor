import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Importa o router que criamos acima

function App() {
  return (
    // RouterProvider é o provedor do roteamento; o AuthProvider foi movido
    // para dentro do roteador (ver `src/routes.jsx`) para que hooks
    // como `useNavigate()` funcionem dentro do provider.
    <RouterProvider router={router} />
  );
}

export default App;