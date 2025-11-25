from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update
from typing import List
from database import get_db
from models import VersiculoTema, Tema, Subtema, Usuario
from schemas import VersiculoTema as VersiculoSchema, VersiculoTemaCreate, VersiculoTemaUpdate
from security import get_current_complete_user

router = APIRouter(
    prefix="/versiculos",
    tags=["versiculos"],
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

# --- Rotas para Versículos por Tema ---

@router.post("/", response_model=VersiculoSchema, status_code=status.HTTP_201_CREATED)
async def create_versiculo(versiculo: VersiculoTemaCreate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Cria um novo versículo por tema."""
    await check_tema_subtema_ownership(db, versiculo.tema_id, versiculo.subtema_id, current_user.id)
    
    new_versiculo = VersiculoTema(
        **versiculo.model_dump(),
        usuario_id=current_user.id
    )
    db.add(new_versiculo)
    await db.commit()
    await db.refresh(new_versiculo)
    return new_versiculo

@router.get("/", response_model=List[VersiculoSchema])
async def read_versiculos(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Lista todos os versículos por tema do usuário logado."""
    result = await db.execute(
        select(VersiculoTema).filter(VersiculoTema.usuario_id == current_user.id).order_by(VersiculoTema.created_at.desc())
    )
    versiculos = result.scalars().all()
    return versiculos

@router.get("/{versiculo_id}", response_model=VersiculoSchema)
async def read_versiculo(versiculo_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Retorna um versículo específico."""
    result = await db.execute(
        select(VersiculoTema).filter(VersiculoTema.id == versiculo_id, VersiculoTema.usuario_id == current_user.id)
    )
    versiculo = result.scalars().first()
    if not versiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Versículo não encontrado ou não pertence ao usuário")
    return versiculo

@router.put("/{versiculo_id}", response_model=VersiculoSchema)
async def update_versiculo(versiculo_id: int, versiculo: VersiculoTemaUpdate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Atualiza um versículo por tema existente."""
    await check_tema_subtema_ownership(db, versiculo.tema_id, versiculo.subtema_id, current_user.id)
    
    stmt = update(VersiculoTema).where(VersiculoTema.id == versiculo_id, VersiculoTema.usuario_id == current_user.id).values(
        **versiculo.model_dump(exclude_unset=True)
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Versículo não encontrado ou não pertence ao usuário")
    
    await db.commit()
    
    # Busca o versículo atualizado para retornar
    result = await db.execute(select(VersiculoTema).filter(VersiculoTema.id == versiculo_id))
    updated_versiculo = result.scalars().first()
    return updated_versiculo

@router.delete("/{versiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_versiculo(versiculo_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Deleta um versículo por tema."""
    stmt = delete(VersiculoTema).where(VersiculoTema.id == versiculo_id, VersiculoTema.usuario_id == current_user.id)
    result = await db.execute(stmt)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Versículo não encontrado ou não pertence ao usuário")
    
    await db.commit()
    return {"message": "Versículo deletado com sucesso"}
