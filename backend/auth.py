from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
import httpx
from config import settings
from database import get_db
from models import Usuario
from schemas import UsuarioCreate, Token
from security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# URL de autorização do Google
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
# URL para obter o token de acesso
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
# URL para obter informações do usuário
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

@router.get("/google/login")
async def google_login():
    """Redireciona o usuário para a página de login do Google."""
    params = {
        "response_type": "code",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query_string}", status_code=status.HTTP_302_FOUND)

@router.get("/google/callback", response_model=Token)
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Recebe o código de autorização do Google e troca por um token JWT."""
    
    # 1. Trocar o código de autorização por um token de acesso do Google
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
            response.raise_for_status()
            google_token = response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Falha ao obter token do Google: {e.response.text}"
            )

    # 2. Obter informações do usuário com o token de acesso do Google
    headers = {"Authorization": f"Bearer {google_token['access_token']}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(GOOGLE_USERINFO_URL, headers=headers)
            response.raise_for_status()
            user_info = response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Falha ao obter informações do usuário do Google: {e.response.text}"
            )

    # 3. Processar o login/cadastro do usuário no banco de dados
    email = user_info.get("email")
    
    # Verificar se o usuário já existe
    result = await db.execute(select(Usuario).filter(Usuario.email == email))
    user = result.scalars().first()

    if user:
        # Usuário existente: atualizar informações e login
        user.nome = user_info.get("name", user.nome)
        user.avatar_url = user_info.get("picture", user.avatar_url)
        user.social_provider = "google"
        user.social_id = user_info.get("sub")
        # Atualizar last_login
        # O campo is_profile_complete será verificado no frontend
    else:
        # Novo usuário: criar registro
        new_user_data = {
            "email": email,
            "nome": user_info.get("name", "Usuário"),
            "username": email.split("@")[0],
            "social_provider": "google",
            "social_id": user_info.get("sub"),
            "avatar_url": user_info.get("picture"),
            "is_profile_complete": "N" # Perfil incompleto por padrão
        }
        new_user = Usuario(**new_user_data)
        db.add(new_user)
        user = new_user

    await db.commit()
    await db.refresh(user)

    # 4. Criar o token JWT para o sistema
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Redirecionar para o frontend com o token (ou retornar o token diretamente)
    # Para simplificar o backend, retornaremos o token diretamente.
    # O frontend será responsável por armazenar e usar o token.
    return Token(access_token=access_token, token_type="bearer")
