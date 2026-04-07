# Cubos Movies API 🎬

Uma API robusta e escalável para gerenciamento de catálogos de filmes, construída com Node.js, TypeScript e as melhores práticas de desenvolvimento.

## 🚀 Tecnologias Utilizadas

- **Backend:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Autenticação:** [Better Auth](https://www.better-auth.com/)
- **Documentação:** [Swagger](https://swagger.io/) (OpenAPI 3.0)
- **Logs:** [Winston](https://github.com/winstonjs/winston) + [Grafana Loki](https://grafana.com/oss/loki/)
- **Testes:** [Jest](https://jestjs.io/)
- **Qualidade de Código:** [ESLint](https://eslint.org/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **CI/CD:** GitHub Actions

## 📋 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (v22 ou superior)
- [Docker](https://www.docker.com/get-started) (para rodar via containers)
- [Git](https://git-scm.com/)

---

## 🛠️ Como rodar o projeto localmente

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/cubos-movies-api.git
cd cubos-movies-api
```

### 2. Configure as variáveis de ambiente
Copie o arquivo de exemplo e preencha com seus dados:
```bash
cp .env.example .env
```

### 3. Instale as dependências
```bash
npm install
```

### 4. Configure o Banco de Dados (Prisma)
Certifique-se de que seu PostgreSQL está rodando e execute:
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. (Opcional) Popule o banco com dados de teste
```bash
npx tsx prisma/seed-test-movies.ts
```

### 6. Inicie o servidor
```bash
npm run dev
```
A API estará disponível em `http://localhost:5000`.

---

## 🐳 Como rodar utilizando Docker Compose

A maneira mais rápida de subir o ambiente completo (API + Banco de Dados):

### 1. Suba os containers
```bash
docker-compose up -d
```

Este comando irá:
1. Criar um banco de dados PostgreSQL.
2. Construir a imagem da API.
3. Executar as migrations automaticamente.
4. Disponibilizar a API em `http://localhost:5000`.

### 2. Verifique os logs
```bash
docker-compose logs -f app
```

---

## 📖 Documentação da API

A documentação interativa (Swagger) pode ser acessada em:
👉 [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Lá você encontrará todos os endpoints, modelos de dados e poderá realizar testes diretamente pelo navegador.

---

## 🧪 Testes e Qualidade

### Executar Testes
```bash
npm test
```

### Executar Lint (Análise Estática)
```bash
npm run lint
```

---

## 🏗️ Estrutura do Projeto

O projeto segue uma arquitetura baseada em domínios para facilitar a manutenção e escalabilidade:

```text
src/
├── domains/           # Lógica de negócio dividida por domínios (v1/movie, etc)
│   └── v1/
│       └── movie/     # Controller, Service, Repository e Routes de Filmes
├── generated/         # Arquivos gerados automaticamente (Prisma Client)
├── lib/               # Bibliotecas compartilhadas (Prisma, Auth, Logger)
├── index.ts           # Ponto de entrada da aplicação
└── swagger.ts         # Configuração da documentação
```

## 🛡️ CI/CD

O projeto possui uma pipeline automatizada via **GitHub Actions** que executa o `lint` e todos os `testes` em cada Pull Request para garantir a integridade do código antes do merge.
