// functions/api/Gpt.js  —— Cloudflare Pages Functions
// 用法：POST /api/Gpt  带 JSON：
// {
//   "account_id": "f381a384-c9f9-4cde-b68c-921c8316b87e",
//   "emails": ["512422914@qq.com"],
//   "role": "standard-user",               // 可选，默认 standard-user
//   "resend_emails": true,                 // 可选，默认 true
//   // 下面这些对应你要转发的头，从前端传入，避免硬编码：
//   "authorization": "Bearer xxx",         // 必填：你的 Authorization
//   "cookie": "__cf_bm=...; _cfuvid=...",  // 可选：你贴的 Cookie
//   "user_agent": "Mozilla/5.0 ...",       // 可选
//   "origin": "https://chatgpt.com",       // 可选，默认 https://chatgpt.com
//   "referer": "https://chatgpt.com/"      // 可选，默认 https://chatgpt.com/
// }

const CORS_ALLOW_ORIGIN = "*"; // 按需改成你的前端域名
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

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  const {
    account_id,
    emails,
    role = "standard-user",
    resend_emails = true,
    authorization,
    cookie,
    user_agent,
    origin = "https://chatgpt.com",
    referer = "https://chatgpt.com/",
  } = body || {};

  if (!account_id || !Array.isArray(emails) || emails.length === 0) {
    return new Response(JSON.stringify({ error: "Missing required fields: account_id, emails[]" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }
  if (!authorization) {
    return new Response(JSON.stringify({ error: "Missing authorization (Bearer ...)" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }

  const url = `https://chatgpt.com/backend-api/accounts/${encodeURIComponent(
    account_id
  )}/invites`;

  const upstreamHeaders = new Headers();
  upstreamHeaders.set("Content-Type", "application/json");

  // 你列的这些头尽量一一设置（注意：Host/Content-Length/Connection/Accept-Encoding 通常会被忽略/接管）
  upstreamHeaders.set("Authorization", authorization);
  upstreamHeaders.set("Origin", origin);
  upstreamHeaders.set("Referer", referer);
  upstreamHeaders.set("User-Agent", user_agent || "Mozilla/5.0");
  upstreamHeaders.set("Accept", "*/*");
  if (cookie) upstreamHeaders.set("Cookie", cookie);

  // 你贴过的自定义头
  upstreamHeaders.set("chatgpt-account-id", account_id);

  const payload = JSON.stringify({
    email_addresses: emails,
    role,
    resend_emails,
  });

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: upstreamHeaders,
      body: payload,
      redirect: "manual", // 便于观察是否被挑战/重定向
      // cf: { fetchMetadata: undefined } // 一般不需要
    });

    // 透传响应（可能是 JSON 或 HTML）
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
