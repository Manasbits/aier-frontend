// For App Router (app/api/chat/route.js)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const AGENT_ID = 'finance_agent'; // must match backend Agent.agent_id

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    console.error('[api/chat] Failed to parse JSON body:', e);
    return new Response('Bad request', { status: 400 });
  }
  const { message, session_id, user_id } = payload || {};
  console.log('[api/chat] Incoming:', { message, session_id, user_id });

  const url = `${BACKEND_URL}/runs?agent_id=${encodeURIComponent(AGENT_ID)}`;

  const form = new FormData();
  form.append('message', message ?? '');
  form.append('stream', 'false'); // disable streaming
  if (session_id) form.append('session_id', session_id);
  if (user_id) form.append('user_id', user_id);

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(request.headers.get('authorization')
        ? { Authorization: request.headers.get('authorization') }
        : {}),
    },
    body: form,
  });

  console.log('[api/chat] Upstream status:', upstream.status);
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    console.error('[api/chat] Upstream error body:', text);
    return new Response(text || 'Upstream error', { status: upstream.status || 500 });
  }

  // Read full JSON response from backend (expected to contain the final content)
  const data = await upstream.json().catch(async () => {
    const text = await upstream.text().catch(() => '');
    return { content: text || '' };
  });

  // Normalize response shape to { content: string }
  const content =
    data?.content ??
    data?.message?.content ??
    (Array.isArray(data?.choices) ? data.choices.map(c => c?.message?.content || c?.text || '').join('') : '') ??
    '';

  return Response.json({ content });
}