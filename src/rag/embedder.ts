import { config } from '../config';

type FeatureExtractionOutput = { data: Float32Array | number[] };
type FeatureExtractionPipeline = (
  text: string,
  options: { pooling: 'mean'; normalize: boolean }
) => Promise<FeatureExtractionOutput>;

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const { pipeline } = await import('@xenova/transformers');
      return (await pipeline(
        'feature-extraction',
        config.embeddingModel
      )) as unknown as FeatureExtractionPipeline;
    })();
  }
  return embedderPromise;
}

export async function embedText(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
