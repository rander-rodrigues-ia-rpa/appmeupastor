# Dockerfile para o Frontend (React/TypeScript)

# 1. Estágio de Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do pnpm e do projeto
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Constrói a aplicação (gera os arquivos estáticos)
# O comando de build do Vite deve ser ajustado conforme o package.json
RUN pnpm run build

# 2. Estágio Final (Servir os arquivos estáticos com Nginx)
FROM nginx:alpine

# Copia a build do estágio anterior para o diretório de serviço do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta padrão do Nginx
EXPOSE 80

# O comando padrão do Nginx já serve os arquivos estáticos
CMD ["nginx", "-g", "daemon off;"]
