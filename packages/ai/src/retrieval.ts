// packages/ai/src/retrieval.ts

import { QdrantClient } from '@qdrant/js-client-rest';
import { generateQueryEmbedding, EMBEDDING_DIMENSIONS } from './embeddings';
import { logger } from './logger';

const COLLECTION_NAME = 'documents';

const qdrant = new QdrantClient({ 
  url: process.env.QDRANT_URL || 'http://localhost:6333' 
});

export interface RetrievedChunk {
  id: string;
  content: string;
  documentId: string;
  pageNumber?: number;
  chunkIndex: number;
  score: number;
}

/**
 * Initialize Qdrant collection if it doesn't exist
 */
export async function initializeQdrantCollection(): Promise<void> {
  try {
    await qdrant.getCollection(COLLECTION_NAME);
    logger.info('Qdrant collection already exists');
  } catch {
    logger.info('Creating Qdrant collection');
    
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: EMBEDDING_DIMENSIONS,
        distance: 'Cosine',
      },
      optimizers_config: {
        default_segment_number: 2,
      },
      replication_factor: 1,
    });

    // Create payload index for faster filtering
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'documentId',
      field_schema: 'keyword',
    });

    logger.info('Qdrant collection created successfully');
  }
}

/**
 * Retrieve relevant chunks for a query
 */
export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  documentIds?: string[],
  topK: number = 5,
  scoreThreshold: number = 0.7
): Promise<RetrievedChunk[]> {
  try {
    logger.info({ query, documentIds, topK }, 'Retrieving chunks');

    // Generate query embedding
    const queryVector = await generateQueryEmbedding(query);

    // Build filter for user's documents
    const filter: any = {
      must: [
        {
          key: 'userId',
          match: { value: userId },
        },
      ],
    };

    // Optional: filter by specific documents
    if (documentIds && documentIds.length > 0) {
      filter.must.push({
        key: 'documentId',
        match: { any: documentIds },
      });
    }

    // Search in Qdrant
    const results = await qdrant.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: topK,
      filter,
      with_payload: true,
      score_threshold: scoreThreshold,
    });

    const chunks = results.map((result) => ({
      id: result.id as string,
      content: result.payload?.content as string,
      documentId: result.payload?.documentId as string,
      pageNumber: result.payload?.pageNumber as number | undefined,
      chunkIndex: result.payload?.chunkIndex as number,
      score: result.score,
    }));

    logger.info({ count: chunks.length }, 'Chunks retrieved');

    return chunks;
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve chunks');
    throw error;
  }
}

/**
 * Store document chunks in Qdrant
 */
export async function storeDocumentChunks(
  documentId: string,
  userId: string,
  chunks: Array<{
    content: string;
    embedding: number[];
    pageNumber?: number;
    chunkIndex: number;
    tokenCount: number;
  }>
): Promise<void> {
  try {
    logger.info({ documentId, chunkCount: chunks.length }, 'Storing chunks');

    const points = chunks.map((chunk, idx) => ({
      id: `${documentId}_${chunk.chunkIndex}`,
      vector: chunk.embedding,
      payload: {
        documentId,
        userId,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
      },
    }));

    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    logger.info({ documentId }, 'Chunks stored successfully');
  } catch (error) {
    logger.error({ error, documentId }, 'Failed to store chunks');
    throw error;
  }
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocumentChunks(
  documentId: string
): Promise<void> {
  try {
    await qdrant.delete(COLLECTION_NAME, {
      wait: true,
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId },
          },
        ],
      },
    });

    logger.info({ documentId }, 'Chunks deleted');
  } catch (error) {
    logger.error({ error, documentId }, 'Failed to delete chunks');
    throw error;
  }
}
