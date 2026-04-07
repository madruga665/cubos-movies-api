import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MovieService } from './movie-service';
import { MovieRepository } from '../repositories/movie-repository';

// Mock do Repositório
jest.mock('../repositories/movie-repository.js');

describe('MovieService', () => {
  let movieService: MovieService;
  let mockRepository: jest.Mocked<MovieRepository>;

  beforeEach(() => {
    // Cria o mock do repositório e injeta via construtor (DI)
    mockRepository = new MovieRepository() as jest.Mocked<MovieRepository>;
    mockRepository.findByUserId = jest.fn();
    movieService = new MovieService(mockRepository);
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
