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

const langsmithTracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';

if (
  langsmithTracingEnabled &&
  (!process.env.LANGCHAIN_API_KEY || !process.env.LANGCHAIN_PROJECT)
) {
  // eslint-disable-next-line no-console
  console.warn(
    'LANGCHAIN_TRACING_V2 is true but LANGCHAIN_API_KEY and/or LANGCHAIN_PROJECT is missing — LangSmith tracing will not work.'
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
  langsmith: {
    tracingEnabled: langsmithTracingEnabled,
    apiKey: process.env.LANGCHAIN_API_KEY,
    project: process.env.LANGCHAIN_PROJECT,
  },
};
