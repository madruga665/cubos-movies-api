import { prisma } from '../src/lib/prisma';
import { recommendedMovies } from '../src/lib/recommended-movies';
import logger from '../src/lib/logger';

async function main() {
  const userId = process.env.TEST_USER_ID || 'id do seu user de test';

  logger.info('Verificando/Criando usuário', { userId });

  // Garantir que o usuário existe para não dar erro de Foreign Key
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: 'Usuário de Teste',
      email: 'teste@example.com',
      emailVerified: true,
    },
  });

  // Limpar filmes existentes para evitar duplicatas se rodar o seed novamente
  logger.info('Limpando filmes existentes', { userId });
  await prisma.movie.deleteMany({
    where: { userId },
  });

  logger.info('Inserindo filmes recomendados', { count: recommendedMovies.length });
  for (const movie of recommendedMovies) {
    await prisma.movie.create({
      data: {
        ...movie,
        userId,
      },
    });
  }

  logger.info('Seed concluído com sucesso', { count: recommendedMovies.length });
}

main()
  .catch((e) => {
    logger.error('Erro durante a execução do seed', { error: e });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
