from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import CatalogoEsbocos, VersiculoTema, Usuario
from security import get_current_complete_user
from cache import cache

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_complete_user)] # Protege todas as rotas com autenticação e perfil completo
)

@router.get("/indicators")
async def get_indicators(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Retorna os indicadores do dashboard (Quantidade de esboços e versículos por temas)."""
    
    user_id = current_user.id
    cache_key = f"dashboard_indicators:{user_id}"
    
    # Tenta buscar do cache
    cached_data = await cache.get(cache_key)
    if cached_data:
        # Retorna os dados do cache (assumindo que o frontend fará o parse JSON)
        return {"data": cached_data, "source": "cache"}

    # Se não estiver no cache, busca no banco de dados
    
    # 1. Quantidade de esboços
    esbocos_count_result = await db.execute(
        select(func.count(CatalogoEsbocos.id)).filter(CatalogoEsbocos.usuario_id == user_id)
    )
    esbocos_count = esbocos_count_result.scalar_one()

    # 2. Quantidade de versículos por temas
    versiculos_count_result = await db.execute(
        select(func.count(VersiculoTema.id)).filter(VersiculoTema.usuario_id == user_id)
    )
    versiculos_count = versiculos_count_result.scalar_one()
    
    indicators = {
        "quantidade_esbocos": esbocos_count,
        "quantidade_versiculos": versiculos_count
    }
    
    # Armazena no cache por 5 minutos (300 segundos)
    import json
    await cache.set(cache_key, json.dumps(indicators), ex=300)
    
    return {"data": indicators, "source": "database"}
