<template>
    <div class="grid grid-cols-2 gap-4">
        <div class="col-span-1">
            <label  class="block text-sm/6 font-medium text-gray-900">生成数量</label>
            <div class="mt-2">
                <input type="number" v-model="SetNum"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
        </div>
        <div class="col-span-1 flex items-end justify-end gap-x-6">
            <button type="button" @click="SetCard"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">生成订阅卡密</button>
        </div>
        <div class="col-span-2">
            <label class="block text-sm/6 font-medium text-gray-900">生成后的订阅卡密</label>
            <div class="mt-2">
                <textarea readonly :value="Array.isArray(CardList) ? CardList.join('\n') : CardList" placeholder="生成订阅卡密后,点击提交按钮保存至数据库..." rows="6"
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                
                </textarea>
            </div>
        </div>
        <div class="col-span-1 flex   gap-x-6">
            <button type="button" @click="Submit"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">保存订阅卡密</button>
        </div>
    </div>


</template>
<script setup>
import { ref } from 'vue';
import { PostApi, randomGroup } from '../util/util';

const SetNum = ref(1)
const CardList = ref([])
const SetCard = ()=>{
    const res =  randomGroup(SetNum.value)
    CardList.value = res
}
const Submit = async () => {
    if (CardList.value.length < 1) return alert("请先生成订阅卡密")
    const res = await PostApi(JSON.stringify({
        msgoogle:"foradd",
        data:{
            cardtext:CardList.value
        }
    }))
}
</script>