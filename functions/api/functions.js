"use strict";

/**
 * Cloudflare Pages Functions handler for Team Plus Admin.
 * All requests hit `/api/functions` and are routed by the `msgoogle` field.
 */

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const OK = 200;

const ACTION_HANDLERS = {
  login,
  addlist,
  dellist,
  updlist,
  getlist,
  foradd,
  Card,
  AdminToken,
  TeamEmail,
};

const CARD_STATE_AVAILABLE = "o1";
const CARD_STATE_CONSUMED = "o2";
const CARD_STATE_INVALID = "o3";

const TEAM_TOKEN_STATE_ACTIVE = "o1";
const TEAM_ORDER_STATE_PENDING = "o1";
const TEAM_ORDER_STATE_FINISHED = "o2";

const PLUS_ORDER_STATE_PENDING = "o1";

function json(body, status = OK, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...BASE_HEADERS,
      ...headers,
    },
  });
}

async function readRequestBody(request) {
  try {
    const payload = await request.json();
    if (typeof payload === "object" && payload !== null) {
      return payload;
    }
  } catch (error) {
    // fall through – invalid JSON handled by caller
  }
  return {};
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { msgoogle, data = {} } = await readRequestBody(request);

  if (!msgoogle) {
    return json({ ok: false, msg: "缺少 msgoogle 参数" }, 400);
  }

  const handler = ACTION_HANDLERS[msgoogle];
  if (!handler) {
    return json({ ok: false, msg: "当前页面不存在" }, 404);
  }

  const db = env?.TokenD1;
  if (!db) {
    return json({ ok: false, msg: "数据库未初始化" }, 500);
  }

  try {
    return await handler(data, db, context);
  } catch (error) {
    console.error(`[${msgoogle}] handler error`, error);
    return json({ ok: false, msg: "服务器内部错误", error: String(error) }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: BASE_HEADERS,
  });
}

async function addlist(request, db) {
  const { table, data } = request;
  if (!table || !data) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const columns = await getTableMeta(db, table);
  const validKeys = Object.keys(data).filter((key) => columns.includes(key));

  if (!validKeys.length) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const placeholders = validKeys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${validKeys.join(", ")}) VALUES (${placeholders})`;
  const values = validKeys.map((key) => data[key]);

  try {
    const res = await db.prepare(sql).bind(...values).run();
    return json({ ok: true, msg: "新增成功", id: res.meta.last_row_id }, 201);
  } catch (error) {
    return json({ ok: false, msg: "添加数据失败", error: String(error) }, 500);
  }
}

async function dellist(request, db) {
  const { table, id } = request;
  if (!table || !id) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const sql = `DELETE FROM ${table} WHERE id = ?`;
  try {
    const res = await db.prepare(sql).bind(id).run();
    if (res.success) {
      return json({ ok: true, msg: "删除成功" }, OK);
    }
    return json({ ok: false, msg: "删除失败" }, 404);
  } catch (error) {
    return json({ ok: false, msg: "删除数据失败", error: String(error) }, 500);
  }
}

async function updlist(request, db) {
  const { table, updates, id } = request;
  if (!table || !updates || !id) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const columns = await getTableMeta(db, table);
  const validKeys = Object.keys(updates).filter((key) => columns.includes(key));

  if (!validKeys.length) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const setClause = validKeys.map((key) => `${key} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  const values = validKeys.map((key) => updates[key]);

  try {
    const res = await db.prepare(sql).bind(...values, id).run();
    if (res.success) {
      return json({ ok: true, msg: "更新成功" }, OK);
    }
    return json({ ok: false, msg: "更新失败" }, 404);
  } catch (error) {
    return json({ ok: false, msg: "更新数据失败", error: String(error) }, 500);
  }
}

async function getlist(request, db) {
  const { table, filters = {}, page = 1, pageSize = 10 } = request;

  if (!table) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const clauses = [];
  const values = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    clauses.push(`${key} = ?`);
    values.push(value);
  });

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  const sql = `SELECT * FROM ${table} ${whereClause} LIMIT ?, ?`;
  const countSql = `SELECT COUNT(*) AS total FROM ${table} ${whereClause}`;

  try {
    const [{ total = 0 } = {}] = await db.prepare(countSql).bind(...values).all()
      .then((res) => res.results || []);
    const list = await db
      .prepare(sql)
      .bind(...values, offset, Number(pageSize))
      .all();

    return json({
      ok: true,
      data: list?.results || [],
      total,
      msg: "查询成功",
    });
  } catch (error) {
    return json({ ok: false, msg: "查询失败", error: String(error) }, 500);
  }
}

