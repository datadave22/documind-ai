// packages/ai/src/prompts/versions.ts

export const PROMPT_VERSIONS = {
  qa_v1: {
    version: '1.0.0',
    createdAt: '2025-01-10',
    description: 'Initial Q&A prompt with citation support',
  },
};

export function getPromptVersion(key: string): string {
  return PROMPT_VERSIONS[key as keyof typeof PROMPT_VERSIONS]?.version || 'unknown';
}
