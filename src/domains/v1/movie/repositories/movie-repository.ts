import logger from '../../../../lib/logger';
import { PrismaClient } from '../../../../generated/prisma';
import { CreateMovieDTO, UpdateMovieDTO } from '../models/movie-models';

export class MovieRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByUserId(userId: string, skip: number = 0, take: number = 10, title?: string) {
    const startTime = Date.now();
    logger.info('Iniciando consulta ao Prisma para findByUserId', { userId, skip, take, title });

    try {
      const where: any = { userId, deleted: false };
      
      if (title) {
        where.title = {
          contains: title,
          mode: 'insensitive',
        };
      }

      const [movies, total] = await Promise.all([
        this.prisma.movie.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.movie.count({
          where,
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
      const movie = await this.prisma.movie.findFirst({
        where: { id, userId, deleted: false },
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

  async update(id: string, userId: string, data: UpdateMovieDTO) {
    const startTime = Date.now();
    logger.info('Atualizando filme no repositório', { id, userId });

    try {
      const movie = await this.prisma.movie.update({
        where: { id, userId },
        data,
      });

      const duration = Date.now() - startTime;
      logger.info('Filme atualizado com sucesso no banco', {
        id: movie.id,
        durationMs: duration,
      });

      return movie;
    } catch (error) {
      logger.error('Erro ao atualizar filme no MovieRepository', { error, id });
      throw error;
    }
  }

  async createMany(data: CreateMovieDTO[]) {
    const startTime = Date.now();
    logger.info('Criando múltiplos filmes no repositório', { count: data.length });

    try {
      const result = await this.prisma.movie.createMany({
        data,
      });

      const duration = Date.now() - startTime;
      logger.info('Múltiplos filmes criados com sucesso no banco', {
        count: result.count,
        durationMs: duration,
      });

      return result;
    } catch (error) {
      logger.error('Erro ao criar múltiplos filmes no MovieRepository', { error });
      throw error;
    }
  }

  async hasUserPopulated(userId: string): Promise<boolean> {
    logger.info('Verificando se usuário já populou filmes', { userId });

    const usage = await this.prisma.userFeatureUsage.findUnique({
      where: { userId },
    });

    return !!usage?.isPopulated;
  }

  async getUserFeatureUsage(userId: string) {
    logger.info('Buscando registro de uso de funcionalidades do usuário', { userId });

    return this.prisma.userFeatureUsage.findUnique({
      where: { userId },
    });
  }

  async markUserAsPopulated(userId: string) {
    logger.info('Marcando usuário como já populado', { userId });

    return this.prisma.userFeatureUsage.upsert({
      where: { userId },
      update: { isPopulated: true },
      create: { userId, isPopulated: true },
    });
  }

  async softDelete(id: string, userId: string) {
    const startTime = Date.now();
    logger.info('Iniciando soft delete de filme no repositório', { id, userId });

    try {
      const movie = await this.prisma.movie.update({
        where: { id, userId },
        data: {
          deleted: true,
          deletedAt: new Date(),
        },
      });

      const duration = Date.now() - startTime;
      logger.info('Soft delete concluído no banco', {
        id,
        durationMs: duration,
      });

      return movie;
    } catch (error) {
      logger.error('Erro ao realizar soft delete no MovieRepository', { error, id, userId });
      throw error;
    }
  }
}
