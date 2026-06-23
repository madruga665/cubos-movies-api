/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import { toNodeHandler } from 'better-auth/node';
import express, { Request, Response } from 'express';
import { auth } from './lib/auth';
import cors from 'cors';
import { movieRoutes } from './domains/v1/movie/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import { errorHandler } from './middlewares/error-handler';
import { requestContextMiddleware } from '@/middlewares/requestContextMiddleware';
import { authMiddleware } from '@/middlewares/auth-middleware';

// Patch para serializar BigInt em JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(requestContextMiddleware);

app.all('/api/auth/{*any}', toNodeHandler(auth));

// Rotas Movies - Protegidas por authMiddleware
app.use('/api/v1/movies', authMiddleware, movieRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API rodando com Express e TS' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
