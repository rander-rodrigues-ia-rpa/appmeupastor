from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(Text, nullable=False)
    nome = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True, index=True)
    telefone_contato = Column(Text, nullable=True) # Alterado para nullable=True
    ativo = Column(Text, default="S") # Usando Text para 'S'/'N'
    password = Column(Text, nullable=True)
    alterou_senha = Column(Text, default="N")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    social_provider = Column(Text, nullable=True)
    social_id = Column(Text, nullable=True, unique=True)
    avatar_url = Column(Text, nullable=True)
    is_profile_complete = Column(Text, default="N") # Usando Text para 'S'/'N'
    perfil_usuario = Column(Text, nullable=True)
    last_login = Column(DateTime(timezone=True))

    temas = relationship("Tema", back_populates="usuario")
    esbocos = relationship("CatalogoEsbocos", back_populates="usuario")
    versiculos = relationship("VersiculoTema", back_populates="usuario")

class Tema(Base):
    __tablename__ = "tema"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(Text, nullable=False)
    ativo = Column(Text, default="S")
    usuario_id = Column(Integer, ForeignKey("usuario.id"))

    usuario = relationship("Usuario", back_populates="temas")
    subtemas = relationship("Subtema", back_populates="tema")
    esbocos = relationship("CatalogoEsbocos", back_populates="tema")
    versiculos = relationship("VersiculoTema", back_populates="tema")

class Subtema(Base):
    __tablename__ = "subtema"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(Text, nullable=False)
    tema_id = Column(Integer, ForeignKey("tema.id"), nullable=False)
    ativo = Column(Text, default="S")

    tema = relationship("Tema", back_populates="subtemas")
    esbocos = relationship("CatalogoEsbocos", back_populates="subtema")
    versiculos = relationship("VersiculoTema", back_populates="subtema")

class CatalogoEsbocos(Base):
    __tablename__ = "catalogo_esbocos"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    tema_id = Column(Integer, ForeignKey("tema.id"), nullable=False)
    subtema_id = Column(Integer, ForeignKey("subtema.id"), nullable=True)
    titulo = Column(Text, nullable=False)
    texto_biblico = Column(Text, nullable=False)
    resumo = Column(Text, nullable=False)
    link_arquivo_esboco = Column(Text, nullable=True)
    link_arquivo_pregacao_completa = Column(Text, nullable=True)
    esboco_manual = Column(Text, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="esbocos")
    tema = relationship("Tema", back_populates="esbocos")
    subtema = relationship("Subtema", back_populates="esbocos")

class VersiculoTema(Base):
    __tablename__ = "versiculo_tema"

    id = Column(Integer, primary_key=True, index=True)
    tema_id = Column(Integer, ForeignKey("tema.id"), nullable=False)
    subtema_id = Column(Integer, ForeignKey("subtema.id"), nullable=True)
    versiculo = Column(Text, nullable=False)
    descricao_versiculo = Column(Text, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    usuario = relationship("Usuario", back_populates="versiculos")
    tema = relationship("Tema", back_populates="versiculos")
    subtema = relationship("Subtema", back_populates="versiculos")
