import { MovieRepository } from '../repositories/movie-repository';
import logger from '../../../../lib/logger';
import { CreateMovieDTO } from '../models/movie-models';

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
}
