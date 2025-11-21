# App Meu Pastor

Sistema para pastores e líderes organizarem pregações, esboços e versículos por temas.

## Estrutura do Projeto

O projeto está dividido em duas pastas principais:

1.  `backend/`: Contém a API RESTful desenvolvida em Python com FastAPI.
2.  `frontend/`: Contém a aplicação web desenvolvida em React com TypeScript.

## 1. Configuração do Backend (Python/FastAPI)

### Pré-requisitos

*   Python 3.11+
*   `pip` e `venv`

### Instalação

1.  Navegue até a pasta do backend:
    \`\`\`bash
    cd app_meu_pastor/backend
    \`\`\`
2.  Crie e ative o ambiente virtual (já feito, mas para referência):
    \`\`\`bash
    python3 -m venv venv
    source venv/bin/activate
    \`\`\`
3.  Instale as dependências:
    \`\`\`bash
    pip install -r requirements.txt # Crie este arquivo com as dependências instaladas
    \`\`\`
    *Nota: As dependências foram instaladas diretamente, mas para um projeto real, você deve gerar o `requirements.txt` com `pip freeze > requirements.txt`.*

### Variáveis de Ambiente

1.  Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`:
    \`\`\`bash
    cp .env.example .env
    \`\`\`
2.  **IMPORTANTE**: Preencha as variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` com suas credenciais do Google Cloud Console. A `GOOGLE_REDIRECT_URI` deve ser `http://localhost:8000/auth/google/callback`.

### Execução

1.  Certifique-se de que o ambiente virtual está ativado.
2.  Execute o servidor Uvicorn:
    \`\`\`bash
    uvicorn main:app --reload
    \`\`\`
    O backend estará acessível em `http://localhost:8000`.

## 2. Configuração do Frontend (React/TypeScript)

### Pré-requisitos

*   Node.js (versão LTS recomendada)
*   pnpm (gerenciador de pacotes)

### Instalação

1.  Navegue até a pasta do frontend:
    \`\`\`bash
    cd app_meu_pastor/frontend
    \`\`\`
2.  Instale as dependências (já feito, mas para referência):
    \`\`\`bash
    pnpm install
    \`\`\`

### Execução

1.  Execute o servidor de desenvolvimento do Vite:
    \`\`\`bash
    pnpm run dev
    \`\`\`
    O frontend estará acessível em `http://localhost:5173` (ou outra porta disponível, como `5174`).

## Funcionalidades Implementadas

*   **Backend (FastAPI):**
    *   Estrutura de projeto com SQLAlchemy (SQLite/PostgreSQL).
    *   Modelos de dados (`Usuario`, `Tema`, `Subtema`, `CatalogoEsbocos`, `VersiculoTema`).
    *   Autenticação Google OAuth2 com JWT.
    *   Rotas de usuário (`/users/me`, `/users/me/complete-profile`).
    *   APIs CRUD para `Temas` e `Subtemas`.
    *   APIs CRUD para `Catálogo de Esboços`.
    *   APIs CRUD para `Versículos por Tema`.
    *   Rota de Dashboard com indicadores (`/dashboard/indicators`).
    *   Implementação de Cache (simulado em memória/Redis).
*   **Frontend (React):**
    *   Estrutura de roteamento com `react-router-dom`.
    *   Contexto de Autenticação (`AuthContext`) com verificação de perfil completo.
    *   Página de Login com redirecionamento para Google OAuth.
    *   Layout principal com Header e Menu Lateral (`Sidebar`).
    *   Páginas de `Dashboard`, `Meu Cadastro`, `Temas`, `Esboços` e `Versículos por Tema` (com CRUDs básicos).
    *   Estilização com Tailwind CSS e tema de cores verde.
    *   Responsividade básica.

## Próximos Passos (Para o Usuário)

1.  **Configurar Credenciais Google:** Obter e configurar as credenciais do Google Cloud Console no arquivo `.env` do backend.
2.  **Testar Fluxo de Autenticação:** Testar o login com o Google e o fluxo de completar o cadastro.
3.  **Testar CRUDs:** Testar a criação, leitura, atualização e exclusão de Temas, Esboços e Versículos.
4.  **Ajustes de UI/UX:** Refinar a interface de usuário, especialmente os formulários de CRUD.
5.  **Implementar Upload de Arquivos:** O campo `link_arquivo_esboco` e `link_arquivo_pregacao_completa` sugere a necessidade de um serviço de upload (ex: S3), que não foi implementado.
