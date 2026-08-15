import Groq from 'groq-sdk';
import { config } from '../config';
import type { LLMProvider } from './provider';

const groq = new Groq({ apiKey: config.groq.apiKey });

export class GroqProvider implements LLMProvider {
  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: unknown
  ): Promise<T> {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nRespond with valid JSON only, matching this schema: ${JSON.stringify(schema)}`,
        },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned an empty response');
    }

    try {
      return JSON.parse(content) as T;
    } catch (err) {
      throw new Error(
        `Failed to parse Groq response as JSON: ${(err as Error).message}. Raw content: ${content}`
      );
    }
  }
}
