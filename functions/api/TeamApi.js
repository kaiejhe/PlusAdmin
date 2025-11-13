//Team发送进团邀请邮件 "standard-user"
import { ReturnJSON } from "./Res.js";
export async function TeamApiPost(data) {
  const { Email, AccToken, Role, TeamID } = data;
  if (!Email || !AccToken || !Role || !TeamID) return ReturnJSON({ ok: false, msg: "请传递完整参数" }, 200);
  const JsonData = JSON.stringify({
    Email: Email,
    Token: AccToken,
    Accid: TeamID,
    role: Role,
  });
  try {
    const result = await fetch("http://pyapi.my91.my/TeamAdd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JsonData,
    });
    const res = await result.json();
    if (res.status === "success") {
      return ReturnJSON({ ok: true, msg: "邀请成功", data: res }, 200);
    } else {
      return ReturnJSON({ ok: false, msg: "邀请失败", data: res }, 200);
    }
  } catch (error) {
    return ReturnJSON(
      { ok: false, msg: "发送邀请失败,请检查服务器环境是否正常", data: error },
      200
    );
  }
}

//查询团队成员接口
export async function GetTeamApi(data) {
  const URL = "https://pyapi.my91.my/TeamGet";
  const { AccToken, TeamID } = data;
  if(!AccToken||!TeamID) return ReturnJSON({ ok: false, msg: "请传递完整参数" }, 200);
  const JsonData = JSON.stringify({
    Token: AccToken,
    Accid: TeamID
  });
  try {
    const result = await fetch("http://pyapi.my91.my/TeamAdd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JsonData,
    });
    return ReturnJSON({ ok: true, msg: "查询成功", data: result }, 200);
  } catch (error) {
    return ReturnJSON({ ok: true, msg: "查询出错", data: error }, 200);
  }
}
