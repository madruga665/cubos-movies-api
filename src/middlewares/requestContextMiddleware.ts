import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { asyncLocalStorage, RequestContext } from '../lib/async-storage';
import logger from '../lib/logger';
import { getSession } from '@/middlewares/auth-middleware';

export const requestContextMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('x-request-id', requestId);
  const method = req.method;
  const url = req.originalUrl || req.url;
  const statusCode = res.statusCode;
  const session = await getSession(req);
  const sessionId = session?.session.id || '';
  const userId = session?.user.id || '';

  const context: RequestContext = {
    requestId,
    method,
    url,
    userId,
    statusCode,
    sessionId,
  };

  asyncLocalStorage.run(context, () => {
    res.on('finish', () => {
      const logMsg = `HTTP ${req.method} ${context.url} ${statusCode}`;

      switch (statusCode) {
        case 500:
          logger.error(context, logMsg);
          break;
        case 400:
          logger.warn(context, logMsg);
          break;
        default:
          logger.info(context, logMsg);
      }
    });

    next();
  });
};
