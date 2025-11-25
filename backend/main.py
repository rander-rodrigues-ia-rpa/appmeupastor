from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from auth import router as auth_router
from users import router as users_router
from temas import router as temas_router
from esbocos import router as esbocos_router
from versiculos import router as versiculos_router
from dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa o banco de dados (cria as tabelas)
    await init_db()
    yield

app = FastAPI(
    title="App Meu Pastor API",
    description="API para organização de pregações, esboços e versículos por temas.",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração do CORS para permitir o frontend React
origins = [
    "http://localhost:5173",  # Porta padrão do Vite
    "http://localhost:5174",  # Porta alternativa do Vite
    # Adicionar o domínio de produção aqui
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(temas_router)
app.include_router(esbocos_router)
app.include_router(versiculos_router)
app.include_router(dashboard_router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo à API do App Meu Pastor"}
