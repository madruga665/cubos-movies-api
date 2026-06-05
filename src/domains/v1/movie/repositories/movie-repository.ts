import logger from '../../../../lib/logger';
import { PrismaClient } from '../../../../generated/prisma';
import { CreateMovieDTO, UpdateMovieDTO } from '../models/movie-models';

export class MovieRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByUserId(userId: string, skip: number = 0, take: number = 10, title?: string) {
    try {
      type WhereClause = {
        userId: string;
        deleted: boolean;
        title?: {
          contains: string;
          mode: 'insensitive';
        };
      };

      const where: WhereClause = { userId, deleted: false };

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

      return { movies, total };
    } catch (error) {
      logger.error({ error, userId }, 'Erro durante consulta ao Prisma no MovieRepository');
      throw error;
    }
  }

  async findById(id: string, userId: string) {
    try {
      return await this.prisma.movie.findFirst({
        where: { id, userId, deleted: false },
      });
    } catch (error) {
      logger.error({ error, id, userId }, 'Erro ao buscar filme por ID no MovieRepository');
      throw error;
    }
  }

  async create(data: CreateMovieDTO) {
    try {
      return await this.prisma.movie.create({
        data,
      });
    } catch (error) {
      logger.error({ error, title: data.title }, 'Erro ao criar filme no MovieRepository');
      throw error;
    }
  }

  async update(id: string, userId: string, data: UpdateMovieDTO) {
    try {
      return await this.prisma.movie.update({
        where: { id, userId },
        data,
      });
    } catch (error) {
      logger.error({ error, id }, 'Erro ao atualizar filme no MovieRepository');
      throw error;
    }
  }

  async createMany(data: CreateMovieDTO[]) {
    try {
      return await this.prisma.movie.createMany({
        data,
      });
    } catch (error) {
      logger.error({ error }, 'Erro ao criar múltiplos filmes no MovieRepository');
      throw error;
    }
  }

  async hasUserPopulated(userId: string): Promise<boolean> {
    const usage = await this.prisma.userFeatureUsage.findUnique({
      where: { userId },
    });

    return !!usage?.isPopulated;
  }

  async getUserFeatureUsage(userId: string) {
    return this.prisma.userFeatureUsage.findUnique({
      where: { userId },
    });
  }

  async markUserAsPopulated(userId: string) {
    return this.prisma.userFeatureUsage.upsert({
      where: { userId },
      update: { isPopulated: true },
      create: { userId, isPopulated: true },
    });
  }

  async softDelete(id: string, userId: string) {
    try {
      return await this.prisma.movie.update({
        where: { id, userId },
        data: {
          deleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error({ error, id, userId }, 'Erro ao realizar soft delete no MovieRepository');
      throw error;
    }
  }
}
