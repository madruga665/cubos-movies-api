# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala openssl para o Prisma
RUN apk add --no-cache openssl

# Copia arquivos de definição de pacotes e o diretório do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (para poder compilar e gerar o swagger.json)
RUN npm install

# Copia todo o código fonte
COPY . .

# Gera o cliente Prisma
RUN DATABASE_URL="postgresql://postgres:password@localhost:5432/cubos_movies_db?schema=public" npx prisma generate --schema=prisma/schema.prisma

# Compila o projeto (para validação e geração do swagger.json)
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

# Copia o código fonte (necessário para os path aliases do tsconfig), tsconfig, config do prisma e swagger.json
COPY --from=builder /app/src /app/src
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/prisma.config.ts /app/
COPY --from=builder /app/tsconfig.json /app/
COPY --from=builder /app/swagger.json /app/

# Porta
ENV PORT=5000
EXPOSE 5000

# Executa as migrações e inicia a aplicação usando node com suporte ao tsx
CMD npx prisma migrate deploy && node --import tsx src/index.ts
