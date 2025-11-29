from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# Schemas para Usuário
class UsuarioBase(BaseSchema):
    nome: str
    email: EmailStr
    username: Optional[str] = None
    telefone_contato: Optional[str] = None
    perfil_usuario: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: Optional[str] = Field(None, min_length=6)

class UsuarioLogin(BaseSchema):
    email: EmailStr
    password: str

class UsuarioUpdate(BaseSchema):
    nome: Optional[str] = None
    username: Optional[str] = None
    telefone_contato: Optional[str] = None
    perfil_usuario: Optional[str] = None
    is_profile_complete: Optional[str] = None

class UsuarioInDB(UsuarioBase):
    id: int
    ativo: str
    social_provider: Optional[str] = None
    social_id: Optional[str] = None
    avatar_url: Optional[str] = None
    is_profile_complete: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# Schemas para Tema
class TemaBase(BaseSchema):
    descricao: str

class TemaCreate(TemaBase):
    pass

class TemaUpdate(BaseSchema):
    descricao: Optional[str] = None
    ativo: Optional[str] = None

class Tema(TemaBase):
    id: int
    usuario_id: int
    ativo: str

# Schemas para Subtema
class SubtemaBase(BaseSchema):
    descricao: str
    tema_id: int

class SubtemaCreate(SubtemaBase):
    pass

class SubtemaUpdate(BaseSchema):
    descricao: Optional[str] = None
    tema_id: Optional[int] = None
    ativo: Optional[str] = None

class Subtema(SubtemaBase):
    id: int
    ativo: str

# Schemas para Catálogo de Esboços
class CatalogoEsbocosBase(BaseSchema):
    tema_id: int
    subtema_id: Optional[int] = None
    titulo: str
    texto_biblico: str
    resumo: str
    link_arquivo_esboco: Optional[str] = None
    link_arquivo_pregacao_completa: Optional[str] = None
    esboco_manual: Optional[str] = None

class CatalogoEsbocosCreate(CatalogoEsbocosBase):
    pass

class CatalogoEsbocosUpdate(BaseSchema):
    tema_id: Optional[int] = None
    subtema_id: Optional[int] = None
    titulo: Optional[str] = None
    texto_biblico: Optional[str] = None
    resumo: Optional[str] = None
    link_arquivo_esboco: Optional[str] = None
    link_arquivo_pregacao_completa: Optional[str] = None
    esboco_manual: Optional[str] = None

class CatalogoEsbocos(CatalogoEsbocosBase):
    id: int
    usuario_id: int
    created_at: datetime

# Schemas para Versículo por Tema
class VersiculoTemaBase(BaseSchema):
    tema_id: int
    subtema_id: Optional[int] = None
    versiculo: str
    descricao_versiculo: str

class VersiculoTemaCreate(VersiculoTemaBase):
    pass

class VersiculoTemaUpdate(BaseSchema):
    tema_id: Optional[int] = None
    subtema_id: Optional[int] = None
    versiculo: Optional[str] = None
    descricao_versiculo: Optional[str] = None

class VersiculoTema(VersiculoTemaBase):
    id: int
    usuario_id: int
    created_at: datetime

# Schema para o Token JWT
class Token(BaseSchema):
    access_token: str
    token_type: str

class TokenData(BaseSchema):
    email: Optional[str] = None
