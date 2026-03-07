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
import { handleCheckout, handlePortal, handleWebhook } from './api/stripe';
import { handleCreateShare, handleGetShare } from './api/share';
import { handleAdminStats, handleAdminTopics } from './api/admin';
import { handlePublicStats } from './api/stats';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());

// Stripe webhook needs raw body for signature verification
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// All other routes use JSON parsing
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
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
  });
});

// Streaming chat endpoint
app.post('/api/chat', handleChat);

// Stripe endpoints
app.post('/api/stripe/checkout', handleCheckout);
app.post('/api/stripe/portal', handlePortal);

// Share endpoints
app.post('/api/share', handleCreateShare);
app.get('/api/share/:id', handleGetShare);

// Public stats (social proof on landing pages)
app.get('/api/stats', handlePublicStats);

// Admin endpoints
app.get('/api/admin/stats', handleAdminStats);
app.get('/api/admin/topics', handleAdminTopics);

app.listen(PORT, () => {
  console.log(`[DashTwo API] Running on http://localhost:${PORT}`);
  console.log(`[DashTwo API] Environment:`);
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  QDRANT_URL: ${process.env.QDRANT_URL ? 'set' : 'MISSING'}`);
  console.log(`  QDRANT_API_KEY: ${process.env.QDRANT_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  VOYAGE_API_KEY: ${process.env.VOYAGE_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'set' : 'MISSING'}`);
});
