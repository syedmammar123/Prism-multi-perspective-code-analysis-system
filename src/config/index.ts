import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'LOG_LEVEL',
  'GITHUB_TOKEN',
  'GITHUB_WEBHOOK_SECRET',
  'DATABASE_URL',
  'REDIS_URL',
  'LLM_PROVIDER',
  'GROQ_API_KEY',
  'GROQ_MODEL',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVars.join(', ')}`
  );
}

export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV as string,
  logLevel: process.env.LOG_LEVEL as string,
  github: {
    token: process.env.GITHUB_TOKEN as string,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET as string,
  },
  databaseUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,
  llmProvider: process.env.LLM_PROVIDER as string,
  groq: {
    apiKey: process.env.GROQ_API_KEY as string,
    model: process.env.GROQ_MODEL as string,
  },
};
