from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from config import settings
from auth import router as auth_router
from users import router as users_router
from temas import router as temas_router
from esbocos import router as esbocos_router
from versiculos import router as versiculos_router
from dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

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

# 2. Adicione o Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE...
    allow_headers=["*"], # Permite todos os cabeçalhos
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
