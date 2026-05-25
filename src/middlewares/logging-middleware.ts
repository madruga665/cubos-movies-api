import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { asyncLocalStorage, RequestContext } from '../lib/async-storage';
import logger from '../lib/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Obtém o Request ID do header (útil se estiver atrás de um load balancer/gateway) ou gera um UUID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  // Define o Request ID na resposta para fins de auditoria no cliente
  res.setHeader('x-request-id', requestId);

  const userId = req.headers['x-user-id'];

  const context: RequestContext = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: typeof userId === 'string' ? userId : undefined,
  };

  const startTime = process.hrtime();

  // Executa toda a cadeia de execução assíncrona sob o escopo do AsyncLocalStorage
  asyncLocalStorage.run(context, () => {
    logger.info(`HTTP ${req.method} ${context.url} - Request received`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.on('finish', () => {
      const diff = process.hrtime(startTime);
      const durationMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
      const statusCode = res.statusCode;

      const logMsg = `HTTP ${req.method} ${context.url} ${statusCode} - Completed in ${durationMs}ms`;

      // Define o nível de log adequado de acordo com a resposta HTTP
      if (statusCode >= 500) {
        logger.error(logMsg, { statusCode, durationMs });
      } else if (statusCode >= 400) {
        logger.warn(logMsg, { statusCode, durationMs });
      } else {
        logger.info(logMsg, { statusCode, durationMs });
      }
    });

    next();
  });
};
