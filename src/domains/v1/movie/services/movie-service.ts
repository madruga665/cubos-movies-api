import { MovieRepository } from '../repositories/movie-repository';
import logger from '../../../../lib/logger';
import { CreateMovieDTO } from '../models/movie-models';
import { AppError } from '../../../../lib/errors';
import { recommendedMovies } from '../../../../lib/recommended-movies';

export class MovieService {
  private repository: MovieRepository;

  constructor(repository: MovieRepository) {
    this.repository = repository;
  }

  async listUserMovies(userId: string, page: number = 1, limit: number = 10) {
    logger.info('Iniciando MovieService.listUserMovies', { userId, page, limit });

    if (!userId) {
      logger.error('Falha na validação do MovieService: userId ausente');
      throw new Error('UserId é obrigatório');
    }

    const skip = (page - 1) * limit;

    logger.info('Buscando filmes no repositório', { skip, limit });

    const { movies, total } = await this.repository.findByUserId(userId, skip, limit);

    logger.info('Filmes recuperados com sucesso', { count: movies.length, total });

    return {
      result: movies,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMovieById(id: string, userId: string) {
    logger.info('Iniciando MovieService.getMovieById', { id, userId });

    if (!id || !userId) {
      logger.error('Falha na validação: ID ou UserId ausente');
      throw new Error('ID e UserId são obrigatórios');
    }

    const movie = await this.repository.findById(id, userId);

    if (!movie) {
      logger.warn('Filme não encontrado no serviço', { id, userId });
      return null;
    }

    logger.info('Filme recuperado com sucesso no serviço', { id });
    return movie;
  }

  async createMovie(data: CreateMovieDTO) {
    logger.info('Iniciando MovieService.createMovie', { title: data.title, userId: data.userId });

    const movie = await this.repository.create(data);

    logger.info('Filme criado com sucesso no serviço', { id: movie.id });
    return movie;
  }

  async populateUserMovies(userId: string) {
    logger.info('Iniciando MovieService.populateUserMovies', { userId });

    if (!userId) {
      logger.error('Falha na validação: UserId ausente');
      throw new AppError('UserId é obrigatório', 400);
    }

    const alreadyPopulated = await this.repository.hasUserPopulated(userId);

    if (alreadyPopulated) {
      logger.warn('Tentativa de popular conta já populada', { userId });
      throw new AppError('Sua conta já foi populada com filmes recomendados.', 400);
    }

    const moviesToCreate = recommendedMovies.map((movie) => ({
      ...movie,
      userId,
    }));

    const result = await this.repository.createMany(moviesToCreate);

    await this.repository.markUserAsPopulated(userId);

    logger.info('Filmes recomendados populados com sucesso', { userId, count: result.count });

    return result;
  }

  async getOnboardingStatus(userId: string) {
    logger.info('Iniciando MovieService.getOnboardingStatus', { userId });

    if (!userId) {
      logger.error('Falha na validação: UserId ausente');
      throw new AppError('UserId é obrigatório', 400);
    }

    const usage = await this.repository.getUserFeatureUsage(userId);

    // Retorna o status de todas as campanhas, defaultando para false se o registro não existir
    return {
      isPopulated: usage?.isPopulated || false,
      // Você pode adicionar outras campanhas aqui no futuro
    };
  }

  async deleteMovie(id: string, userId: string) {
    logger.info('Iniciando MovieService.deleteMovie', { id, userId });

    if (!id || !userId) {
      logger.error('Falha na validação: ID ou UserId ausente');
      throw new AppError('ID e UserId são obrigatórios', 400);
    }

    const movie = await this.repository.findById(id, userId);

    if (!movie) {
      logger.warn('Filme não encontrado para deleção', { id, userId });
      throw new AppError('Filme não encontrado.', 404);
    }

    await this.repository.softDelete(id, userId);

    logger.info('Filme deletado com sucesso no serviço', { id });
  }
}
