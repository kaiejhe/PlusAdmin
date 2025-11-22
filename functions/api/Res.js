//统一返回结构
export const ReturnJSON = (data, status = 200, headers = {}) =>
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
//生成时间戳方法
export function GetTimedays(Time = 0){
  const baseMs = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    ).getTime();
  return baseMs + Time * 24 * 60 * 60 * 1000;
}
//生成时间戳方法二
export function GetTimedaysTime(Time){
  const baseMs = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    ).getTime();
  return baseMs + 30 * 24 * 60 * 60 * 1000;
}


