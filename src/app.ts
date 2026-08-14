import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger';
import { healthRoute } from './api/routes/health.route';

export const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/health', healthRoute);
