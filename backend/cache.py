import redis.asyncio as redis
from typing import Optional
from config import settings

class Cache:
    def __init__(self):
        self._cache = {} # Cache em memória (fallback)
        self._redis_client: Optional[redis.Redis] = None
        
        try:
            # Inicializa o cliente, mas a conexão real acontece no primeiro comando
            self._redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            print(f"Aviso: Falha na configuração do Redis. Usando memória. Erro: {e}")
            self._redis_client = None

    async def get(self, key: str) -> Optional[str]:
        # Tenta pegar do Redis se o cliente existir
        if self._redis_client:
            try:
                return await self._redis_client.get(key)
            except Exception as e:
                # Se der erro de conexão (Connection Refused), ignora e tenta na memória
                print(f"Erro ao conectar no Redis (get): {e}")
        
        # Fallback para memória
        return self._cache.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None):
        if self._redis_client:
            try:
                await self._redis_client.set(key, value, ex=ex)
                return # Sucesso no Redis, retorna
            except Exception as e:
                print(f"Erro ao conectar no Redis (set): {e}")
        
        # Fallback para memória
        self._cache[key] = value

    async def delete(self, key: str):
        if self._redis_client:
            try:
                await self._redis_client.delete(key)
            except Exception:
                pass
        
        if key in self._cache:
            del self._cache[key]

    async def clear_all(self):
        if self._redis_client:
            try:
                await self._redis_client.flushdb()
            except Exception:
                pass
        self._cache.clear()

cache = Cache()

async def get_cache():
    return cache
