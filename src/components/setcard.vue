<template>
    <div class="grid grid-cols-4 gap-4">
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">生成数量</label>
            <div class="mt-2">
                <input type="number" v-model="SetNum"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
        </div>
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">卡密抬头</label>
            <div class="mt-2">
                <input type="text" v-model="CardTxt" maxlength="4"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
        </div>
        <div class="col-span-1">
            <label class="block text-sm/6 font-medium text-gray-900">卡密类型</label>
            <div class="mt-2 grid">
                <select id="country" v-model="CardType" name="country"
                    autocomplete="country-name"
                    class="col-start-1 row-start-1 w-auto appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                    <option value="Plus">Plus</option>
                    <option value="Team">Team</option>
                </select>
                <ChevronDownIcon
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    aria-hidden="true" />
            </div>
        </div>
        <div class="col-span-1" v-if="CardType=='Team'">
            <label class="block text-sm/6 font-medium text-gray-900">Team售后</label>
            <div class="mt-2 grid">
                <select id="country" v-model="CardTime" name="country"
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
        <div class="col-span-1 flex items-end justify-end gap-x-6">
            <button type="button" @click="SetCard"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">生成订阅卡密</button>
        </div>
        <div class="col-span-5">
            <label class="block text-sm/6 font-medium text-gray-900">生成后的订阅卡密</label>
            <div class="mt-2">
                <textarea readonly :value="Array.isArray(CardList) ? CardList.join('\n') : CardList"
                    placeholder="生成订阅卡密后,点击提交按钮保存至数据库..." rows="6"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">

                </textarea>
            </div>
        </div>
        <div class="col-span-1 flex   gap-x-6">
            <button type="button" @click="Submit"
                class="rounded-md bg-indigo-600 flex gap-2 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <ArrowPathIcon v-if="loading" class="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ loading ? '正在保存中. . .' : '保存订阅卡密' }}</span>
            </button>
        </div>
    </div>


</template>
<script setup>
import { ref } from 'vue';
import { PostApi, randomGroup } from '../util/util';
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
import { ArrowPathIcon } from '@heroicons/vue/24/outline' // 旋转图标
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
//卡密类型
const CardType = ref('Plus')
//卡密开头
const CardTxt = ref('')
//售后时间
const CardTime = ref(null)
//生成的卡密内容
const SetNum = ref(1)
const loading = ref(false)
const CardList = ref([])
const SetCard = ()=>{
    const res =  randomGroup(SetNum.value,CardTxt.value)
    CardList.value = res
}

//选择卡密类型下拉框

const Submit = async () => {
    if (CardList.value.length < 1){
        Toastify({
            text: "请先生成订阅卡密",
            gravity: "top",
            position: "center",
            offset: { y: 350 },
            duration: 2000
        }).showToast()
        return
    }
    if (loading.value) return
    loading.value = true
    const res = await PostApi(JSON.stringify({
        msgoogle:"foradd",
        data:{
            CardList:CardList.value,
            type:CardType.value,
            CardTime:CardTime.value
        }
    }))
    if(res.ok){
        Toastify({
            text: "保存成功",
            gravity: "top",       // top / bottom
            position: "center",   // left / center / right
            offset: { y: 350 },     // 再往下移就调大 y
            duration: 2000
        }).showToast()
    }
    CardList.value = []
    loading.value = false
}
</script>