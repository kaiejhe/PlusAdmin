<template>
    <loading Name="正在修改" v-if="log"></loading>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table class="relative min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col"
                                    class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">订阅卡密
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">当前状态
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">创建时间
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">操作
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="(item,index) in CardList" :key="index">
                                <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                                    {{ item.cardtext }}</td>
                                <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <div class="mt-2 grid">
                                        <select id="country" @change="Getselect(item.state,item)" v-model="item.state" name="country"
                                            autocomplete="country-name"
                                            class="col-start-1 row-start-1 w-auto appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                            <option value="o1">待使用</option>
                                            <option value="o2">已使用</option>
                                            <option value="o3">已废弃</option>
                                        </select>
                                        <ChevronDownIcon
                                            class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                            aria-hidden="true" />
                                    </div>
                                </td>
                                <td class="px-3 py-4 text-xs whitespace-nowrap text-gray-500">
                                    <div class="grid gap-1">
                                        <span class="">2028-08-07 19:30:19</span>
                                        <span class="">2028-08-07 19:36:19</span>
                                    </div>
                                </td>
                                <td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                                    <div class="flex gap-2">
                                        <button
                                            class="inline-flex items-center  rounded-md bg-rose-600 px-2 py-1.5 text-white hover:bg-rose-500">
                                            <TrashIcon class="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <button
                                            class="inline-flex items-center  rounded-md bg-indigo-600 px-2 py-1.5 text-white hover:bg-indigo-500">
                                            <Square2StackIcon class="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import { TrashIcon,Square2StackIcon  } from '@heroicons/vue/24/outline'
import loading from './loading.vue'
import { ref } from 'vue'
import { PostApi } from '../util/util'
const log = ref(false)
const Pops = defineProps({
    CardList: {
        type: Array,
        default: () => []
    }
})

//获取单选状态
const Getselect = async(ES,MS)=>{
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"updlist",
        data:{
            table:"card",
            id:MS.id,
            updates:{
                state:ES,
                usaeged_at:Date.now()
            }
        }
    })
    const res =  await PostApi(JSONDATA)
    log.value = false
}
</script>