<template>
    <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">当前状态</label>
            <div class="mt-2 grid">
                <select v-model="State"
                    autocomplete="country-name"
                    class="col-start-1 row-start-1 w-auto appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                    <option value="o1">正常</option>
                    <option value="o2">禁用</option>
                </select>
                <ChevronDownIcon
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    aria-hidden="true" />
            </div>
        </div>
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">售后时间</label>
            <div class="mt-2 grid">
                <select v-model="CardTime"
                    autocomplete="country-name"
                    class="col-start-1 row-start-1 w-auto appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                    <option :value="1">1天</option>
                    <option :value="2">2天</option>
                    <option :value="7">7天</option>
                    <option :value="15">15天</option>
                    <option :value="30">30天</option>
                </select>
                <ChevronDownIcon
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    aria-hidden="true" />
            </div>
        </div>
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">坑位数量</label>
            <div class="mt-2">
                <input type="number" v-model="usNum"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
        </div>
        <div class="col-span-5">
            <label class="block text-sm/6 font-medium text-gray-900">请提交AccToken完整参数信息</label>
            <div class="mt-2">
                <textarea 
                    v-model="AccToken"
                    placeholder="请提交AccToken完整参数信息JSON格式..." rows="6"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                </textarea>
            </div>
        </div>
        <div class="col-span-1 flex   gap-x-6">
            <button type="button" @click="AddToken"
                class="rounded-md bg-indigo-600 flex gap-2 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <ArrowPathIcon v-if="loading" class="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ loading ? '正在保存中. . .' : '保存订阅卡密' }}</span>
            </button>
        </div>
    </div>


</template>
<script setup>
import { ref } from 'vue';
import { PostApi } from '../util/util';
import 'toastify-js/src/toastify.css'
import { ArrowPathIcon } from '@heroicons/vue/24/outline' // 旋转图标
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import Tm from '../apijs/Apijs';
const loading = ref(false)
const State = ref('o1')     //当前状态
const CardTime = ref(30)    //售后时间
const usNum = ref(5)        //坑位数量
const AccToken = ref('')    //AccToken



const AddToken = async()=>{
    if(AccToken.value.length<1500) return Tm.showMessage("AccToken参数异常")
    const parsed = JSON.parse(AccToken.value);
    if (Object.prototype.toString.call(parsed) != '[object Object]') return Tm.showMessage("JSON格式错误")
    const res = await PostApi(JSON.stringify({
        msgoogle:"addlist",
        data:{
            table:"teamtoken",
            data:{
                Email:parsed.user.email,
                Time:CardTime.value,
                usNum:usNum.value,
                State:State.value,
                AccToken:parsed.accessToken,
                TeamID:parsed.account.id,
                created_at:new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })).getTime()
            }
        }
    }))
    console.log("res", res)
}





</script>