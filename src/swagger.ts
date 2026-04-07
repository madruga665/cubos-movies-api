import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express com TypeScript e Swagger',
      version: '1.0.0',
      description: 'Documentação da API',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            originalTitle: { type: 'string' },
            tagline: { type: 'string', nullable: true },
            overview: { type: 'string' },
            posterUrl: { type: 'string', nullable: true },
            backdropUrl: { type: 'string', nullable: true },
            trailerUrl: { type: 'string', nullable: true },
            releaseDate: { type: 'string', format: 'date-time' },
            runtime: { type: 'integer', description: 'Duração em minutos' },
            status: { type: 'string' },
            originalLanguage: { type: 'string' },
            certification: { type: 'string', nullable: true },
            voteCount: { type: 'integer' },
            voteAverage: { type: 'number' },
            budget: { type: 'string', nullable: true },
            revenue: { type: 'string', nullable: true },
            profit: { type: 'string', nullable: true },
            genres: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            userId: { type: 'string' },
          },
        },
      },
    },
  },
  // Caminho para os arquivos com comentários JSDoc
  apis: ['./src/domains/**/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
