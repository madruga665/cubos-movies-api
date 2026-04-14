/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MovieController } from './movie-controller';
import { MovieService } from '../services/movie-service';
import logger from '../../../../lib/logger';

// Mock do Serviço e Logger
jest.mock('../services/movie-service');
jest.mock('../../../../lib/logger');

describe('MovieController', () => {
  let movieController: MovieController;
  let mockService: jest.Mocked<MovieService>;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockService = new MovieService(null as any) as jest.Mocked<MovieService>;
    mockService.listUserMovies = jest.fn();
    
    movieController = new MovieController(mockService);

    mockRequest = {
      user: { id: 'user-1' },
      query: {},
      params: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('listUserMovies', () => {
    it('deve chamar o serviço com o parâmetro title quando fornecido na query', async () => {
      mockRequest.query = { title: 'Spider-Man', page: '1', limit: '10' };
      
      const mockResult = {
        result: [],
        metadata: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      
      mockService.listUserMovies.mockResolvedValue(mockResult as any);

      await movieController.listUserMovies(mockRequest, mockResponse, mockNext);

      expect(mockService.listUserMovies).toHaveBeenCalledWith('user-1', 1, 10, 'Spider-Man');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('deve chamar o serviço com title undefined quando não fornecido na query', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      
      const mockResult = {
        result: [],
        metadata: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      
      mockService.listUserMovies.mockResolvedValue(mockResult as any);

      await movieController.listUserMovies(mockRequest, mockResponse, mockNext);

      expect(mockService.listUserMovies).toHaveBeenCalledWith('user-1', 1, 10, undefined);
    });
  });
});
