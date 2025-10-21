
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
  const db = env.TokenD1;
    if (msgoogle === 'login'  && request.method === 'POST') return login(data, db)
    if (msgoogle === 'addlist'  && request.method === 'POST') return addlist(data, db)
    if (msgoogle === 'dellist'  && request.method === 'POST') return dellist(data, db)
    if (msgoogle === 'updlist'  && request.method === 'POST') return updlist(data, db)
    if (msgoogle === 'getlist'  && request.method === 'POST') return getlist(data, db)
    if (msgoogle === 'foradd'  && request.method === 'POST') return foradd(data, db)
    if (msgoogle === 'AdminToken'  && request.method === 'POST') return AdminToken(data, db)
    if (msgoogle === 'TeamEmail'  && request.method === 'POST') return TeamEmail(data, db)
    return json({ ok:false, msg:'当前页面不存在' }, 404)
}

//通用添加数据
async function addlist(request,db) {
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
async function dellist(request,db) {
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
async function updlist(request,db) {
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
async function getlist(request,db) {
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
async function foradd(request,db) {
    const {CardList = [],type,AfterSales=0} = request;
    if(CardList.length < 1 ) return json({ ok: false, msg: "当前页面不存在" }, 404);
    const chinaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).getTime();
    let SqlName = '';
    let Tssss = null;
    let columns = [];
    let placeholders = [];
    if (type === "Plus") {
      SqlName = "PlusCard";
      Tssss = CardList.map((index) => {
        return {
          PlusCard: index,
          PlusCardState: "o1",
          AddTime: chinaTime,
        };
      });
      columns = ["PlusCard", "PlusCardState", "AddTime"];
    }
    if(type==='Team'){
      SqlName = 'TeamCard'
      Tssss = CardList.map((index) => {
        return {
          TeamCard: index,
          TeamCardState: "o1",
          AfterSales:AfterSales,
          AddTime: chinaTime,
        };
      });
       columns = ["TeamCard", "TeamCardState", "AfterSales", "AddTime",];
    }
    
    try {
      const placeholders = columns.map(() => "?").join(", ");
      const query = `INSERT INTO ${SqlName} (${columns.join(", ")}) VALUES (${placeholders})`;
      const statements = Tssss.map((item) => db.prepare(query).bind(...columns.map(col => item[col])));
      await db.batch(statements);
      return json({ ok: true, msg: "添加成功" }, 200);
    } catch (error) {
        return json({ ok: false, msg: "添加失败", error: error.message }, 500);
    }
}


//管理员登录
async function login(request,db) {
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
export async function AdminToken(request, db){
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


//TeamCard有效性检测
export async function Card(request, env){
  const db = env.TokenD1;
  const { Card } = request;
  const CardRes = await db.prepare("SELECT * FROM  TeamCard WHERE TeamCard = ?")
  .bind(Card).first();
  if(CardRes){
    return json({ ok: true, msg: "验证成功"}, 200);
     
  }else{
    return json({ ok: false, msg: "卡密不存在" }, 200);
  }
}

//Team 提交订单并且邀请
export async function TeamEmail(request, db){
  const { Card,Email } = request;
  if(!Card || !Email) return json({ ok: false, msg: "参数异常!",Card:Card,Email:Email }, 200);
  const CardRes = await db.prepare("SELECT * FROM  TeamCard WHERE TeamCard = ?")
  .bind(Card).first();
  if(!CardRes) return json({ ok: false, msg: "兑换码不存在" }, 200);
  if(CardRes.TeamCardState!='o1'){
    if(CardRes.TeamCardState=='o2') return json({ ok: false, msg: "兑换码已使用!" }, 200);
    if(CardRes.TeamCardState=='o3') return json({ ok: false, msg: "兑换码已失效!" }, 200);
    return json({ ok: false, msg: "当前页面不存在",tM:CardRes }, 200); 
  }
  const TeamRES = await db.prepare(`
  SELECT * FROM TeamToken WHERE TeamTokenState = ? AND AfterSales = ? AND NumKey > 0 `).bind("o1", CardRes.AfterSales).first();
  if(!TeamRES) return json({ ok: false, msg: "当前产品库存不足,请联系客服补充库存。" }, 200);
  
  const chinaTime = Math.floor(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).getTime() / 1000);
  const stmts = [
    db.prepare("UPDATE TeamCard SET TeamCardState = ? WHERE TeamCard = ? AND TeamCardState = 'o1'").bind("o2", Card),
    db.prepare("UPDATE TeamToken SET NumKey = NumKey - 1 WHERE id = ? AND NumKey > 0").bind(TeamRES.id),
    db.prepare( `INSERT INTO TeamOrder (OrderTeamID, Order_us_Email, AfterSales, TeamCard, TeamOrderState,TeamNum,AddTime) VALUES (?, ?, ?, ?, ?,?,?)`)
      .bind(TeamRES.OrderTeamID, Email, TeamRES.AfterSales, Card, chinaTime, '01',TeamRES.NumKey,chinaTime)
  ]
  try {
    const ResTm = await db.batch(stmts);
    try {
      const res = await fetch("http://pyapi.my91.my/TeamAdd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: [Email],
          Token: TeamRES.AccToken,
          Accid: TeamRES.TeamID,
          role: "standard-user",
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        await db
          .prepare("UPDATE TeamOrder SET TeamOrderState = ? WHERE TeamCard = ? AND TeamOrderState = '01' AND Order_us_Email = ?")
          .bind("o2", Card,Email)
          .run();
        return json({ ok: true, msg: "成功发送团队邀请", JSON: result }, 200);
      }
    } catch (error) {
        console.log("--执行出问题拉--")
    }
    await db
      .prepare(
        "UPDATE card SET state = ? WHERE cardtext = ? AND type = ? AND state = 'o2'"
      )
      .bind("o1", Card, "Team")
      .run();
    await db
      .prepare("UPDATE teamtoken SET usNum = usNum + 1 WHERE id = ?")
      .bind(TeamRES.id)
      .run();
    await db
      .prepare("UPDATE teamorder SET State = ? WHERE CardTxt = ? ")
      .bind("o3", Card)
      .run();
    return json({ ok: false, msg: "发送邀请请求失败!" }, 200);
  } catch (error) {
    return json({ ok: false, msg: "提交失败,自动回滚!",error:String(error)}, 200);
  }
}

