from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import CatalogoEsbocos, VersiculoTema, Tema, Usuario
from security import get_current_complete_user
from cache import cache

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_complete_user)]
)

@router.get("/indicators")
async def get_indicators(
    db: AsyncSession = Depends(get_db), 
    current_user: Usuario = Depends(get_current_complete_user)
):
    """Retorna os indicadores do dashboard."""
    
    user_id = current_user.id
    cache_key = f"dashboard_indicators:{user_id}"
    
    # Tenta buscar do cache
    cached_data = await cache.get(cache_key)
    if cached_data:
        return {"data": cached_data, "source": "cache"}

    # Busca no banco de dados
    try:
        # 1. Quantidade de esboços
        esbocos_count_result = await db.execute(
            select(func.count(CatalogoEsbocos.id)).filter(
                CatalogoEsbocos.usuario_id == user_id
            )
        )
        esbocos_count = esbocos_count_result.scalar_one()

        # 2. Quantidade de versículos por temas
        versiculos_count_result = await db.execute(
            select(func.count(VersiculoTema.id)).filter(
                VersiculoTema.usuario_id == user_id
            )
        )
        versiculos_count = versiculos_count_result.scalar_one()
        
        # 3. Quantidade de temas
        temas_count_result = await db.execute(
            select(func.count(Tema.id)).filter(
                Tema.usuario_id == user_id,
                Tema.ativo == "S"
            )
        )
        temas_count = temas_count_result.scalar_one()
        
        indicators = {
            "quantidade_esbocos": esbocos_count,
            "quantidade_versiculos": versiculos_count,
            "quantidade_temas": temas_count
        }
        
        # Armazena no cache por 5 minutos (300 segundos)
        import json
        await cache.set(cache_key, json.dumps(indicators), ex=300)
        
        return {"data": indicators, "source": "database"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar indicadores: {str(e)}"
        )
