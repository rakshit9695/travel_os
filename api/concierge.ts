// Serverless proxy for the AI concierge (Vercel / Netlify compatible).
// Keeps HF_TOKEN server-side — the client NEVER sees it.
//
// Behaviour:
//  • No HF_TOKEN configured  → responds { source: 'local' } so the client
//    uses its local rules engine. The demo works with zero keys.
//  • HF_TOKEN present         → calls the Hugging Face Inference API with the
//    injected trip context and returns { source: 'hf', answer }.
//  • Any HF error            → falls back to { source: 'local' }.
//
// Deploy: put this file under /api on Vercel, or adapt the handler signature
// for Netlify Functions. Locally, `npm run dev` does NOT run this — the client
// fetch fails fast and falls back to local, which is the intended dev demo path.

export const config = { runtime: 'edge' };

interface Body {
  question: string;
  context: string;
  history?: { role: string; content: string }[];
}

const SYSTEM = `You are "Voyage", a warm, concise travel concierge for the Mishra family's first trip to Switzerland (16–25 June 2026).
Answer ONLY from the provided trip context. Be specific, practical and brief (2–5 sentences or a short list).
The whole family is vegetarian. June is summer in the valleys (do NOT give winter advice) but high-altitude excursions are near-freezing.
If the context lacks the answer, say what you do know and suggest checking the relevant screen. Never invent prices, times or bookings.`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ source: 'local', error: 'method' }, 405);
  }

  const token = (globalThis as any)?.process?.env?.HF_TOKEN as string | undefined;
  const model =
    ((globalThis as any)?.process?.env?.HF_MODEL as string | undefined) ||
    'meta-llama/Meta-Llama-3-8B-Instruct';

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ source: 'local', error: 'bad-json' }, 400);
  }

  // No token → tell the client to use its local engine.
  if (!token) {
    return json({ source: 'local' });
  }

  try {
    const messages = [
      { role: 'system', content: `${SYSTEM}\n\n=== CURRENT TRIP CONTEXT ===\n${body.context}` },
      ...(body.history ?? []).map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: body.question },
    ];

    // HF router (OpenAI-compatible chat completions).
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      return json({ source: 'local', error: `hf-${res.status}` });
    }
    const data = await res.json();
    const answer: string | undefined = data?.choices?.[0]?.message?.content;
    if (!answer) return json({ source: 'local', error: 'empty' });
    return json({ source: 'hf', answer });
  } catch (e) {
    return json({ source: 'local', error: 'exception' });
  }
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
