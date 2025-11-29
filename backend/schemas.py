from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# ==================== SCHEMAS DE AUTENTICAÇÃO ====================

class UsuarioLogin(BaseSchema):
    """Schema para login manual"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Senha com no mínimo 6 caracteres")

class UsuarioRegister(BaseSchema):
    """Schema para registro manual de novo usuário"""
    nome: str = Field(..., min_length=3, max_length=200, description="Nome completo")
    email: EmailStr
    password: str = Field(..., min_length=6, description="Senha com no mínimo 6 caracteres")
    username: Optional[str] = Field(None, max_length=100, description="Nome de usuário (opcional)")
    telefone_contato: Optional[str] = Field(None, max_length=20, description="Telefone (opcional)")
    perfil_usuario: Optional[str] = Field(None, description="Perfil do usuário (opcional)")
    
    @field_validator('nome')
    @classmethod
    def validate_nome(cls, v):
        if v and len(v.strip()) < 3:
            raise ValueError('Nome deve ter pelo menos 3 caracteres')
        return v.strip()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        return v

# ==================== SCHEMAS DE USUÁRIO ====================

class UsuarioBase(BaseSchema):
    nome: str
    email: EmailStr
    username: Optional[str] = None
    telefone_contato: Optional[str] = None
    perfil_usuario: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    """Usado para criação via OAuth (não usa este para registro manual)"""
    password: Optional[str] = Field(None, min_length=6)

class UsuarioUpdate(BaseSchema):
    """Schema para atualização de perfil"""
    nome: Optional[str] = None
    username: Optional[str] = None
    telefone_contato: Optional[str] = None
    perfil_usuario: Optional[str] = None

class UsuarioInDB(UsuarioBase):
    """Schema completo do usuário retornado do banco"""
    id: int
    ativo: str
    social_provider: Optional[str] = None
    social_id: Optional[str] = None
    avatar_url: Optional[str] = None
    is_profile_complete: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# ==================== SCHEMAS DE TEMA ====================

class TemaBase(BaseSchema):
    descricao: str = Field(..., min_length=1, max_length=200)

class TemaCreate(TemaBase):
    pass

class TemaUpdate(BaseSchema):
    descricao: Optional[str] = Field(None, min_length=1, max_length=200)
    ativo: Optional[str] = Field(None, pattern="^[SN]$")

class Tema(TemaBase):
    id: int
    usuario_id: int
    ativo: str

# ==================== SCHEMAS DE SUBTEMA ====================

class SubtemaBase(BaseSchema):
    descricao: str = Field(..., min_length=1, max_length=200)
    tema_id: int

class SubtemaCreate(SubtemaBase):
    pass

class SubtemaUpdate(BaseSchema):
    descricao: Optional[str] = Field(None, min_length=1, max_length=200)
    tema_id: Optional[int] = None
    ativo: Optional[str] = Field(None, pattern="^[SN]$")

class Subtema(SubtemaBase):
    id: int
    ativo: str

# ==================== SCHEMAS DE ESBOÇOS ====================

class CatalogoEsbocosBase(BaseSchema):
    tema_id: int
    subtema_id: Optional[int] = None
    titulo: str = Field(..., min_length=1, max_length=300)
    texto_biblico: str = Field(..., min_length=1, max_length=200)
    resumo: str = Field(..., min_length=1)
    link_arquivo_esboco: Optional[str] = Field(None, max_length=500)
    link_arquivo_pregacao_completa: Optional[str] = Field(None, max_length=500)
    esboco_manual: Optional[str] = None

class CatalogoEsbocosCreate(CatalogoEsbocosBase):
    pass

class CatalogoEsbocosUpdate(BaseSchema):
    tema_id: Optional[int] = None
    subtema_id: Optional[int] = None
    titulo: Optional[str] = Field(None, min_length=1, max_length=300)
    texto_biblico: Optional[str] = Field(None, min_length=1, max_length=200)
    resumo: Optional[str] = Field(None, min_length=1)
    link_arquivo_esboco: Optional[str] = Field(None, max_length=500)
    link_arquivo_pregacao_completa: Optional[str] = Field(None, max_length=500)
    esboco_manual: Optional[str] = None

class CatalogoEsbocos(CatalogoEsbocosBase):
    id: int
    usuario_id: int
    created_at: datetime

# ==================== SCHEMAS DE VERSÍCULOS ====================

class VersiculoTemaBase(BaseSchema):
    tema_id: int
    subtema_id: Optional[int] = None
    versiculo: str = Field(..., min_length=1, max_length=100, description="Referência do versículo (ex: João 3:16)")
    descricao_versiculo: str = Field(..., min_length=1, description="Texto completo do versículo")

class VersiculoTemaCreate(VersiculoTemaBase):
    pass

class VersiculoTemaUpdate(BaseSchema):
    tema_id: Optional[int] = None
    subtema_id: Optional[int] = None
    versiculo: Optional[str] = Field(None, min_length=1, max_length=100)
    descricao_versiculo: Optional[str] = Field(None, min_length=1)

class VersiculoTema(VersiculoTemaBase):
    id: int
    usuario_id: int
    created_at: datetime

# ==================== SCHEMAS DE TOKEN ====================

class Token(BaseSchema):
    """Schema para resposta de autenticação"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseSchema):
    """Schema para dados extraídos do token"""
    email: Optional[str] = None

# ==================== SCHEMAS DE DASHBOARD ====================

class DashboardIndicators(BaseSchema):
    """Schema para indicadores do dashboard"""
    quantidade_esbocos: int = 0
    quantidade_versiculos: int = 0
    quantidade_temas: int = 0

# ==================== SCHEMAS DE RESPOSTA ====================

class MessageResponse(BaseSchema):
    """Schema genérico para mensagens de resposta"""
    message: str
    detail: Optional[str] = None

class ProfileStatus(BaseSchema):
    """Schema para status do perfil"""
    is_profile_complete: bool
    user_id: int
    email: str
