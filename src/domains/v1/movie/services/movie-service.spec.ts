/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MovieService } from './movie-service';
import { MovieRepository } from '../repositories/movie-repository';
import { CreateMovieDTO } from '../models/movie-models';

// Mock do Repositório
jest.mock('../repositories/movie-repository');

describe('MovieService', () => {
  let movieService: MovieService;
  let mockRepository: jest.Mocked<MovieRepository>;

  beforeEach(() => {
    // Cria o mock do repositório e injeta via construtor (DI)
    // Passamos null ou um objeto vazio para o construtor do repositório mockado
    mockRepository = new MovieRepository(null as any) as jest.Mocked<MovieRepository>;
    mockRepository.findByUserId = jest.fn();
    mockRepository.findById = jest.fn();
    mockRepository.create = jest.fn();
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

  describe('getMovieById', () => {
    it('deve retornar um filme pelo ID com sucesso', async () => {
      const mockMovie = { id: 'movie-1', title: 'Bumblebee', userId: 'user-1' };
      mockRepository.findById.mockResolvedValue(mockMovie as any);

      const result = await movieService.getMovieById('movie-1', 'user-1');

      expect(result).toEqual(mockMovie);
      expect(mockRepository.findById).toHaveBeenCalledWith('movie-1', 'user-1');
    });

    it('deve retornar null se o filme não for encontrado', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await movieService.getMovieById('non-existent', 'user-1');

      expect(result).toBeNull();
    });

    it('deve lançar erro se ID ou UserId estiverem ausentes', async () => {
      await expect(movieService.getMovieById('', 'user-1')).rejects.toThrow(
        'ID e UserId são obrigatórios',
      );
      await expect(movieService.getMovieById('movie-1', '')).rejects.toThrow(
        'ID e UserId são obrigatórios',
      );
    });
  });

  describe('createMovie', () => {
    const validMovieData: CreateMovieDTO = {
      title: 'New Movie',
      originalTitle: 'Original Title',
      overview: 'Movie overview',
      releaseDate: new Date(),
      runtime: 120,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      genres: ['Ação'],
      userId: 'user-1',
    };

    it('deve criar um filme com sucesso', async () => {
      mockRepository.create.mockResolvedValue({ id: 'new-id', ...validMovieData } as any);

      const result = await movieService.createMovie(validMovieData);

      expect(result.id).toBe('new-id');
      expect(mockRepository.create).toHaveBeenCalledWith(validMovieData);
    });
  });
});
