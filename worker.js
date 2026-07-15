/* JARVIS relay — deploy free on Cloudflare Workers.
   NVIDIA's API refuses direct browser connections (CORS); this relay
   forwards your app's requests and adds the missing headers.
   Open the worker URL in a browser — you should see {"jarvis-relay":"online"} */

export default {
  async fetch(request) {
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method === 'GET')
      return new Response(JSON.stringify({ 'jarvis-relay': 'online' }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });

    let payload;
    try { payload = await request.text(); }
    catch (e) { return new Response('{"error":"bad body"}', { status: 400, headers: CORS }); }

    const upstream = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: payload
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
};
