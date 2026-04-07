import { Router } from 'express';
import { MovieService } from './services/movie-service';
import { MovieController } from './controllers/movie-controller';

export const movieRoutes = Router();

const movieService = new MovieService();
const movieController = new MovieController(movieService);
movieRoutes.get('/', movieController.listUserMovies);
