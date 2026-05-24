import { MovieRepository } from '../repositories/movie-repository';
import logger from '../../../../lib/logger';
import { CreateMovieDTO, UpdateMovieDTO } from '../models/movie-models';
import { AppError } from '../../../../lib/errors';
import { recommendedMovies } from '../../../../lib/recommended-movies';

export class MovieService {
  private repository: MovieRepository;

  constructor(repository: MovieRepository) {
    this.repository = repository;
  }

  async listUserMovies(userId: string, page: number = 1, limit: number = 10, title?: string) {
    if (!userId) {
      throw new Error('UserId is required');
    }

    const skip = (page - 1) * limit;

    const { movies, total } = await this.repository.findByUserId(userId, skip, limit, title);

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
    if (!id || !userId) {
      throw new Error('ID and UserId are required');
    }

    const movie = await this.repository.findById(id, userId);

    if (!movie) {
      logger.warn('Attempted to access non-existent or unauthorized movie', { movieId: id });
      return null;
    }

    return movie;
  }

  async createMovie(data: CreateMovieDTO) {
    return this.repository.create(data);
  }

  async updateMovie(id: string, userId: string, data: UpdateMovieDTO) {
    if (!id || !userId) {
      throw new AppError('ID and UserId are required', 400);
    }

    const movie = await this.repository.findById(id, userId);

    if (!movie) {
      logger.warn('Attempted to update non-existent or unauthorized movie', { movieId: id });
      throw new AppError('Movie not found.', 404);
    }

    return this.repository.update(id, userId, data);
  }

  async populateUserMovies(userId: string) {
    if (!userId) {
      throw new AppError('UserId is required', 400);
    }

    const alreadyPopulated = await this.repository.hasUserPopulated(userId);

    if (alreadyPopulated) {
      logger.warn('Denied: Attempted to populate account for a user who already has populated movies');
      throw new AppError('Your account has already been populated with recommended movies.', 400);
    }

    const moviesToCreate = recommendedMovies.map((movie) => ({
      ...movie,
      userId,
    }));

    const result = await this.repository.createMany(moviesToCreate);

    await this.repository.markUserAsPopulated(userId);

    return result;
  }

  async getOnboardingStatus(userId: string) {
    if (!userId) {
      throw new AppError('UserId is required', 400);
    }

    const usage = await this.repository.getUserFeatureUsage(userId);

    return {
      isPopulated: usage?.isPopulated || false,
    };
  }

  async deleteMovie(id: string, userId: string) {
    if (!id || !userId) {
      throw new AppError('ID and UserId are required', 400);
    }

    const movie = await this.repository.findById(id, userId);

    if (!movie) {
      logger.warn('Attempted to delete non-existent or unauthorized movie', { movieId: id });
      throw new AppError('Movie not found.', 404);
    }

    await this.repository.softDelete(id, userId);
  }
}
