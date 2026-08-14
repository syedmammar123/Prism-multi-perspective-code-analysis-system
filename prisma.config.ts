import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  experimental: {
    externalTables: true,
  },
  migrations: {
    initShadowDb: 'CREATE EXTENSION IF NOT EXISTS vector;',
  },
});
