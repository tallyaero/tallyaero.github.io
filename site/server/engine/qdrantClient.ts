/**
 * Qdrant Client — from @aeroedge/dashtwo
 */

import { QdrantClient } from '@qdrant/js-client-rest';

export interface QdrantSearchResult {
  text: string;
  metadata: Record<string, unknown>;
  score: number;
}

export interface QdrantFilter {
  must?: Array<{ key: string; match: { value: string | number } }>;
  should?: Array<{ key: string; match: { value: string | number } }>;
  must_not?: Array<{ key: string; match: { value: string | number } }>;
}

let client: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!client) {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    if (!url || !apiKey) throw new Error('QDRANT_URL and QDRANT_API_KEY must be configured');
    client = new QdrantClient({ url, apiKey });
  }
  return client;
}

export async function searchFAA(
  queryEmbedding: number[],
  filter?: QdrantFilter | null,
  limit: number = 10
): Promise<QdrantSearchResult[]> {
  const qdrant = getClient();

  console.log('[Qdrant] Search filter:', JSON.stringify(filter, null, 2));

  const results = await qdrant.search('faa-knowledge', {
    vector: queryEmbedding,
    limit,
    with_payload: true,
    ...(filter ? { filter } : {}),
  });

  // Log what we got back for debugging
  for (const r of results.slice(0, 3)) {
    const p = r.payload as Record<string, unknown>;
    console.log(`[Qdrant] score=${r.score.toFixed(3)} content_type=${p.content_type} document_type=${p.document_type} source=${p.source || p.title}`);
  }

  return results.map(r => ({
    text: String((r.payload as Record<string, unknown>)?.text || ''),
    metadata: (r.payload as Record<string, unknown>) || {},
    score: r.score,
  }));
}
