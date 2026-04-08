export interface CreateMovieDTO {
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: Date;
  runtime: number;
  status: string;
  originalLanguage: string;
  genres: string[];
  userId: string;
  tagline?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  certification?: string | null;
  voteCount?: number;
  voteAverage?: number;
  budget?: bigint | null;
  revenue?: bigint | null;
  profit?: bigint | null;
}

export type UpdateMovieDTO = Partial<Omit<CreateMovieDTO, 'userId'>>;
