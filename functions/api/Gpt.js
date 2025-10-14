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
    return request
  const heade =  new Response(JSON.stringify({ error: "Only POST is allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://chatgpt.com",
      Referer: "https://chatgpt.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      Authorization: "Bearer " + request.Authorization,
      "chatgpt-account-id": request.chatgpt - account - id,
    },
  });
  const Jsondata = JSON.stringify({
    email_addresses:request.email_addresses,
    role: request.role,
    resend_emails: request.resend_emails
  })
  
   
}
