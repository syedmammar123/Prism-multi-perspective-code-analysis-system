// `schema` is loosely typed for now (basic shape, not enforced) — swap in
// stricter validation (e.g. zod) later if output parsing proves unreliable.
export interface LLMProvider {
  generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: unknown
  ): Promise<T>;
}
