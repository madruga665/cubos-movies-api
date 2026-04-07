import { Router } from 'express';
import { MovieService } from './services/movie-service';
import { MovieController } from './controllers/movie-controller';
import { MovieRepository } from './repositories/movie-repository';
import { prisma } from '../../../lib/prisma';

export const movieRoutes = Router();

const movieRepository = new MovieRepository(prisma);
const movieService = new MovieService(movieRepository);
const movieController = new MovieController(movieService);
movieRoutes.get('/', movieController.listUserMovies);
