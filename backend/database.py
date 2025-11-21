from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Configuração do banco de dados (usaremos SQLite para simplicidade no ambiente sandbox)
# Em um ambiente de produção, o usuário deve configurar para PostgreSQL (pg_catalog)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app_meu_pastor.db")

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=True, 
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    # Cria as tabelas no banco de dados
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependência para obter a sessão do banco de dados
def get_db_session():
    return AsyncSessionLocal()
