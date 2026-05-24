import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  originalTitle: z.string().min(1, 'Original title is required'),
  overview: z.string().min(1, 'Overview is required'),
  releaseDate: z.coerce.date(),
  runtime: z.number().int().positive('Runtime must be a positive number'),
  status: z.string().min(1, 'Status is required'),
  originalLanguage: z.string().min(1, 'Original language is required'),
  genres: z.array(z.string()).min(1, 'At least one genre must be provided'),
  tagline: z.string().optional().nullable(),
  posterUrl: z.url('Invalid poster URL').optional().nullable().or(z.literal('')),
  backdropUrl: z.url('Invalid backdrop URL').optional().nullable().or(z.literal('')),
  trailerUrl: z.url('Invalid trailer URL').optional().nullable().or(z.literal('')),
  certification: z.string().optional().nullable(),
  voteCount: z.number().int().nonnegative().optional(),
  voteAverage: z.number().min(0).max(100).optional(),
  budget: z.coerce.bigint().optional().nullable(),
  revenue: z.coerce.bigint().optional().nullable(),
});

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
