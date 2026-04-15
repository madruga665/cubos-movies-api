import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { fromNodeHeaders } from 'better-auth/node';
import { User, Session } from '../types/auth';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Tenta autenticação padrão do Better Auth
    let session: { user: User; session: Session } | null = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // 2. Fallback: Verificação manual no Banco de Dados se o Better Auth falhar
    if (!session || !session.user) {
      logger.warn('Iniciando verificação manual via middleware', { session });
      const authHeader = req.headers.authorization;
      let token = authHeader?.startsWith('Bearer ') ? (authHeader as string).substring(7) : null;

      if (token) {
        token = decodeURIComponent(token);
        const sessionId = token.split('.')[0];

        const dbSession = await prisma.session.findUnique({
          where: { token: sessionId },
          include: { user: true },
        });

        if (dbSession) {
          const now = new Date();
          const isExpired = dbSession.expiresAt < now;

          if (!isExpired) {
            session = {
              user: dbSession.user,
              session: dbSession,
            };
          }
        }
      }
    }

    if (!session || !session.user) {
      logger.warn('Falha na autenticação via middleware', { session });
      res.status(401).json({ message: 'Não autorizado. Sessão inválida ou expirada.' });
      return;
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    logger.error('Erro no authMiddleware', { error });
    res.status(500).json({ message: 'Erro interno na autenticação.', error });
  }
};
