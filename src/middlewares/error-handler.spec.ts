import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from './error-handler';
import { AppError } from '../lib/errors';
import logger from '../lib/logger';

describe('ErrorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Usamos spyOn se o mock total falhar
    jest.spyOn(logger, 'error').mockImplementation(() => logger);
    jest.spyOn(logger, 'warn').mockImplementation(() => logger);
    jest.spyOn(logger, 'info').mockImplementation(() => logger);
  });

  it('deve tratar AppError (erro previsto) corretamente', () => {
    const error = new AppError('Recurso não encontrado', 404);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Recurso não encontrado',
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('deve tratar z.ZodError (erro de validação) corretamente', () => {
    const zError = new z.ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['title'],
        message: 'Required',
      } as z.ZodIssue,
    ]);

    errorHandler(zError, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Erro de validação',
        errors: expect.arrayContaining([
          expect.objectContaining({ path: ['title'], message: 'Required' }),
        ]),
      }),
    );
    expect(logger.warn).toHaveBeenCalled();
  });

  it('deve tratar erros genéricos como 500 (Erro Interno)', () => {
    const error = new Error('Erro de banco de dados');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Erro interno do servidor',
    });
    expect(logger.error).toHaveBeenCalled();
  });
});
