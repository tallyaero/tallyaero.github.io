/**
 * DashTwo Public Chatbot — Development API Server
 *
 * Runs alongside the Vite dev server. In production, these routes
 * become Vercel Serverless Functions.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChat } from './api/chat';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      qdrant: !!process.env.QDRANT_URL,
      voyage: !!process.env.VOYAGE_API_KEY,
    },
  });
});

// Streaming chat endpoint
app.post('/api/chat', handleChat);

app.listen(PORT, () => {
  console.log(`[DashTwo API] Running on http://localhost:${PORT}`);
  console.log(`[DashTwo API] Environment:`);
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  QDRANT_URL: ${process.env.QDRANT_URL ? 'set' : 'MISSING'}`);
  console.log(`  QDRANT_API_KEY: ${process.env.QDRANT_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  VOYAGE_API_KEY: ${process.env.VOYAGE_API_KEY ? 'set' : 'MISSING'}`);
});
