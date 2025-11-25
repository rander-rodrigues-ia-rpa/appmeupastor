# Dockerfile para o Frontend (React/TypeScript)

# 1. Estágio de Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do pnpm e do projeto
# O arquivo de lock correto é pnpm-lock.yaml
COPY package.json ./

# Instala as dependências (incluindo devDependencies)
# Usamos --production=false para garantir que o Tailwind CSS (devDependency) seja instalado
RUN npm install

# Copia o restante do código
COPY . .

# Constrói a aplicação (gera os arquivos estáticos)
RUN npm run build

# 2. Estágio Final (Servir os arquivos estáticos com Nginx)
FROM nginx:alpine

# Copia a build do estágio anterior para o diretório de serviço do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta padrão do Nginx
EXPOSE 80

# O comando padrão do Nginx já serve os arquivos estáticos
CMD ["nginx", "-g", "daemon off;"]
