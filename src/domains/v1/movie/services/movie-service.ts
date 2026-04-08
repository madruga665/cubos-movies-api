import { MovieRepository } from '../repositories/movie-repository';
import logger from '../../../../lib/logger';

export class MovieService {
  constructor(private repository: MovieRepository = new MovieRepository()) {}

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
}
