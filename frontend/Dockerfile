# 1. Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Constrói a aplicação
RUN npm run build

# 2. Estágio Final
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a SUA configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos do build React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
