import 'dotenv/config';
import winston from 'winston';
import LokiTransport from 'winston-loki';
import { getRequestContext } from './async-storage';

// Formato customizado para injetar automaticamente informações do contexto assíncrono
const injectRequestContext = winston.format((info) => {
  const context = getRequestContext();
  if (context) {
    info.requestId = context.requestId;
    info.userId = context.userId || 'anonymous';
    if (context.method) info.method = context.method;
    if (context.url) info.url = context.url;
  } else {
    info.userId = 'system';
  }
  return info;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      injectRequestContext(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
        const reqPrefix = typeof requestId === 'string' ? ` [Req: ${requestId.slice(0, 8)}]` : '';
        const userPrefix = userId ? ` [User: ${userId}]` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}:${reqPrefix}${userPrefix} ${message}${metaStr}`;
      })
    ),
  }),
];

// Só inicializa o Loki se uma URL base estiver explicitamente configurada
if (process.env.LOKI_BASE_URL) {
  const hasAuth = process.env.LOKI_USER_ID && process.env.LOKI_TOKEN;
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_BASE_URL,
      basicAuth: hasAuth ? `${process.env.LOKI_USER_ID}:${process.env.LOKI_TOKEN}` : undefined,
      labels: { app: 'cubos-movies-api' },
      json: true,
      replaceTimestamp: true,
      format: winston.format.combine(
        injectRequestContext(),
        winston.format.timestamp(),
        winston.format.json()
      ),
      onConnectionError: (err) => console.error('Erro ao conectar ao Loki', err),
    })
  );
}

const logger = winston.createLogger({
  transports,
});

export default logger;
