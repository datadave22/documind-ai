// packages/ai/src/llm.ts

import OpenAI from 'openai';
import { logger } from './logger';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface LLMRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface LLMResponse {
  content: string;
  modelUsed: string;
  tokenCount: number;
  latencyMs: number;
}

/**
 * Assess question complexity to choose the right model
 * Simple questions → gpt-4o-mini ($0.15/$0.60 per 1M tokens)
 * Complex questions → gpt-4o ($2.50/$10 per 1M tokens)
 */
export function assessQuestionComplexity(question: string): 'simple' | 'complex' {
  const complexIndicators = [
    'compare',
    'analyze',
    'evaluate',
    'synthesize',
    'explain how',
    'explain why',
    'relationship',
    'multiple',
    'differences',
    'similarities',
  ];

  const lowerQuestion = question.toLowerCase();
  const hasComplexIndicator = complexIndicators.some((indicator) =>
    lowerQuestion.includes(indicator)
  );

  const isLongQuestion = question.length > 100;

  return hasComplexIndicator || isLongQuestion ? 'complex' : 'simple';
}

/**
 * Generate answer using OpenAI (non-streaming)
 */
export async function generateAnswer(
  request: LLMRequest,
  questionComplexity: 'simple' | 'complex' = 'simple'
): Promise<LLMResponse> {
  const startTime = Date.now();
  const model = questionComplexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini';

  try {
    logger.info({ model, complexity: questionComplexity }, 'Generating answer');

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: request.prompt }],
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 1000,
      stream: false,
    });

    const latencyMs = Date.now() - startTime;

    logger.info({ 
      model, 
      tokenCount: completion.usage?.total_tokens,
      latencyMs 
    }, 'Answer generated');

    return {
      content: completion.choices[0].message.content || '',
      modelUsed: model,
      tokenCount: completion.usage?.total_tokens || 0,
      latencyMs,
    };
  } catch (error) {
    logger.error({ error, model }, 'Failed to generate answer');
    throw error;
  }
}

/**
 * Stream answer from OpenAI (for real-time UI)
 */
export async function* streamAnswer(
  request: LLMRequest,
  questionComplexity: 'simple' | 'complex' = 'simple'
): AsyncGenerator<string> {
  const model = questionComplexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini';

  try {
    logger.info({ model }, 'Starting answer stream');

    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: request.prompt }],
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

    logger.info({ model }, 'Stream completed');
  } catch (error) {
    logger.error({ error, model }, 'Stream failed');
    throw error;
  }
}
