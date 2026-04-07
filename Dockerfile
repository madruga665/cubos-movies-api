# Stage 1: Runtime (Simplificado para rodar com tsx)
FROM node:22-alpine

WORKDIR /app

# Instala openssl para o Prisma
RUN apk add --no-cache openssl

# Copia arquivos de definição
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências (incluindo tsx)
RUN npm install

# Copia código fonte
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# Porta
ENV PORT=5000
EXPOSE 5000

# Comando para rodar com tsx
CMD npx prisma migrate deploy && npx tsx src/index.ts
