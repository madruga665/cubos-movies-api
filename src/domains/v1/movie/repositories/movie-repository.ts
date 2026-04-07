import { prisma as defaultPrisma } from '../../../../lib/prisma';
import logger from '../../../../lib/logger';
import { PrismaClient } from '../../../../generated/prisma';

export class MovieRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findByUserId(userId: string, skip: number = 0, take: number = 10) {
    const startTime = Date.now();
    logger.info('Iniciando consulta ao Prisma para findByUserId', { userId, skip, take });

    try {
      const [movies, total] = await Promise.all([
        this.prisma.movie.findMany({
          where: { userId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.movie.count({
          where: { userId },
        }),
      ]);

      const duration = Date.now() - startTime;
      logger.info('Consulta ao Prisma concluída', {
        durationMs: duration,
        moviesCount: movies.length,
        totalInDb: total,
      });

      return { movies, total };
    } catch (error) {
      logger.error('Erro durante consulta ao Prisma no MovieRepository', { error, userId });
      throw error;
    }
  }
}
