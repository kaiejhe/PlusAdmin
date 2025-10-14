// functions/api/Gpt.js  —— Cloudflare Pages Functions (Modules)
// 访问路径：/api/Gpt

const CORS_ALLOW_ORIGIN = "*"; // 按需改成你的前端域名
const corsBaseHeaders = {
  "Access-Control-Allow-Origin": CORS_ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, *",
  "Access-Control-Max-Age": "86400",
};

const hopByHopHeaders = new Set([
  "host",
  "content-length",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function filterHeaders(headers) {
  const out = new Headers();
  for (const [k, v] of headers.entries()) {
    if (!hopByHopHeaders.has(k.toLowerCase())) out.set(k, v);
  }
  return out;
}

// 处理 CORS 预检
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsBaseHeaders });
}

// 只允许 POST
export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST is allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsBaseHeaders },
    });
  }

  try {
    // 目标地址：按需改为具体 API 路径，例如 https://chatgpt.com/backend-api/xxx
    const targetUrl = "https://chatgpt.com";

    const outgoingHeaders = filterHeaders(request.headers);
    // 如果你确定发 JSON，可以强制：
    // outgoingHeaders.set("Content-Type", "application/json");

    // 透传请求体（流式，不用先读出来）
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: outgoingHeaders,
      body: request.body,
      // redirect: "follow", // 如需跟随重定向可打开
    });

    const respHeaders = filterHeaders(upstream.headers);
    // 注入/覆盖 CORS
    for (const [k, v] of Object.entries(corsBaseHeaders)) respHeaders.set(k, v);

    // 原样返回上游状态码/响应体（流式）
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
