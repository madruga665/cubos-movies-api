import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  originalTitle: z.string().min(1, 'O título original é obrigatório'),
  overview: z.string().min(1, 'A sinopse é obrigatória'),
  releaseDate: z.coerce.date(),
  runtime: z.number().int().positive('A duração deve ser um número positivo'),
  status: z.string().min(1, 'O status é obrigatório'),
  originalLanguage: z.string().min(1, 'O idioma original é obrigatório'),
  genres: z.array(z.string()).min(1, 'Pelo menos um gênero deve ser informado'),
  tagline: z.string().optional().nullable(),
  posterUrl: z.url('URL do poster inválida').optional().nullable().or(z.literal('')),
  backdropUrl: z.url('URL do backdrop inválida').optional().nullable().or(z.literal('')),
  trailerUrl: z.url('URL do trailer inválida').optional().nullable().or(z.literal('')),
  certification: z.string().optional().nullable(),
  voteCount: z.number().int().nonnegative().optional().default(0),
  voteAverage: z.number().min(0).max(10).optional().default(0),
  budget: z.coerce.string().optional().nullable(),
  revenue: z.coerce.string().optional().nullable(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
