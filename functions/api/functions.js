import { data } from "autoprefixer";

//协议头处理,跨域
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers 
    },
  });

//进入方法接受的参数
export async function onRequestPost({ request, env }) {
  const { msgoogle,data } = await request.json().catch(() => ({}));
  if (msgoogle === 'login'  && request.method === 'POST') return login(data, env)
  return json({ ok:false, msg:'当前页面不存在' }, 404)
}

//管理员登录

async function login(request,env) {
  const db = env.tokensql;
  if (!db) return json({ ok: false, msg: "服务器异常" }, 500);
  try {
    const { username, password } = request;
    if (!username || !password) return json({ ok: false, msg: "管理员账号密码不能为空" }, 400);
    const probe = await db.prepare("SELECT 1 AS ok").first();
    if (!probe) return json({ ok: false, msg: "D1 探活失败" }, 500);
    const user = await db.prepare("SELECT  username, password, cokies, intnum FROM userAdmin WHERE username = ? AND password = ?").bind(username, password).first();
    if (!user) {
      await db .prepare(`UPDATE userAdmin SET intnum = MAX(COALESCE(intnum, 0) - 1, 0),last_login_at = datetime('now')WHERE username = ?`).bind(username).run();
      return json({ ok: false, msg: "用户名或密码错误" }, 401);
    }
    return json({ ok: true, msg: "登录成功" }, 200);

  } catch (e) {
    // 关键：把真实错误返回，便于定位；调试好后再去掉 error 字段
    return json({ ok: false, msg: "Server Error", error: String(e) }, 500);
  }
}

// 获取表的字段信息
async function getTableMeta(db, table) {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all(); // 获取表的列信息
  const columns = results.map(r => r.name);  // 提取字段名
  return columns;
}

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
