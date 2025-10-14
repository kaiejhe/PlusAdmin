// functions/api/Gpt.js  —— Cloudflare Pages Functions
// 路由：/api/Gpt  (只接受 POST)

const CORS_ALLOW_ORIGIN = "*"; // 按需改成你的前端域名
const corsBaseHeaders = {
  "Access-Control-Allow-Origin": CORS_ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, *",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsBaseHeaders });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST is allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsBaseHeaders },
    });
  }

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsBaseHeaders },
    });
  }

  try {
    // 你的前端把 payload 直接 POST 给本接口即可（例如 { model, messages, ... }）
    const body = await request.text(); // 原样转发；也可用 await request.json()

    // 选一个你需要的官方API路径（示例：Chat Completions）
    const targetUrl = "https://api.openai.com/v1/chat/completions";

    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body, // 把前端传来的 JSON 透传过去
    });

    // 把上游返回原样转给调用者
    const respHeaders = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(corsBaseHeaders)) respHeaders.set(k, v);

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream request failed", message: err?.message ?? String(err) }),
      {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsBaseHeaders },
      }
    );
  }
}
