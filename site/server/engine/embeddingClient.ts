/**
 * Voyage AI Embedding Client — from @aeroedge/dashtwo
 */

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3-large';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

interface VoyageEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

function getApiKey(): string {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error('VOYAGE_API_KEY not configured');
  return apiKey;
}

async function callVoyageAPI(
  input: string[],
  inputType: 'query' | 'document'
): Promise<VoyageEmbeddingResponse> {
  const apiKey = getApiKey();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input,
        input_type: inputType,
      }),
    });

    if (response.ok) {
      return (await response.json()) as VoyageEmbeddingResponse;
    }

    if (response.status === 429) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(`[VoyageAI] Rate limited, retrying in ${backoff}ms`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      continue;
    }

    const errorText = await response.text();
    throw new Error(`Voyage AI API error ${response.status}: ${errorText}`);
  }

  throw new Error('Voyage AI API: max retries exceeded');
}

export async function embedQuery(text: string): Promise<number[]> {
  const result = await callVoyageAPI([text], 'query');
  return result.data[0].embedding;
}
