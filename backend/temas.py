from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update
from typing import List
from database import get_db
from models import Tema, Subtema, Usuario
from schemas import Tema as TemaSchema, TemaCreate, TemaUpdate, Subtema as SubtemaSchema, SubtemaCreate, SubtemaUpdate
from security import get_current_complete_user

router = APIRouter(
    prefix="/temas",
    tags=["temas"],
    dependencies=[Depends(get_current_complete_user)] # Protege todas as rotas com autenticação e perfil completo
)

# --- Rotas para Temas ---

@router.post("/", response_model=TemaSchema, status_code=status.HTTP_201_CREATED)
async def create_tema(tema: TemaCreate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Cria um novo tema."""
    new_tema = Tema(
        descricao=tema.descricao,
        usuario_id=current_user.id
    )
    db.add(new_tema)
    await db.commit()
    await db.refresh(new_tema)
    return new_tema

@router.get("/", response_model=List[TemaSchema])
async def read_temas(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Lista todos os temas do usuário logado."""
    result = await db.execute(
        select(Tema).filter(Tema.usuario_id == current_user.id).order_by(Tema.descricao)
    )
    temas = result.scalars().all()
    return temas

@router.put("/{tema_id}", response_model=TemaSchema)
async def update_tema(tema_id: int, tema: TemaUpdate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Atualiza um tema existente."""
    stmt = update(Tema).where(Tema.id == tema_id, Tema.usuario_id == current_user.id).values(
        descricao=tema.descricao,
        ativo=tema.ativo
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tema não encontrado ou não pertence ao usuário")
    
    await db.commit()
    
    # Busca o tema atualizado para retornar
    result = await db.execute(select(Tema).filter(Tema.id == tema_id))
    updated_tema = result.scalars().first()
    return updated_tema

@router.delete("/{tema_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tema(tema_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Deleta um tema (e seus subtemas, se houver)."""
    # A deleção em cascata deve ser configurada no modelo ou tratada aqui.
    # Para simplicidade, vamos deletar o tema e confiar na configuração do modelo (ON DELETE NO ACTION)
    # No nosso modelo, o FK não tem ON DELETE CASCADE, então vamos deletar os subtemas primeiro.
    
    # 1. Deletar Subtemas relacionados
    subtema_stmt = delete(Subtema).where(Subtema.tema_id == tema_id)
    await db.execute(subtema_stmt)
    
    # 2. Deletar o Tema
    tema_stmt = delete(Tema).where(Tema.id == tema_id, Tema.usuario_id == current_user.id)
    result = await db.execute(tema_stmt)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tema não encontrado ou não pertence ao usuário")
    
    await db.commit()
    return {"message": "Tema e subtemas relacionados deletados com sucesso"}

# --- Rotas para Subtemas ---

@router.post("/{tema_id}/subtemas", response_model=SubtemaSchema, status_code=status.HTTP_201_CREATED)
async def create_subtema(subtema: SubtemaCreate, tema_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Cria um novo subtema para um tema específico."""
    # Verifica se o tema existe e pertence ao usuário
    result = await db.execute(select(Tema).filter(Tema.id == tema_id, Tema.usuario_id == current_user.id))
    tema = result.scalars().first()
    if not tema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tema não encontrado ou não pertence ao usuário")
        
    new_subtema = Subtema(
        descricao=subtema.descricao,
        tema_id=tema_id
    )
    db.add(new_subtema)
    await db.commit()
    await db.refresh(new_subtema)
    return new_subtema

@router.get("/{tema_id}/subtemas", response_model=List[SubtemaSchema])
async def read_subtemas_by_tema(tema_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Lista todos os subtemas de um tema específico do usuário logado."""
    # Verifica se o tema existe e pertence ao usuário
    result = await db.execute(select(Tema).filter(Tema.id == tema_id, Tema.usuario_id == current_user.id))
    tema = result.scalars().first()
    if not tema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tema não encontrado ou não pertence ao usuário")
        
    result = await db.execute(
        select(Subtema).filter(Subtema.tema_id == tema_id).order_by(Subtema.descricao)
    )
    subtemas = result.scalars().all()
    return subtemas

@router.put("/subtemas/{subtema_id}", response_model=SubtemaSchema)
async def update_subtema(subtema_id: int, subtema: SubtemaUpdate, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Atualiza um subtema existente."""
    # Verifica se o subtema existe e se o tema pai pertence ao usuário
    result = await db.execute(
        select(Subtema).join(Tema).filter(Subtema.id == subtema_id, Tema.usuario_id == current_user.id)
    )
    existing_subtema = result.scalars().first()
    if not existing_subtema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtema não encontrado ou não pertence ao usuário")
        
    stmt = update(Subtema).where(Subtema.id == subtema_id).values(
        descricao=subtema.descricao,
        tema_id=subtema.tema_id, # Permite mudar o tema pai
        ativo=subtema.ativo
    )
    await db.execute(stmt)
    await db.commit()
    
    # Busca o subtema atualizado para retornar
    result = await db.execute(select(Subtema).filter(Subtema.id == subtema_id))
    updated_subtema = result.scalars().first()
    return updated_subtema

@router.delete("/subtemas/{subtema_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtema(subtema_id: int, db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_complete_user)):
    """Deleta um subtema."""
    # Verifica se o subtema existe e se o tema pai pertence ao usuário
    result = await db.execute(
        select(Subtema).join(Tema).filter(Subtema.id == subtema_id, Tema.usuario_id == current_user.id)
    )
    existing_subtema = result.scalars().first()
    if not existing_subtema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtema não encontrado ou não pertence ao usuário")
        
    stmt = delete(Subtema).where(Subtema.id == subtema_id)
    await db.execute(stmt)
    await db.commit()
    return {"message": "Subtema deletado com sucesso"}
