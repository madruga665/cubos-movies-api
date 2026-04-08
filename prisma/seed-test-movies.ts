import { prisma } from '../src/lib/prisma';
import { recommendedMovies } from '../src/lib/recommended-movies';
import logger from '../src/lib/logger';

async function main() {
  // 1. Tenta pegar o ID do argumento da linha de comando (ex: npx tsx seed.ts ID_AQUI)
  // 2. Se não houver, tenta do env
  // 3. Se não houver, busca o primeiro usuário do banco
  let userId = process.argv[2] || process.env.TEST_USER_ID;

  if (!userId) {
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      userId = firstUser.id;
      logger.info('Nenhum ID fornecido via argumento. Usando o primeiro usuário encontrado no banco.', { userId, name: firstUser.name });
    }
  }

  // Se ainda não tiver ID (banco vazio), cria um usuário de teste padrão
  if (!userId) {
    userId = 'user_default_test_id';
    logger.info('Nenhum usuário encontrado e nenhum ID fornecido. Criando usuário de teste padrão...', { userId });
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
  }

  logger.info('Iniciando processo de população para o usuário', { userId });
  await prisma.movie.deleteMany({
    where: { userId },
  });

  logger.info('Inserindo filmes recomendados', { userId, count: recommendedMovies.length });
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
