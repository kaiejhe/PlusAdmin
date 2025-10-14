const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...baseHeaders, ...headers },
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: baseHeaders });
}

export async function onRequestPost({ request }) {
  try {
    const { msgoogle, data } = (await request.json().catch(() => ({}))) || {};
    if (msgoogle === "login" && request.method === "POST") {
      return login(data);
    }
    return json({ ok: false, msg: "当前页面不存在" }, 404);
  } catch (err) {
    // 这能防止 Worker 抛错导致 1101
    return json({ ok: false, msg: `Server Error: ${String(err)}` }, 500);
  }
}

export async function login(params) {
  // 1️⃣ 请求头
  const HeadJson = {
    "Content-Type": "application/json",
    Origin: "https://chatgpt.com",
    Referer: "https://chatgpt.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
    Authorization: "Bearer " + params.authorization,
    "chatgpt-account-id": params.account_id,
  };

  // 2️⃣ 请求体
  const jsondata = {
    email_addresses: params.email_addresses,
    role: params.role,
    resend_emails: params.resend_emails,
  };

  // 3️⃣ 目标地址
  const url = `https://chatgpt.com/backend-api/accounts/${params.account_id}/invites`;

  try {
    // 4️⃣ 发起 POST 请求
    const upstream = await fetch(url, {
      method: "POST",
      headers: HeadJson,
      body: JSON.stringify(jsondata),
      redirect: "manual", // 防止 Cloudflare 自动跳转
    });

    // 5️⃣ 读取结果
    const text = await upstream.text();

    // 6️⃣ 返回结果
    return json({
      ok: true,
      status: upstream.status,
      statusText: upstream.statusText,
      headers: Object.fromEntries(upstream.headers),
      body: text,
    });
  } catch (err) {
    // 捕获异常防止 Worker 报 1101
    return json({
      ok: false,
      error: String(err),
    }, 500);
  }
}

