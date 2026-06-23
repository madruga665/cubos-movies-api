# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala openssl para o Prisma
RUN apk add --no-cache openssl

# Copia arquivos de definição de pacotes e o diretório do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (para poder compilar)
RUN npm install

# Copia todo o código fonte
COPY . .

# Gera o cliente Prisma
RUN DATABASE_URL="postgresql://postgres:password@localhost:5432/cubos_movies_db?schema=public" npx prisma generate --schema=prisma/schema.prisma

# Compila o projeto (isso vai rodar o prebuild para gerar o swagger.json e depois rodar tsc)
RUN npm run build

# Stage 2: Runtime (Produção limpa e otimizada)
FROM node:22-alpine

WORKDIR /app

# Instala openssl para o Prisma
RUN apk add --no-cache openssl

# Copia arquivos de definição de pacotes
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Copia o Prisma Client gerado e os arquivos compilados do estágio anterior
COPY --from=builder /app/src/generated /app/src/generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Porta
ENV PORT=5000
EXPOSE 5000

# Executa as migrações e inicia a aplicação compilada usando node com suporte a tsx para importações sem extensão
CMD npx prisma migrate deploy && node --import tsx dist/src/index.js
