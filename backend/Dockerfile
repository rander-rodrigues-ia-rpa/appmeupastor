# Dockerfile para o Backend (Python/FastAPI)

# Estágio de Build
FROM python:3.11-slim AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo de requisitos e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Estágio Final
FROM python:3.11-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia as dependências instaladas do estágio de build
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que o Uvicorn irá rodar
EXPOSE 8003

# Comando para rodar a aplicação com Uvicorn
# O host 0.0.0.0 é necessário para que o container seja acessível externamente
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
