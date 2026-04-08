import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie-service';
import logger from '../../../../lib/logger';
import { createMovieSchema } from '../schemas/movie-schemas';
import { z } from 'zod';

export class MovieController {
  private service: MovieService;

  constructor(service: MovieService) {
    this.service = service;
  }

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
      userId: req.user?.id,
      query: req.query,
    });

    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info('Chamando MovieService.listUserMovies', { userId, page, limit });

      const response = await this.service.listUserMovies(userId, page, limit);

      logger.info('Requisição concluída com sucesso', { userId, count: response.result.length });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Erro em MovieController.listUserMovies', { error });
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   get:
   *     summary: Obtém os detalhes de um filme específico
   *     description: Retorna os dados de um filme associado ao usuário pelo seu ID.
   *     tags: [Movies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do filme
   *     responses:
   *       200:
   *         description: Filme encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Movie'
   *       404:
   *         description: Filme não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  getMovieById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info('Iniciando MovieController.getMovieById', { id, userId });

    try {
      const movie = await this.service.getMovieById(id as string, userId);

      if (!movie) {
        logger.warn('Filme não encontrado no controller', { id, userId });
        res.status(404).json({ message: 'Filme não encontrado.' });
        return;
      }

      logger.info('Resposta de filme enviada com sucesso', { id });
      res.status(200).json(movie);
    } catch (error) {
      logger.error('Erro em MovieController.getMovieById', { error, id });
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies:
   *   post:
   *     summary: Adiciona um novo filme ao catálogo do usuário
   *     description: Cria um novo registro de filme vinculado ao usuário autenticado.
   *     tags: [Movies]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - originalTitle
   *               - overview
   *               - releaseDate
   *               - runtime
   *               - status
   *               - originalLanguage
   *             properties:
   *               title: { type: string }
   *               originalTitle: { type: string }
   *               overview: { type: string }
   *               releaseDate: { type: string, format: date-time }
   *               runtime: { type: integer, description: 'Duração em minutos' }
   *               status: { type: string }
   *               originalLanguage: { type: string }
   *               genres: { type: array, items: { type: string } }
   *               tagline: { type: string }
   *               posterUrl: { type: string }
   *               backdropUrl: { type: string }
   *               trailerUrl: { type: string }
   *               certification: { type: string }
   *               budget: { type: string, description: 'Valor em string para BigInt' }
   *               revenue: { type: string }
   *     responses:
   *       201:
   *         description: Filme criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Movie'
   *       400:
   *         description: Erro de validação nos campos enviados
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  createMovie = async (req: Request, res: Response) => {
    const userId = req.user.id;

    logger.info('Iniciando MovieController.createMovie', { title: req.body.title, userId });

    try {
      // Validação com Zod
      const validatedData = createMovieSchema.parse(req.body);

      // Conversão de tipos para o Prisma e injeção do userId
      const formattedData = {
        ...validatedData,
        userId,
        budget: validatedData.budget ? BigInt(validatedData.budget) : undefined,
        revenue: validatedData.revenue ? BigInt(validatedData.revenue) : undefined,
        profit:
          validatedData.budget && validatedData.revenue
            ? BigInt(validatedData.revenue) - BigInt(validatedData.budget)
            : undefined,
      };

      const movie = await this.service.createMovie(formattedData);

      logger.info('Filme criado com sucesso no controller', { id: movie.id });
      res.status(201).json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Falha na validação do Zod', { errors: error.issues });
        res.status(400).json({
          message: 'Erro de validação',
          errors: error.issues.map((e) => ({ path: e.path, message: e.message })),
        });
        return;
      }

      if (error instanceof Error) {
        logger.error('Erro em MovieController.createMovie', { error: error.message });
        res.status(400).json({ message: error.message });
      }
    }
  };
}
