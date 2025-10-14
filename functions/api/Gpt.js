// functions/api/Gpt.js  —— Cloudflare Pages Functions

const CORS_ALLOW_ORIGIN = "*"; // 按需改你的前端域名
const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, *",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST is allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  // 期望前端传入：
  // {
  //   account_id: "7c9d1097-a1e7-4456-8468-fc6961db9fc9",
  //   email_addresses: ["512422914@qq.com"],
  //   role: "standard-user",
  //   resend_emails: true,
  //   authorization: "Bearer xxxx", // 也可让前端放在请求头 Authorization 里
  //   userAgent: "...(可选, 默认一个常见UA)"
  // }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  const {
    account_id,
    email_addresses,
    role = "standard-user",
    resend_emails = true,
    authorization, // 可选：也可从 request.headers 里取
    userAgent,
  } = payload || {};

  if (!account_id || !Array.isArray(email_addresses) || email_addresses.length === 0) {
    return new Response(JSON.stringify({ error: "Missing required fields: account_id, email_addresses[]" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  // 优先 body 里的 authorization，没有则用请求头
  const authHeader = authorization || request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization (Bearer ...)" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  // 仅允许发往 chatgpt.com 的固定路径，避免 SSRF
  const url = `https://chatgpt.com/backend-api/accounts/${encodeURIComponent(account_id)}/invites`;

  // 构造要转发的 body
  const upstreamBody = JSON.stringify({
    email_addresses,
    role,
    resend_emails,
  });

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://chatgpt.com",
        "Referer": "https://chatgpt.com/",
        "User-Agent":
          userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Authorization": authHeader,
        "chatgpt-account-id": account_id,
      },
      body: upstreamBody,
      redirect: "manual", // 看到是否被 3xx/挑战
    });

    // 透传响应（可能是 JSON，也可能是 HTML 挑战页）
    const respHeaders = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(corsHeaders)) respHeaders.set(k, v);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Upstream request failed", message: String(e) }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }
}
