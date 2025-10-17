
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
    if (msgoogle === 'AdminToken'  && request.method === 'POST') return AdminToken(data, env)
    if (msgoogle === 'Card'  && request.method === 'POST') return Card(data, env)
    if (msgoogle === 'TeamEmail'  && request.method === 'POST') return TeamEmail(data, env)
    return json({ ok:false, msg:'当前页面不存在' }, 404)
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
        const res = await db.prepare(sql).bind(...validValues).run();
        return json({ ok: true, msg: "新增成功", id: res.meta.last_row_id }, 201);
    } catch (error) {
        return json({ ok: false, msg: "添加数据失败", error: String(error) }, 500);
    }
}

//通用删除数据
async function dellist(request,env) {
    const db = env.TokenD1
    const { table,id } = request;
    if (!table||!id) return json({ ok: false, msg: "当前页面不存在" }, 400);
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    try {
        const res = await db.prepare(sql).bind(id).run();
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
        const res = await db.prepare(sql).bind(...validValues, id).run();
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
async function getlist(request,env) {
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
    const countSql = `SELECT COUNT(*) AS total FROM ${table} ${whereClause}`;

    try {
        // 查询总数量
        const countRes = await db.prepare(countSql).bind(...values).first();
        const total = countRes?.total || 0;
        // 查询当前页数据
        const res = await db.prepare(sql).bind(...values, offset, pageSize).all();
        if (res) {
            return json({ ok: true, data: res.results,total,msg:"查询成功" }, 200);
        } else {
            return json({ ok: false, msg: "查询失败" }, 404);
        }
    } catch (error) {
        return json({ ok: false, msg: "查询失败", error: String(error) }, 500);
    }
}

//批量添加方法
async function foradd(request,env) {
    const db = env.TokenD1;
    const {CardList = [],type,CardTime=null} = request;
    if(CardList.length < 1 ) return json({ ok: false, msg: "当前页面不存在1" }, 404);
    const chinaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).getTime();
    const Tssss = CardList.map((index) => {
        return {
         CardList: index,
         state: 'o1',
         created_at: chinaTime,
         type:type,
         CardTime:CardTime
       };
    });
    try {
        const statements = Tssss.map((item) => db.prepare("INSERT INTO card (cardtext, state, created_at,type,CardTime) VALUES (?, ?, ?,?,?)" ).bind(item.CardList,item.state,item.created_at,item.type,item.CardTime ));
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
//随机订单号生成
function generateOrderId() {
  // 工具函数，生成指定长度的随机大写字符串
  function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len);
  }
  const part1 = randomStr(4); // 前 6 位
  const part2 = randomStr(4); // 中间 4 位
  const part3 = randomStr(4); // 中间 4 位
  const part4 = randomStr(4); // 后 6 位
  return `${part1}-${part2}-${part3}-${part4}`;
}

//后台提交订单
export async function AdminToken(request, env){
  const db = env.TokenD1;
  const { Token, Cardcode } = request;
  if (!Token || !Cardcode || !db) {
      return json({ ok: false, msg: "当前页面不存在" }, 200);
  }
  try {
    const existingOrder = await db
      .prepare("SELECT id FROM plusorder WHERE AccessToken = ? AND State ='o1'")
      .bind(Token)
      .all();
    if (existingOrder.results.length > 0)
      return json({ ok: false, msg: "正在订阅中,请勿重复提交" }, 200);
    // 🔹 解析 JWT
    const parts = Token.split(".");
    if (parts.length !== 3)
      return json({ ok: false, msg: "JSON参数错误" }, 200);
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const payloadDecoded = decodeURIComponent(escape(atob(base64)));
    const payloadJson = JSON.parse(payloadDecoded);
    const Email = payloadJson["https://api.openai.com/profile"]?.email;
    const exp = payloadJson.exp;
    if (!Email || !exp) return json({ ok: false, msg: "JSON参数错误" }, 200);
    if (Math.floor(Date.now() / 1000) > exp)
      return json({ ok: false, msg: "JSON参数已过期" }, 200);
    // 🔹 生成唯一订单ID
    const orderId = generateOrderId();
    const timestamp = Math.floor(Date.now() / 1000);
    // 🔹 写入订单
    const orderInsert = await db
      .prepare(
        `
    INSERT INTO plusorder (usOrder, Email, Cardkey, AccessToken, State, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .bind(orderId, Email, Cardcode, Token, "o1", timestamp)
      .run();
    if (orderInsert.meta.last_row_id<1) {
      return json({ ok: false, msg:"Plus订阅任务提交失败" }, 200);
    }
    return json({ ok: true, msg: "Plus订阅任务提交成功" }, 200);
  } catch (error) {}
     return json({ ok: false, msg: "Plus订阅任务提交失败" }, 500);
}


//Team验证激活码是否存在
export async function Card(request, env){
  const db = env.TokenD1;
  const { Card } = request;
  const CardRes = await db.prepare("SELECT cardtext, type ,state , CardTime FROM  card WHERE cardtext = ? AND type = ?")
  .bind(Card, "Team").first();
  if(!CardRes) return json({ ok: false, msg: "兑换码不存在" }, 200);
  if(CardRes.state=='o1') return json({ ok: true, msg: "兑换码验证成功",Time:CardRes.CardTime }, 200);
  if(CardRes.state=='o2') return json({ ok: false, msg: "兑换码已使用!" }, 200);
  if(CardRes.state=='o3') return json({ ok: false, msg: "兑换码已失效!" }, 200);
  return json({ ok: false, msg: "当前页面不存在",tM:CardRes }, 200); 
}

//Team 提交订单并且邀请
export async function TeamEmail(request, env){
  const db = env.TokenD1;
  const { Card,Email } = request;
  const CardRes = await db.prepare("SELECT * FROM  card WHERE cardtext = ? AND type = ?")
  .bind(Card, "Team").first();
  if(!CardRes) return json({ ok: false, msg: "兑换码不存在" }, 200);
  if(CardRes.state!='o1'){
    if(CardRes.state=='o2') return json({ ok: false, msg: "兑换码已使用!" }, 200);
    if(CardRes.state=='o3') return json({ ok: false, msg: "兑换码已失效!" }, 200);
    return json({ ok: false, msg: "当前页面不存在",tM:CardRes }, 200); 
  }
  const TeamRES = await db.prepare(`
  SELECT * FROM teamtoken WHERE State = ? AND Time = ? AND usNum > 0 `).bind("o1", CardRes.CardTime).first();
  if(!TeamRES) return json({ ok: false, msg: "库存不足,请联系客服添加库存!",TeamRES:TeamRES,SS:CardRes.CardTime }, 200);
  let DataJson
  if(CardRes.CardTime==30){
    DataJson = JSON.stringify({
      Email: [Email],
      Token: TeamRES.AccToken,
      Accid:TeamRES.TeamID,
      role:"standard-user"
  })
  }else{
    DataJson = JSON.stringify({
      Email: [Email],
      Token: TeamRES.AccToken,
      Accid:TeamRES.TeamID,
      role:"standard-user"
  })
  }
  const res = await fetch('http://pyapi.my91.my/TeamAdd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: DataJson
  });
  const result = await res.json();
  if(res.ok && result.status==='success'){
    try {
      const chinaTime = Math.floor(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).getTime() / 1000);
      const stmts = [
        db.prepare("BEGIN"),
        // 1) 更新 card 状态
        db.prepare("UPDATE card SET state = ? WHERE cardtext = ? AND type = ?")
          .bind("o2", Card, "Team"),
        // 2) 库存 -1（带保护，避免负数）
        db.prepare("UPDATE teamtoken SET usNum = usNum - 1 WHERE id = ? AND usNum > 0")
          .bind(TeamRES.id),
        // 3) 记录订单
        db.prepare("INSERT INTO teamorder (usEmail, accEmail, Time, State, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(Email, TeamRES.accEmail, TeamRES.Time, "o2", chinaTime),
        // 提交事务
        db.prepare("COMMIT")
      ]
      
      const results = await db.batch(stmts);
      const r1 = results[1], r2 = results[2], r3 = results[3];
      const ok1 = r1?.success && r1?.meta?.changes === 1;
      const ok2 = r2?.success && r2?.meta?.changes === 1;
      const ok3 = r3?.success && r3?.meta?.changes === 1;
      if (ok1 && ok2 && ok3) {
        return json({ ok: true, msg: "已成功发送邀请,请留意邮件",result:result,}, 200); 
      }
      await db.batch([db.prepare("ROLLBACK")]);
      await db.prepare("UPDATE card SET state = ? WHERE cardtext = ? AND type = ?").bind("o3", Card, "Team");
      return json({ ok: false, msg: "非法请求,兑换码已冻结",result:result,}, 200); 
    } catch (error) {
      return json({ ok: false, msg: "服务器异常,请重试或联系客服处理",result:result,}, 200); 
    }
  }else{
    return json({ ok: false, msg: "团队邀请失败,请重试或联系客服处理",result:result,}, 200); 
  }
  
}




//后台验证TOKEN是否符合
