import { prisma } from '../src/lib/prisma';
import logger from '../src/lib/logger';

async function main() {
  logger.info('Iniciando limpeza total da tabela Movie...');
  
  const result = await prisma.movie.deleteMany({});
  
  logger.info('Limpeza concluída com sucesso!', { count: result.count });
}

main()
  .catch((e) => {
    logger.error('Erro ao limpar a tabela Movie', { error: e });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
