
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
    if (msgoogle === 'addlist'  && request.method === 'POST') return addlist(data, env)
    if (msgoogle === 'dellist'  && request.method === 'POST') return dellist(data, env)
    if (msgoogle === 'updlist'  && request.method === 'POST') return updlist(data, env)
    if (msgoogle === 'getlist'  && request.method === 'POST') return getlist(data, env)
    if (msgoogle === 'foradd'  && request.method === 'POST') return foradd(data, env)
  return json({ ok:false, msg:'当前页面不存在1' }, 404)
}

//通用添加数据
async function addlist(request,env) {
    const db = env.TokenD1
    const { table, data } = request;
    if (!table || !data) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const columns = await getTableMeta(db, table);
    const validKeys = Object.keys(data).filter(key => columns.includes(key));
    const validValues = validKeys.map(key => data[key]);
    if (validKeys.length === 0) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const placeholders = validKeys.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${validKeys.join(", ")}) VALUES (${placeholders})`;
    try {
        const res = await env.PageToken.prepare(sql).bind(...validValues).run();
        return json({ ok: true, msg: "新增成功", id: res.meta.last_row_id }, 201);
    } catch (error) {
        return json({ ok: false, msg: "插入数据失败", error: String(error) }, 500);
    }
}

//通用删除数据
async function addlist(request,env) {
    const db = env.TokenD1
    const { table,id } = request;
    if (!table||!id) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    try {
        const res = await db.prepare(sql).bind(Number(id)).run();
        if(res.success){
            return json({ ok: true, msg: "删除成功" }, 200);
        }else{
            return json({ ok: false, msg: "删除失败" }, 404);
        }
    } catch (error) {
        return json({ ok: false, msg: "删除数据失败", error: String(error) }, 500);
    }
}

//通用修改
async function updlist(request,env) {
    const db = env.TokenD1
    const { table, updates,id } = request;
    if (!table || !updates ||!id) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const columns = await getTableMeta(db, table);
    const validKeys = Object.keys(updates).filter(key => columns.includes(key));
    const validValues = validKeys.map(key => updates[key]);
    if (validKeys.length === 0) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const setClause = validKeys.map(key => `${key} = ?`).join(", ");
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    try {
        const res = await db.prepare(sql).bind(...validValues, Number(id)).run();
        if (res.success) {
            return json({ ok: true, msg: "更新成功" }, 200);
        } else {
            return json({ ok: false, msg: "更新失败" }, 404);
        }
    } catch (error) {
        return json({ ok: false, msg: "更新数据失败", error: String(error) }, 500);
    }
}

//通用查询
async function updlist(request,env) {
    const db = env.TokenD1
    const { table, filters = {}, page = 1, pageSize = 10 } = request;
    if (!table) {
      return json({ ok: false, msg: "当前页面不存在" }, 400);
    }
    let whereClause = '';
    const values = [];
    if (filters && Object.keys(filters).length > 0) {
      whereClause = "WHERE ";
      const filterKeys = Object.keys(filters);
      filterKeys.forEach((key, index) => {
        whereClause += `${key} = ?`;
        values.push(filters[key]);
        // 如果不是最后一个条件，添加 AND
        if (index < filterKeys.length - 1) {
          whereClause += " AND ";
        }
      });
    }
    const offset = (page - 1) * pageSize;
    const sql = `SELECT * FROM ${table} ${whereClause} LIMIT ?, ?`;
    try {
        const res = await db.prepare(sql).bind(...values, offset, pageSize).all();
        if (res) {
            return json({ ok: true, data: res.results }, 200);
        } else {
            return json({ ok: false, msg: "没有找到数据" }, 404);
        }
    } catch (error) {
        return json({ ok: false, msg: "查询失败", error: String(error) }, 500);
    }
}

//批量添加方法
async function foradd(request,env) {
    const db = env.TokenD1;
    const {cardtext = []} = request;
    if(cardtext.length < 1 ) return json({ ok: false, msg: "当前页面不存在1" }, 404);
    const chinaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).getTime();
    const Tssss = cardtext.map((index) => {
        return {
         cardtext: index,
         state: 'o1',
         created_at: chinaTime
       };
    });
    try {
        const statements = Tssss.map((item) => db.prepare("INSERT INTO card (cardtext, state, created_at) VALUES (?, ?, ?)" ).bind(item.cardtext,item.state,item.created_at ));
        await db.batch(statements);
        return json({ ok: true, msg: "添加成功" }, 200);
    } catch (error) {
        return json({ ok: false, msg: "添加失败", error: error.message }, 500);
    }
}


//管理员登录
async function login(request,env) {
  const db = env.TokenD1;
  if (!db) return json({ ok: false, msg: "服务器异常" }, 500);
  try {
    const { username, password } = request;
    if (!username || !password) return json({ ok: false, msg: "管理员账号密码不能为空" }, 400);
    const probe = await db.prepare("SELECT 1 AS ok").first();
    if (!probe) return json({ ok: false, msg: "D1 探活失败" }, 500);
    const user = await db.prepare("SELECT  username, password FROM admin WHERE username = ? AND password = ?").bind(username, password).first();
    if (!user) return json({ ok: false, msg: "用户名或密码错误" }, 401);
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
