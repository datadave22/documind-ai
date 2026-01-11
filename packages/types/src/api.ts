// packages/types/src/api.ts

// ============================================
// Document API Types
// ============================================

export interface UploadDocumentRequest {
  file: File;
}

export interface UploadDocumentResponse {
  id: string;
  filename: string;
  status: 'processing' | 'ready' | 'failed';
  jobId: string;
}

export interface DocumentListItem {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  chunkCount: number | null;
  pageCount: number | null;
  fileSize: number;
}

export interface ListDocumentsResponse {
  documents: DocumentListItem[];
}

export interface GetDocumentResponse {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  chunkCount: number | null;
  pageCount: number | null;
  error: string | null;
}

// ============================================
// Chat API Types
// ============================================

export interface ChatRequest {
  conversationId?: string;
  message: string;
  documentIds?: string[];
}

export interface ChatStreamEvent {
  type: 'token' | 'citations' | 'done' | 'error';
  token?: string;
  citations?: Citation[];
  error?: string;
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  content: string;
  citations: Citation[];
  modelUsed: string;
  tokenCount: number;
  latencyMs: number;
}

export interface Citation {
  id: string;
  documentId: string;
  filename?: string;
  pageNumber?: number;
  snippet: string;
  score: number;
}

// ============================================
// Conversation API Types
// ============================================

export interface ConversationListItem {
  id: string;
  title: string | null;
  createdAt: string;
  messageCount: number;
}

export interface ListConversationsResponse {
  conversations: ConversationListItem[];
}

export interface GetConversationResponse {
  id: string;
  title: string | null;
  createdAt: string;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
  citations?: Citation[];
  modelUsed?: string;
}

// ============================================
// Feedback API Types
// ============================================

export interface SubmitFeedbackRequest {
  messageId: string;
  rating: number;
  comment?: string;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  feedbackId: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, any>;
}
