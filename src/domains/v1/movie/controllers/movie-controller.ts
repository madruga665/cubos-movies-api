import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie-service';
import { createMovieSchema, UpdateMovieInput, updateMovieSchema } from '../schemas/movie-schemas';
import { AppError } from '../../../../lib/errors';

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
   *         name: title
   *         schema:
   *           type: string
   *         description: Filtra filmes pelo título
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
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const title = req.query.title as string | undefined;

      const response = await this.service.listUserMovies(userId, page, limit, title);

      res.status(200).json(response);
    } catch (error) {
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

    try {
      const movie = await this.service.getMovieById(id as string, userId);

      if (!movie) {
        throw new AppError('Movie not found.', 404);
      }

      res.status(200).json(movie);
    } catch (error) {
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
  createMovie = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

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
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   patch:
   *     summary: "Atualiza parcialmente um filme"
   *     description: "Permite a edição parcial dos dados de um filme vinculado ao usuário."
   *     tags: [Movies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do filme
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Movie'
   *     responses:
   *       200:
   *         description: "Filme atualizado com sucesso"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Movie'
   *       400:
   *         description: "Erro de validação"
   *       404:
   *         description: "Filme não encontrado"
   *       401:
   *         description: "Não autorizado"
   *       500:
   *         description: "Erro interno do servidor"
   */
  updateMovie = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const validatedData = updateMovieSchema.parse(req.body);
      const formattedData: UpdateMovieInput = { ...validatedData };
      const movie = await this.service.updateMovie(id as string, userId, formattedData);

      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   delete:
   *   get:
   *     summary: "Obtém o status de onboarding do usuário"
   *     description: "Retorna se o usuário já utilizou certas funcionalidades (ex: popular conta)."
   *     tags: [Movies]
   *     responses:
   *       200:
   *         description: "Status retornado com sucesso"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isPopulated:
   *                   type: boolean
   *       401:
   *         description: "Não autorizado"
   *       500:
   *         description: "Erro interno do servidor"
   */
  getOnboardingStatus = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    try {
      const status = await this.service.getOnboardingStatus(userId);

      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies/populate:
   *   post:
   *     summary: "Popula a conta do usuário com filmes recomendados"
   *     description: "Adiciona uma lista pré-definida de 20 filmes recomendados à conta do usuário autenticado."
   *     tags: [Movies]
   *     responses:
   *       201:
   *         description: "Filmes recomendados adicionados com sucesso"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 count:
   *                   type: integer
   *                   description: "Quantidade de filmes inseridos"
   *       401:
   *         description: "Não autorizado"
   *       500:
   *         description: "Erro interno do servidor"
   */
  populateUserMovies = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    try {
      const result = await this.service.populateUserMovies(userId);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   delete:
   *     summary: Remove um filme do catálogo
   *     description: Realiza a exclusão lógica (soft delete) de um filme associado ao usuário.
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
   *       204:
   *         description: Filme removido com sucesso
   *       404:
   *         description: Filme não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      await this.service.deleteMovie(id as string, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
