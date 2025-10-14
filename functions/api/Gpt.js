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
  return json({ ok: true, msg: params });
}
