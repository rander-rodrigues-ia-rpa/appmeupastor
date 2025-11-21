from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./app_meu_pastor.db")

    # Configurações de Autenticação Google
    GOOGLE_CLIENT_ID: str = Field(default="SEU_GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="SEU_GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(default="http://localhost:8000/auth/google/callback")

    # Configurações JWT
    SECRET_KEY: str = Field(default="SEGREDO_MUITO_SECRETO_E_LONGO")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)

    # Configurações de Cache (Redis)
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