async function foradd(request, db) {
  const { CardList = [], type, AfterSales = 0 } = request;

  if (!CardList.length) {
    return json({ ok: false, msg: "当前页面不存在" }, 404);
  }

  const chinaTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  ).getTime();

  let tableName = "";
  let columns = [];
  let rows = [];

  if (type === "Plus") {
    tableName = "PlusCard";
    columns = ["PlusCard", "PlusCardState", "AddTime"];
    rows = CardList.map((card) => ({
      PlusCard: card,
      PlusCardState: CARD_STATE_AVAILABLE,
      AddTime: chinaTime,
    }));
  } else if (type === "Team") {
    tableName = "TeamCard";
    columns = ["TeamCard", "TeamCardState", "AfterSales", "AddTime"];
    rows = CardList.map((card) => ({
      TeamCard: card,
      TeamCardState: CARD_STATE_AVAILABLE,
      AfterSales,
      AddTime: chinaTime,
    }));
  } else {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

  try {
    const statements = rows.map((row) =>
      db.prepare(sql).bind(...columns.map((col) => row[col])),
    );
    await db.batch(statements);
    return json({ ok: true, msg: "添加成功" }, OK);
  } catch (error) {
    return json({ ok: false, msg: "添加失败", error: String(error) }, 500);
  }
}

async function login(request, db) {
  if (!db) {
    return json({ ok: false, msg: "服务器异常" }, 500);
  }

  const { username, password } = request;
  if (!username || !password) {
    return json({ ok: false, msg: "管理员账号密码不能为空" }, 400);
  }

  try {
    const probe = await db.prepare("SELECT 1 AS ok").first();
    if (!probe) {
      return json({ ok: false, msg: "D1 探活失败" }, 500);
    }

    const user = await db
      .prepare(
        "SELECT username, password FROM admin WHERE username = ? AND password = ?",
      )
      .bind(username, password)
      .first();

    if (!user) {
      return json({ ok: false, msg: "用户名或密码错误" }, 401);
    }

    return json({ ok: true, msg: "登录成功" }, OK);
  } catch (error) {
    return json({ ok: false, msg: "Server Error", error: String(error) }, 500);
  }
}

