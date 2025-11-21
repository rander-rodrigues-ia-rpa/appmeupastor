import redis.asyncio as redis
from typing import Optional
from .config import settings

# Inicializa o cliente Redis
# Usaremos um cliente síncrono para simplicidade no ambiente sandbox, mas o redis.asyncio é mais adequado para FastAPI.
# Para o ambiente sandbox, vamos simular o cache com um dicionário em memória se o Redis não estiver disponível.
# Em um ambiente real, o Redis seria usado.

class Cache:
    def __init__(self):
        self._cache = {} # Cache em memória para o ambiente sandbox
        self._redis_client: Optional[redis.Redis] = None
        
        try:
            # Tenta conectar ao Redis
            self._redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            print(f"Aviso: Não foi possível conectar ao Redis. Usando cache em memória. Erro: {e}")

    async def get(self, key: str) -> Optional[str]:
        if self._redis_client:
            return await self._redis_client.get(key)
        return self._cache.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None):
        if self._redis_client:
            await self._redis_client.set(key, value, ex=ex)
        else:
            self._cache[key] = value

    async def delete(self, key: str):
        if self._redis_client:
            await self._redis_client.delete(key)
        else:
            if key in self._cache:
                del self._cache[key]

    async def clear_all(self):
        if self._redis_client:
            await self._redis_client.flushdb()
        else:
            self._cache.clear()

cache = Cache()

async def get_cache():
    return cache
