from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update
from typing import List
from .database import get_db
from .models import CatalogoEsbocos, Tema, Subtema, Usuario
from .schemas import CatalogoEsbocos as EsbocoSchema, CatalogoEsbocosCreate, CatalogoEsbocosUpdate
from .security import get_current_complete_user

router = APIRouter(
    prefix="/esbocos",
    tags=["esbocos"],
    dependencies=[Depends(get_current_complete_user)] # Protege todas as rotas com autenticação e perfil completo
)

async def check_tema_subtema_ownership(db: AsyncSession, tema_id: int, subtema_id: int | None, user_id: int):
    """Verifica se o tema e subtema (se fornecido) pertencem ao usuário."""
    # Verifica o Tema
    result = await db.execute(select(Tema).filter(Tema.id == tema_id, Tema.usuario_id == user_id))
    tema = result.scalars().first()
    if not tema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tema não encontrado ou não pertence ao usuário")

    # Verifica o Subtema (se fornecido)
    if subtema_id:
        result = await db.execute(select(Subtema).filter(Subtema.id == subtema_id, Subtema.tema_id == tema_id))
        subtema = result.scalars().first()
        if not subtema:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtema não encontrado ou não pertence ao tema")
    
    return True

# --- Rotas para Catálogo de Esboços ---

@router.post("/", response_model=EsbocoSchema, status_code=status.HTTP_201_CREATED)
async def create_esboco(esboco: CatalogoEsbocosCreate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Cria um novo esboço."""
    await check_tema_subtema_ownership(db, esboco.tema_id, esboco.subtema_id, current_user.id)
    
    new_esboco = CatalogoEsbocos(
        **esboco.model_dump(),
        usuario_id=current_user.id
    )
    db.add(new_esboco)
    await db.commit()
    await db.refresh(new_esboco)
    return new_esboco

@router.get("/", response_model=List[EsbocoSchema])
async def read_esbocos(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Lista todos os esboços do usuário logado."""
    result = await db.execute(
        select(CatalogoEsbocos).filter(CatalogoEsbocos.usuario_id == current_user.id).order_by(CatalogoEsbocos.created_at.desc())
    )
    esbocos = result.scalars().all()
    return esbocos

@router.get("/{esboco_id}", response_model=EsbocoSchema)
async def read_esboco(esboco_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Retorna um esboço específico."""
    result = await db.execute(
        select(CatalogoEsbocos).filter(CatalogoEsbocos.id == esboco_id, CatalogoEsbocos.usuario_id == current_user.id)
    )
    esboco = result.scalars().first()
    if not esboco:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Esboço não encontrado ou não pertence ao usuário")
    return esboco

@router.put("/{esboco_id}", response_model=EsbocoSchema)
async def update_esboco(esboco_id: int, esboco: CatalogoEsbocosUpdate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Atualiza um esboço existente."""
    await check_tema_subtema_ownership(db, esboco.tema_id, esboco.subtema_id, current_user.id)
    
    stmt = update(CatalogoEsbocos).where(CatalogoEsbocos.id == esboco_id, CatalogoEsbocos.usuario_id == current_user.id).values(
        **esboco.model_dump(exclude_unset=True)
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Esboço não encontrado ou não pertence ao usuário")
    
    await db.commit()
    
    # Busca o esboço atualizado para retornar
    result = await db.execute(select(CatalogoEsbocos).filter(CatalogoEsbocos.id == esboco_id))
    updated_esboco = result.scalars().first()
    return updated_esboco

@router.delete("/{esboco_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_esboco(esboco_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Deleta um esboço."""
    stmt = delete(CatalogoEsbocos).where(CatalogoEsbocos.id == esboco_id, CatalogoEsbocos.usuario_id == current_user.id)
    result = await db.execute(stmt)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Esboço não encontrado ou não pertence ao usuário")
    
    await db.commit()
    return {"message": "Esboço deletado com sucesso"}
