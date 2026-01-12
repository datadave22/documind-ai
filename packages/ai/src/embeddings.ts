// packages/ai/src/embeddings.ts

import OpenAI from 'openai';
import { logger } from './logger';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embeddings for multiple texts in batch
 * Cost: $0.02 per 1M tokens
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    logger.info({ count: texts.length }, 'Generating embeddings');
    
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      encoding_format: 'float',
    });

    const embeddings = response.data.map((item) => item.embedding);
    
    logger.info({ 
      count: embeddings.length,
      dimensions: embeddings[0]?.length 
    }, 'Embeddings generated');

    return embeddings;
  } catch (error) {
    logger.error({ error }, 'Failed to generate embeddings');
    throw error;
  }
}

/**
 * Generate a single embedding for a query
 * Used for searching similar chunks
 */
export async function generateQueryEmbedding(
  query: string
): Promise<number[]> {
  const [embedding] = await generateEmbeddings([query]);
  return embedding;
}

/**
 * Batch embeddings in chunks to avoid rate limits
 * OpenAI has a 8191 token limit per request
 */
export async function generateEmbeddingsBatched(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await generateEmbeddings(batch);
    results.push(...embeddings);
    
    logger.info({ 
      progress: `${i + batch.length}/${texts.length}` 
    }, 'Batch embedding progress');
  }

  return results;
}
