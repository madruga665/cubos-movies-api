import logger from '../../../../lib/logger';
import { PrismaClient } from '../../../../generated/prisma';
import { CreateMovieDTO } from '../models/movie-models';

export class MovieRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

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

  async findById(id: string, userId: string) {
    const startTime = Date.now();
    logger.info('Buscando filme por ID no repositório', { id, userId });

    try {
      const movie = await this.prisma.movie.findUnique({
        where: { id, userId },
      });

      const duration = Date.now() - startTime;
      logger.info('Consulta de filme por ID concluída', {
        id,
        found: !!movie,
        durationMs: duration,
      });

      return movie;
    } catch (error) {
      logger.error('Erro ao buscar filme por ID no MovieRepository', { error, id, userId });
      throw error;
    }
  }

  async create(data: CreateMovieDTO) {
    const startTime = Date.now();
    logger.info('Criando novo filme no repositório', { title: data.title, userId: data.userId });

    try {
      const movie = await this.prisma.movie.create({
        data,
      });

      const duration = Date.now() - startTime;
      logger.info('Filme criado com sucesso no banco', {
        id: movie.id,
        durationMs: duration,
      });

      return movie;
    } catch (error) {
      logger.error('Erro ao criar filme no MovieRepository', { error, title: data.title });
      throw error;
    }
  }
}
