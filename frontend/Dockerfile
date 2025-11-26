# 1. Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json ./

# Instala as dependências usando npm
RUN npm install

# Copia o restante do código
COPY . .

# Constrói a aplicação
RUN npm run build

# 2. Estágio Final
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8005

CMD ["nginx", "-g", "daemon off;"]