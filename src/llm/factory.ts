import { config } from '../config';
import type { LLMProvider } from './provider';
import { GroqProvider } from './groq';

export function getLLMProvider(): LLMProvider {
  switch (config.llmProvider) {
    case 'groq':
      return new GroqProvider();
    default:
      throw new Error(`Unrecognized LLM_PROVIDER: "${config.llmProvider}"`);
  }
}
