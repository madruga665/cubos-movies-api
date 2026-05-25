import 'dotenv/config';
import dayjs from 'dayjs';
import { getRequestContext } from './async-storage';
import { pino } from 'pino';

const lokiBaseUrl = process.env.LOKI_BASE_URL?.trim();
const lokiUserId = process.env.LOKI_USER_ID?.trim();
const lokiToken = process.env.LOKI_TOKEN?.trim();

const logger = pino({
  level: 'info',
  timestamp: () => `,"time":"${dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ')}"`,
  mixin() {
    // Automatically inject the userId into every log if it exists in the active context
    const store = getRequestContext();
    return store && store.userId ? { userId: store.userId } : {};
  },
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: { colorize: true },
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
          labels: { app: 'cubos-movies-api', env: 'production' },
        },
        level: 'info',
      },
    ],
  },
});

export default logger;
