import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { updateRequestContext } from '../lib/async-storage';
import { Session, User } from 'better-auth';

export async function getSession(req: Request) {
  let session: { user: User; session: Session } | null = null;
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

  return session;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await getSession(req);

    if (!session || !session.user) {
      logger.warn('Authentication failed');
      res.status(401).json({ message: 'Unauthorized. Invalid or expired session.' });

      return;
    }

    req.user = session.user;
    req.session = session.session;

    // Atualiza o contexto do logger com o ID do usuário autenticado
    updateRequestContext({ userId: session.user.id, sessionId: session.session.id });

    next();
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error }, 'Error in authMiddleware');
    }
    res.status(500).json({ message: 'Internal server error during authentication.', error });
  }
};
