# 📘 DocuMind AI

**Production‑Ready Retrieval‑Augmented Generation (RAG) Library**  
A modular, reusable TypeScript package that powers semantic search and AI‑driven question answering over private documents.

---

## 🚀 What Is DocuMind AI?

DocuMind AI is a standalone RAG pipeline designed for **building document‑aware AI applications**. It combines:

- Embedding generation using OpenAI
- Vector retrieval using Qdrant
- Prompt templates with citation support
- Streaming LLM responses with cost‑aware model selection

It is fully type‑safe, compiled with TypeScript, and suitable for deployment in backend services, microservices, or as an internal package.

---

## 💡 Why This Matters

Traditional LLMs hallucinate and lack context. RAG solves this by:

- **Grounding answers in real document content**
- **Providing citations for transparency**
- **Optimizing costs by choosing appropriate models**
- **Supporting real‑time UX with streaming**

DocuMind AI implements this in a **professional, production‑ready** manner.

---

## 📦 Core Features

- **Embeddings**
  - Generate vector representations for text
  - Batched embedding support to manage rate limits
- **Vector Retrieval**
  - Qdrant integration with metadata filters
  - Score thresholding for quality
- **LLM Integration**
  - Streaming and non‑streaming OpenAI responses
  - Complexity‑based model selection (cheap vs high‑quality)
- **Prompt System**
  - Versioned templates
  - Citation formatting and extraction
- **Orchestration**
  - End‑to‑end RAG pipeline with performance measurement
- **Logging**
  - Structured logs via `pino`
  - Environment‑driven log levels

---

## 📌 Installation

```bash
# Clone the repo
git clone https://github.com/datadave22/documind-ai.git

cd documind-ai/packages/ai

npm install

OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333
LOG_LEVEL=info

packages/ai/
├─ dist/                     # Compiled output
├─ src/
│  ├─ embeddings.ts          # Embedding generation
│  ├─ retrieval.ts           # Vector search & Qdrant
│  ├─ llm.ts                 # OpenAI LLM orchestration
│  ├─ logger.ts              # Structured logging
│  ├─ prompts/
│  │  ├─ qa.ts               # Q&A prompt templates
│  │  └─ versions.ts         # Prompt versioning
│  └─ index.ts               # RAG pipeline orchestration
├─ tsconfig.json             # Compiler config
├─ package.json              # npm package + scripts
├─ .gitignore


Run Query
const response = await streamChat({
  question: "What is RAG?",
  userId: "user_123",
  onToken: (token) => console.log(token)
});

console.log(response);

Question
   ↓
[Embedding Generation]
   ↓
[Vector Retrieval (Qdrant)]
   ↓
[Prompt Construction]
   ↓
[LLM Generation (Streaming)]
   ↓
[Citations + Response]


[1.0.0]
