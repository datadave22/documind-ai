// packages/types/src/models.ts

// ============================================
// Domain Models (mirrors Prisma schema)
// ============================================

export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  storageUrl: string;
  pageCount: number | null;
  chunkCount: number | null;
  error: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  embedding: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  modelUsed: string | null;
  tokenCount: number | null;
  latencyMs: number | null;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  messageId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

// ============================================
// Job Queue Types
// ============================================

export interface DocumentIngestionJobData {
  documentId: string;
  storageUrl: string;
  mimeType: string;
}

export interface DocumentIngestionJobResult {
  documentId: string;
  success: boolean;
  chunkCount?: number;
  error?: string;
}
