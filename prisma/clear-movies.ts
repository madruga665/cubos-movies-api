import { prisma } from '../src/lib/prisma';
import logger from '../src/lib/logger';

async function main() {
  const result = await prisma.movie.deleteMany({});

  logger.info({ count: result.count }, 'Limpeza concluída com sucesso!');
}

main()
  .catch((e) => {
    logger.error({ error: e }, 'Erro ao limpar a tabela Movie');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
