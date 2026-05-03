FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências (SQLite requer compilação em alguns casos, mas a imagem alpine do node já atende bem, ou podemos usar dependências build)
# O pacote better-sqlite3 precisa de build tools no Alpine
RUN apk add --no-cache python3 make g++ && \
    npm install --production && \
    apk del python3 make g++

# Copia o restante do código
COPY . .

# Expõe a porta que o app roda internamente
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
