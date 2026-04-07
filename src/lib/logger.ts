import winston from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      basicAuth: `${process.env.LOKI_USER_ID}:${process.env.LOKI_TOKEN}`,
      host: process.env.LOKI_BASE_URL || 'http://localhost:3100',
      labels: { app: 'cubos-movies-api' }, // Rótulos para filtrar no Grafana
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Erro ao conectar ao Loki', err),
    }),
    // Também exibe logs no console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export default logger;
