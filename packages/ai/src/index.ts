// packages/ai/src/index.ts

import { retrieveRelevantChunks } from './retrieval';
import { buildQAPrompt, extractCitationNumbers } from './prompts/qa';
import { streamAnswer, assessQuestionComplexity } from './llm';
import { logger } from './logger';

interface StreamChatRequest {
  question: string;
  userId: string;
  documentIds?: string[];
  onToken?: (token: string) => void;
}

interface StreamChatResponse {
  content: string;
  citations: Array<{
    chunkId: string;
    documentId: string;
    pageNumber?: number;
    snippet: string;
    score: number;
  }>;
  modelUsed: string;
  tokenCount: number;
  latencyMs: number;
}

/**
 * Main RAG pipeline: Retrieve → Generate → Cite
 */
export async function streamChat(
  request: StreamChatRequest
): Promise<StreamChatResponse> {
  const startTime = Date.now();

  try {
    logger.info({ question: request.question }, 'Starting RAG pipeline');

    // Step 1: Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(
      request.question,
      request.userId,
      request.documentIds,
      5, // Top 5 chunks
      0.7 // 70% similarity threshold
    );

    if (chunks.length === 0) {
      logger.warn('No relevant chunks found');
      return {
        content: "I couldn't find any relevant information in your documents to answer this question.",
        citations: [],
        modelUsed: 'none',
        tokenCount: 0,
        latencyMs: Date.now() - startTime,
      };
    }

    // Step 2: Build prompt with retrieved context
    const prompt = buildQAPrompt(
      request.question,
      chunks.map((c) => ({ content: c.content, id: c.id }))
    );

    // Step 3: Assess complexity for model selection
    const complexity = assessQuestionComplexity(request.question);

    // Step 4: Stream answer from LLM
    let fullContent = '';
    const stream = streamAnswer({ prompt }, complexity);

    for await (const token of stream) {
      fullContent += token;
      request.onToken?.(token);
    }

    // Step 5: Extract citations and map to chunks
    const citationNumbers = extractCitationNumbers(fullContent);
    const citations = citationNumbers
      .map((num) => {
        const chunk = chunks[num - 1]; // Citations are 1-indexed
        if (!chunk) return null;

        return {
          chunkId: chunk.id,
          documentId: chunk.documentId,
          pageNumber: chunk.pageNumber,
          snippet: chunk.content.slice(0, 200) + '...',
          score: chunk.score,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    const latencyMs = Date.now() - startTime;

    logger.info({ 
      latencyMs, 
      chunkCount: chunks.length,
      citationCount: citations.length 
    }, 'RAG pipeline completed');

    return {
      content: fullContent,
      citations,
      modelUsed: complexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini',
      tokenCount: 0, // Would need to track from stream
      latencyMs,
    };
  } catch (error) {
    logger.error({ error }, 'RAG pipeline failed');
    throw error;
  }
}

// Re-export key functions
export * from './embeddings';
export * from './retrieval';
export * from './llm';
export * from './prompts/qa';
export { logger };
