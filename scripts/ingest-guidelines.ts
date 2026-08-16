import path from 'path';
import { ingestAllGuidelines } from '../src/rag/ingest';
import { logger } from '../src/lib/logger';

async function main() {
  const guidelinesDir = path.join(__dirname, '..', '.codereview');
  const summary = await ingestAllGuidelines(guidelinesDir);
  logger.info(summary, 'guideline ingestion complete');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error({ error }, 'guideline ingestion failed');
    process.exit(1);
  });
