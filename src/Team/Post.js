// const API_BASE ="https://plusadmin.pages.dev/api/functions"
const API_BASE = window.location.origin + '/api/functions'
//批量生成订阅卡密
export function RandomGroup(num = 1,Text){
    const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const group = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
    const make = () => `${Text}-${group()}-${group()}-${group()}`;
    const set = new Set();
    while (set.size < num) set.add(make());
    console.log("2222", set)
    return [...set]
}

//时间戳转换成日期时间
export function GetTime(Time){
  const date = new Date(Time);
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${Y}-${M}-${D} ${h}:${m}`;
}

//网络请求接口-POST
export async function PostApi(body){
  return new Promise((resolve, reject) => {
    fetch(API_BASE,{
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body,
    })
      .then(async (res) => {
        const data = await res.json()
        resolve(data)
      })
      .catch(() => {
        reject(new Error("network_error"))
      })
  })
}