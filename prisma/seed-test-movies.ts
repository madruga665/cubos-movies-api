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
      logger.info(
        { userId, name: firstUser.name },
        'Nenhum ID fornecido via argumento. Usando o primeiro usuário encontrado no banco.',
      );
    }
  }

  // Se ainda não tiver ID (banco vazio), cria um usuário de teste padrão
  if (!userId) {
    userId = 'user_default_test_id';
    logger.info(
      { userId },
      'Nenhum usuário encontrado e nenhum ID fornecido. Criando usuário de teste padrão...',
    );
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

  logger.info({ userId }, 'Iniciando processo de população para o usuário');
  await prisma.movie.deleteMany({
    where: { userId },
  });

  logger.info({ userId, count: recommendedMovies.length }, 'Inserindo filmes recomendados');
  for (const movie of recommendedMovies) {
    await prisma.movie.create({
      data: {
        ...movie,
        userId,
      },
    });
  }

  logger.info({ count: recommendedMovies.length }, 'Seed concluído com sucesso');
}

main()
  .catch((e) => {
    logger.error({ error: e }, 'Erro durante a execução do seed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
