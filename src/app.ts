import express from 'express';
import path from 'path';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger';
import { healthRoute } from './api/routes/health.route';
import { webhookRoute } from './api/routes/webhook.route';

export const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = buf;
    },
  })
);
app.use(pinoHttp({ logger }));

app.use('/health', healthRoute);
app.use('/api', webhookRoute);
