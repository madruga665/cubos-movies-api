import 'dotenv/config';
import { pino } from 'pino';

const lokiBaseUrl = process.env.LOKI_BASE_URL?.trim();
const lokiUserId = process.env.LOKI_USER_ID?.trim();
const lokiToken = process.env.LOKI_TOKEN?.trim();

const logger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l o', // Formata a hora de forma legível localmente
        },
        level: 'debug',
      },
      {
        target: 'pino-loki',
        options: {
          host: lokiBaseUrl,
          basicAuth: {
            username: lokiUserId,
            password: lokiToken,
          },
          labels: { app: 'cubos-movies-api', env: process.env.NODE_ENV || 'development' },
        },
        level: 'info',
      },
    ],
  },
});

export default logger;
