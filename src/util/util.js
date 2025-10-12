import { ref } from "vue";
const API_BASE ="https://plusadmin.pages.dev/api/functions"

//批量生成订阅卡密
export function randomGroup(num = 1){
    const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const group = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
    const make = () => `PLUS-${group()}-${group()}-${group()}`;
    const set = new Set();
    while (set.size < num) set.add(make());
    console.log("222", set)
    return [...set]
}
//网络请求接口-POST
export async function PostApi(body){
  return new Promise((resizeBy,err)=>{
    fetch(API_BASE,{
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body,
    }).then(async(res)=>{
      const Tm = await res.json()
      resizeBy(Tm)
    }).catch((err)=>{
        err(false)
    })
  })
}
