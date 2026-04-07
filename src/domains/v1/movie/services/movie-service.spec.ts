import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MovieService } from './movie-service';
import { MovieRepository } from '../repositories/movie-repository';

// Mock do Repositório
jest.mock('../repositories/movie-repository.js');

describe('MovieService', () => {
  let movieService: MovieService;
  let mockRepository: jest.Mocked<MovieRepository>;

  beforeEach(() => {
    movieService = new MovieService();
    // @ts-expect-error - acessando private para mock
    movieService.repository.findByUserId = jest.fn();
    // @ts-expect-error - acessando private para mock
    mockRepository = movieService.repository as jest.Mocked<MovieRepository>;
  });

  it('deve listar filmes de um usuário com sucesso', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', userId: 'user1' },
      { id: '2', title: 'Movie 2', userId: 'user1' },
    ];
    
    mockRepository.findByUserId.mockResolvedValue({
      movies: mockMovies as any,
      total: 2,
    });

    const result = await movieService.listUserMovies('user1', 1, 10);

    expect(result.result).toHaveLength(2);
    expect(result.metadata.total).toBe(2);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user1', 0, 10);
  });

  it('deve lançar erro se userId não for fornecido', async () => {
    await expect(movieService.listUserMovies('')).rejects.toThrow('UserId é obrigatório');
  });
});
