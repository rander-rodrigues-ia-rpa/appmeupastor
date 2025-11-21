from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from .models import Usuario
from .schemas import UsuarioInDB, UsuarioUpdate
from .security import get_current_active_user, get_current_complete_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=UsuarioInDB)
async def read_users_me(current_user: Usuario = Depends(get_current_active_user)):
    """Retorna as informações do usuário logado."""
    return current_user

@router.put("/me/complete-profile", response_model=UsuarioInDB)
async def complete_profile(
    user_update: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Permite ao usuário completar o cadastro após o primeiro login social."""
    
    # Verifica se o perfil já está completo para evitar processamento desnecessário
    if current_user.is_profile_complete == "S":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O perfil já está completo."
        )

    # Atualiza os campos necessários
    current_user.telefone_contato = user_update.telefone_contato
    current_user.perfil_usuario = user_update.perfil_usuario
    current_user.is_profile_complete = "S"
    
    # Opcional: Atualizar nome e username se fornecidos
    if user_update.nome:
        current_user.nome = user_update.nome
    if user_update.username:
        current_user.username = user_update.username

    try:
        await db.commit()
        await db.refresh(current_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao completar o perfil: {e}"
        )

    return current_user

@router.get("/me/status", response_model=dict)
async def get_profile_status(current_user: Usuario = Depends(get_current_active_user)):
    """Retorna o status de completude do perfil do usuário."""
    return {
        "is_profile_complete": current_user.is_profile_complete == "S",
        "user_id": current_user.id,
        "email": current_user.email
    }

# Exemplo de rota que só pode ser acessada por usuários com perfil completo
@router.get("/protected-resource")
async def protected_resource(current_user: Usuario = Depends(get_current_complete_user)):
    return {"message": f"Bem-vindo, {current_user.nome}. Seu perfil está completo e você pode acessar este recurso."}
