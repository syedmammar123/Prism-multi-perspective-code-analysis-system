import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

export const webhookRoute = Router();

webhookRoute.post('/webhook', webhookController);