async function AdminToken(request, db) {
  const { Token, Cardcode } = request;
  if (!Token || !Cardcode) {
    return json({ ok: false, msg: "当前页面不存在" }, 400);
  }

  try {
    const existing = await db
      .prepare(
        "SELECT id FROM plusorder WHERE AccessToken = ? AND State = ? LIMIT 1",
      )
      .bind(Token, PLUS_ORDER_STATE_PENDING)
      .first();

    if (existing) {
      return json({ ok: false, msg: "正在订阅中,请勿重复提交" }, OK);
    }

    const payload = parseJwtPayload(Token);
    if (!payload.email || !payload.exp) {
      return json({ ok: false, msg: "JSON参数错误" }, OK);
    }

    if (Math.floor(Date.now() / 1000) > payload.exp) {
      return json({ ok: false, msg: "JSON参数已过期" }, OK);
    }

    const orderId = generateOrderId();
    const timestamp = Math.floor(Date.now() / 1000);

    const result = await db
      .prepare(
        `INSERT INTO plusorder (usOrder, Email, Cardkey, AccessToken, State, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        orderId,
        payload.email,
        Cardcode,
        Token,
        PLUS_ORDER_STATE_PENDING,
        timestamp,
      )
      .run();

    if (result.meta.last_row_id < 1) {
      return json({ ok: false, msg: "Plus订阅任务提交失败" }, OK);
    }

    return json({ ok: true, msg: "Plus订阅任务提交成功" }, OK);
  } catch (error) {
    return json({ ok: false, msg: "Plus订阅任务提交失败", error: String(error) }, 500);
  }
}

async function TeamEmail(request, db) {
  const { Card, Email } = request;

  if (!Card || !Email) {
    return json({ ok: false, msg: "参数异常", Card, Email }, OK);
  }

  const cardRecord = await db
    .prepare("SELECT * FROM TeamCard WHERE TeamCard = ?")
    .bind(Card)
    .first();

  if (!cardRecord) {
    return json({ ok: false, msg: "兑换码不存在" }, OK);
  }

  if (cardRecord.TeamCardState !== CARD_STATE_AVAILABLE) {
    if (cardRecord.TeamCardState === CARD_STATE_CONSUMED) {
      return json({ ok: false, msg: "兑换码已使用" }, OK);
    }
    if (cardRecord.TeamCardState === CARD_STATE_INVALID) {
      return json({ ok: false, msg: "兑换码已失效" }, OK);
    }
    return json({ ok: false, msg: "当前页面不存在" }, OK);
  }

  const teamRecord = await db
    .prepare(
      "SELECT * FROM TeamToken WHERE TeamTokenState = ? AND AfterSales = ? AND NumKey > 0",
    )
    .bind(TEAM_TOKEN_STATE_ACTIVE, cardRecord.AfterSales)
    .first();

  if (!teamRecord) {
    return json({ ok: false, msg: "当前产品库存不足,请联系客服补充库存。" }, OK);
  }

  const shanghaiTimestamp = getShanghaiUnixSeconds();
  const statements = [
    db
      .prepare(
        "UPDATE TeamCard SET TeamCardState = ? WHERE TeamCard = ? AND TeamCardState = ?",
      )
      .bind(CARD_STATE_CONSUMED, Card, CARD_STATE_AVAILABLE),
    db
      .prepare(
        "UPDATE TeamToken SET NumKey = NumKey - 1 WHERE id = ? AND NumKey > 0",
      )
      .bind(teamRecord.id),
    db
      .prepare(
        `INSERT INTO TeamOrder (OrderTeamID, Order_us_Email, AfterSales, TeamCard, TeamOrderState, TeamNum, AddTime)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        teamRecord.TeamID,
        Email,
        teamRecord.AfterSales,
        Card,
        TEAM_ORDER_STATE_PENDING,
        teamRecord.NumKey,
        shanghaiTimestamp,
      ),
  ];

  try {
    await db.batch(statements);
  } catch (error) {
    return json({ ok: false, msg: "提交失败,自动回滚!", error: String(error) }, OK);
  }

  const inviteResult = await sendTeamInvite({
    Email,
    token: teamRecord.AccToken,
    accountId: teamRecord.TeamID,
  });

  if (inviteResult?.status === "success") {
    await db
      .prepare(
        "UPDATE TeamOrder SET TeamOrderState = ?, UpdTime = ? WHERE TeamCard = ? AND TeamOrderState = ? AND Order_us_Email = ?",
      )
      .bind(TEAM_ORDER_STATE_FINISHED, shanghaiTimestamp, Card, TEAM_ORDER_STATE_PENDING, Email)
      .run();
    return json({ ok: true, msg: "成功发送团队邀请", JSON: inviteResult }, OK);
  }

  // 失败时尝试回滚一些业务状态
  await db
    .prepare(
      "UPDATE TeamToken SET NumKey = NumKey + 1 WHERE id = ?",
    )
    .bind(teamRecord.id)
    .run()
    .catch(() => {});

  await db
    .prepare(
      "UPDATE TeamCard SET TeamCardState = ? WHERE TeamCard = ? AND TeamCardState = ?",
    )
    .bind(CARD_STATE_AVAILABLE, Card, CARD_STATE_CONSUMED)
    .run()
    .catch(() => {});

  await db
    .prepare(
      "DELETE FROM TeamOrder WHERE TeamCard = ? AND Order_us_Email = ? AND TeamOrderState = ?",
    )
    .bind(Card, Email, TEAM_ORDER_STATE_PENDING)
    .run()
    .catch(() => {});

  return json({ ok: false, msg: "发送邀请请求失败" }, OK);
}

async function Card(request, db) {
  const { Card: cardValue } = request;
  if (!cardValue) {
    return json({ ok: false, msg: "卡密缺失" }, 400);
  }

  const record = await db
    .prepare("SELECT * FROM TeamCard WHERE TeamCard = ?")
    .bind(cardValue)
    .first();

  if (!record) {
    return json({ ok: false, msg: "卡密不存在" }, OK);
  }

  return json({ ok: true, msg: "验证成功" }, OK);
}

async function getTableMeta(db, table) {
  const { results = [] } = await db.prepare(`PRAGMA table_info(${table})`).all();
  return results.map((col) => col.name);
}

function generateOrderId() {
  const randomPart = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}`;
}

function parseJwtPayload(token) {
  try {
    const [, payload = ""] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, "=");
    const jsonString = new TextDecoder().decode(
      Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)),
    );
    const parsed = JSON.parse(jsonString);
    return {
      email: parsed?.["https://api.openai.com/profile"]?.email || "",
      exp: parsed?.exp,
    };
  } catch (error) {
    return {};
  }
}

function getShanghaiUnixSeconds() {
  return Math.floor(
    new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
    ).getTime() / 1000,
  );
}

async function sendTeamInvite({ Email, token, accountId }) {
  try {
    const res = await fetch("http://pyapi.my91.my/TeamAdd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: [Email],
        Token: token,
        Accid: accountId,
        role: "standard-user",
      }),
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("发送邀请失败", error);
    return null;
  }
}
