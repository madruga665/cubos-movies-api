import { Router } from 'express';
import { MovieService } from './services/movie-service';
import { MovieController } from './controllers/movie-controller';
import { MovieRepository } from './repositories/movie-repository';
import { prisma } from '../../../lib/prisma';
import { authMiddleware } from '../../../middlewares/auth-middleware';

export const movieRoutes = Router();

const movieRepository = new MovieRepository(prisma);
const movieService = new MovieService(movieRepository);
const movieController = new MovieController(movieService);

movieRoutes.get('/', authMiddleware, movieController.listUserMovies);
movieRoutes.get('/onboarding-status', authMiddleware, movieController.getOnboardingStatus);
movieRoutes.post('/populate', authMiddleware, movieController.populateUserMovies);
movieRoutes.get('/:id', authMiddleware, movieController.getMovieById);
movieRoutes.patch('/:id', authMiddleware, movieController.updateMovie);
movieRoutes.post('/', authMiddleware, movieController.createMovie);
movieRoutes.delete('/:id', authMiddleware, movieController.deleteMovie);
