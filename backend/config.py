from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./app_meu_pastor.db")

    # Configurações de Autenticação Google
    GOOGLE_CLIENT_ID: str = Field(default="")
    GOOGLE_CLIENT_SECRET: str = Field(default="")
    GOOGLE_REDIRECT_URI: str = Field(default="http://localhost:8000/auth/google/callback")

    # Configurações JWT
    SECRET_KEY: str = Field(default="change-this-secret-key-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24)  # 1 dia (mais seguro)

    # Configurações de Cache (Redis)
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # Configurações CORS
    CORS_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:5174,http://localhost:3000")
    
    # Configurações da Aplicação
    APP_NAME: str = Field(default="App Meu Pastor")
    DEBUG: bool = Field(default=False)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    @property
    def cors_origins_list(self) -> list:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()
