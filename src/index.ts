import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import './jobs/worker';

app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});
