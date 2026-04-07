import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie-service';
import { auth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import logger from '../../../../lib/logger';
import { fromNodeHeaders } from 'better-auth/node';

export class MovieController {
  constructor(private movieService: MovieService) {}

  /**
   * @swagger
   * /api/v1/movies:
   *   get:
   *     summary: Lista os filmes do usuário autenticado
   *     description: Retorna uma lista paginada de filmes associados ao usuário logado. Requer cookie de autenticação válido.
   *     tags: [Movies]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Quantidade de itens por página
   *     responses:
   *       200:
   *         description: Lista de filmes recuperada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 result:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Movie'
   *                 metadata:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       401:
   *         description: Não autorizado - Usuário não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  listUserMovies = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Iniciando MovieController.listUserMovies', {
      headers: req.headers,
    });

    try {
      // 1. Tenta autenticação padrão do Better Auth
      let session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // 2. Fallback: Verificação manual no Banco de Dados se o Better Auth falhar
      if (!session || !session.user) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? (authHeader as string).substring(7) : null;

        if (token) {
          logger.info('Tentando verificação manual do token no banco de dados', { 
            tokenSnippet: token.substring(0, 10) + '...' 
          });
          
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
          });

          if (dbSession && dbSession.expiresAt > new Date()) {
            logger.info('Sessão encontrada manualmente no banco e válida', { userId: dbSession.userId });
            session = {
              user: dbSession.user,
              session: dbSession
            } as any;
          } else {
            logger.warn('Token enviado não foi encontrado no banco ou está expirado');
          }
        }
      }

      if (!session || !session.user) {
        logger.warn('Falha na autenticação do usuário', {
          headers: req.headers,
        });
        res.status(401).json({ message: 'Não autorizado. Sessão inválida ou expirada.' });
        return;
      }

      const userId = session.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info('Chamando MovieService.listUserMovies', { userId, page, limit });

      const response = await this.movieService.listUserMovies(userId, page, limit);

      logger.info('Requisição concluída com sucesso', { userId, count: response.result.length });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Erro em MovieController.listUserMovies', { error });
      next(error);
    }
  };
}
