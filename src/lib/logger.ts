import winston from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: process.env.LOKI_BASE_URL || 'http://localhost:3100',
      basicAuth: `${process.env.LOKI_USER_ID}:${process.env.LOKI_TOKEN}`,
      labels: { app: 'cubos-movies-api' },
      json: true,
      batching: true,
      interval: 5,
      replaceTimestamp: true,
      format: winston.format.json(),
      onConnectionError: (err) => console.error('Erro ao conectar ao Loki', err),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
