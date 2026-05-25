/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import { toNodeHandler } from 'better-auth/node';
import express, { Request, Response } from 'express';
import { auth } from './lib/auth';
import cors from 'cors';
import { movieRoutes } from './domains/v1/movie/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { errorHandler } from './middlewares/error-handler';
import { pinoHttp } from 'pino-http';
import logger from '@/lib/logger';
import { loggingMiddleware } from '@/middlewares/logging-middleware';

export const app = express();

app.set('trust proxy', 1);

// Patch para serializar BigInt em JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());

// Rotas Movies
app.use('/api/v1/movies', movieRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API rodando com Express e TS' });
});

// Middleware de Erro Centralizado
app.use(errorHandler);
app.use(pinoHttp({ logger }));
app.use(loggingMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
