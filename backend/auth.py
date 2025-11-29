from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
import httpx
from config import settings
from database import get_db
from models import Usuario
from schemas import Token, UsuarioLogin, UsuarioRegister
from security import create_access_token, get_password_hash, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# URLs do Google OAuth
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

@router.get("/google/login")
async def google_login():
    """Redireciona o usuário para a página de login do Google."""
    if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth não está configurado. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env"
        )
    
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

@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Recebe o código de autorização do Google e troca por um token JWT."""
    
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

    email = user_info.get("email")
    
    result = await db.execute(select(Usuario).filter(Usuario.email == email))
    user = result.scalars().first()

    if user:
        # Usuário existente - atualiza informações
        user.nome = user_info.get("name", user.nome)
        user.avatar_url = user_info.get("picture", user.avatar_url)
        user.social_provider = "google"
        user.social_id = user_info.get("sub")
    else:
        # Novo usuário - cria registro
        new_user_data = {
            "email": email,
            "nome": user_info.get("name", "Usuário"),
            "username": email.split("@")[0],
            "social_provider": "google",
            "social_id": user_info.get("sub"),
            "avatar_url": user_info.get("picture"),
            "is_profile_complete": "N",
            "ativo": "S"
        }
        new_user = Usuario(**new_user_data)
        db.add(new_user)
        user = new_user

    await db.commit()
    await db.refresh(user)

    # Cria o token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Redireciona para o frontend com o token
    frontend_url = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:5173"
    return RedirectResponse(
        url=f"{frontend_url}/auth/callback?token={access_token}",
        status_code=status.HTTP_302_FOUND
    )

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UsuarioRegister, db: AsyncSession = Depends(get_db)):
    """
    Registro manual de novo usuário.
    
    - **nome**: Nome completo do usuário
    - **email**: Email único
    - **password**: Senha (mínimo 6 caracteres)
    - **telefone_contato**: Telefone (opcional)
    - **perfil_usuario**: Perfil do usuário (opcional)
    """
    
    # Verifica se o email já existe
    result = await db.execute(select(Usuario).filter(Usuario.email == user_data.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado. Faça login ou use outro email."
        )
    
    # Valida o nome
    if not user_data.nome or len(user_data.nome.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome deve ter pelo menos 3 caracteres"
        )
    
    # Valida a senha
    if not user_data.password or len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha deve ter pelo menos 6 caracteres"
        )
    
    # Cria o username baseado no email se não fornecido
    username = user_data.username if user_data.username else user_data.email.split("@")[0]
    
    # Verifica se já existe um usuário com esse username
    result = await db.execute(select(Usuario).filter(Usuario.username == username))
    if result.scalars().first():
        # Adiciona números ao final do username até encontrar um disponível
        counter = 1
        while True:
            new_username = f"{username}{counter}"
            result = await db.execute(select(Usuario).filter(Usuario.username == new_username))
            if not result.scalars().first():
                username = new_username
                break
            counter += 1
    
    # Determina se o perfil está completo
    is_profile_complete = "S" if (user_data.telefone_contato and user_data.perfil_usuario) else "N"
    
    # Cria o novo usuário
    new_user = Usuario(
        email=user_data.email,
        nome=user_data.nome.strip(),
        username=username,
        password=get_password_hash(user_data.password),
        telefone_contato=user_data.telefone_contato,
        perfil_usuario=user_data.perfil_usuario,
        is_profile_complete=is_profile_complete,
        ativo="S"
    )
    
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )
    
    # Cria o token JWT para login automático
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.post("/login", response_model=Token)
async def login(credentials: UsuarioLogin, db: AsyncSession = Depends(get_db)):
    """
    Login manual com email e senha.
    
    - **email**: Email do usuário
    - **password**: Senha do usuário
    """
    
    # Busca o usuário pelo email
    result = await db.execute(select(Usuario).filter(Usuario.email == credentials.email))
    user = result.scalars().first()
    
    # Verifica se o usuário existe
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica se o usuário tem senha cadastrada (pode ter vindo do Google OAuth)
    if not user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Este email foi cadastrado via Google. Use 'Continuar com Google' para fazer login.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica a senha
    if not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica se o usuário está ativo
    if user.ativo != "S":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo. Entre em contato com o suporte."
        )
    
    # Cria o token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/health")
async def auth_health():
    """Verifica se o serviço de autenticação está funcionando."""
    google_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID != "")
    
    return {
        "status": "healthy",
        "google_oauth_configured": google_configured,
        "manual_auth_enabled": True
    }
