import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../lib/logger';
import { AppError } from '../lib/errors';

export const errorHandler = (
  error: Error | AppError | z.ZodError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Tratamento de erros do Zod (Validação de Entrada)
  if (error instanceof z.ZodError) {
    logger.warn('Input validation failed (Zod)', {
      validationErrors: error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    res.status(400).json({
      message: 'Validation error',
      errors: error.issues.map((e) => ({ path: e.path, message: e.message })),
    });
    return;
  }

  // Tratamento de erros operacionais previstos (AppError)
  if (error instanceof AppError) {
    logger.warn(`Operational error: ${error.message}`, {
      statusCode: error.statusCode,
    });
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Tratamento de erros imprevistos (500)
  logger.error('Critical unhandled error detected on server', {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });

  res.status(500).json({ message: 'Internal server error' });
};
