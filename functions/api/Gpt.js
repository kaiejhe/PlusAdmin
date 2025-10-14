const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers,
    },
  });

// 👇 必须新增：处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

//进入方法接受的参数
export async function onRequestPost({ request}) {
  const { msgoogle, data } = await request.json().catch(() => ({}));
  if (msgoogle === "login" && request.method === "POST")
    return login(data);
  return json({ ok: false, msg: "当前页面不存在" }, 404);
}

export async function login(params) {


    return params
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