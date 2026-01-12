// packages/ai/src/prompts/qa.ts

export const QA_SYSTEM_PROMPT = `You are an intelligent document assistant. Your role is to answer questions based ONLY on the provided context from documents.

CRITICAL RULES:
1. Answer ONLY using information from the context below
2. If the answer is not in the context, say "I cannot find that information in the provided documents"
3. Include citation numbers [1], [2], etc. after statements that come from specific sources
4. Be concise but complete
5. If the context is contradictory, acknowledge different perspectives
6. Never make up or infer information not present in the context

Context:
{context}

Question: {question}

Answer with citations:`;

export const QA_PROMPT_VERSION = 'v1.0.0';

/**
 * Build Q&A prompt with context and citations
 */
export function buildQAPrompt(
  question: string,
  chunks: Array<{ content: string; id: string }>
): string {
  // Format context with citation numbers
  const context = chunks
    .map((chunk, idx) => `[${idx + 1}] ${chunk.content}`)
    .join('\n\n---\n\n');

  return QA_SYSTEM_PROMPT
    .replace('{context}', context)
    .replace('{question}', question);
}

/**
 * Extract citation numbers from AI response
 * Example: "The report [1] shows that sales [2] increased"
 * Returns: [1, 2]
 */
export function extractCitationNumbers(text: string): number[] {
  const matches = text.match(/\[(\d+)\]/g);
  if (!matches) return [];

  return matches
    .map((match) => parseInt(match.replace(/\[|\]/g, ''), 10))
    .filter((num) => !isNaN(num));
}
