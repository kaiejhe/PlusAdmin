<!--表格通用组件-->
<!-- BaseTable.vue（最小可用版） -->
<template>
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="flow-root">
                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table class="relative min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" v-for="(item, index) in Namelist" :key="index"
                                        class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        {{ item.label }}
                                    </th>
                                    <th scope="col"
                                        class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        删除复制
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="(item, index) in Itemlist" :key="index">
                                    <td v-for="(Titem, Tindex) in Namelist" :key="Tindex"
                                        class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                                        <slot :name="`cell-${Titem.key}`" :row="item" :value="item[Titem.key]"
                                            :col="Titem">
                                            <!-- 默认渲染（父组件没提供插槽时走这里） -->
                                            {{ item[Titem.key] }}
                                        </slot>
                                    </td>
                                    <td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                                        <div class="flex gap-2">
                                            <button @click="Shanchu(item.id)"
                                                class="inline-flex items-center  rounded-md bg-rose-600 px-2 py-1.5 text-white hover:bg-rose-500">
                                                <TrashIcon class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="Fuzhi(item)"
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
import { TrashIcon,Square2StackIcon  } from '@heroicons/vue/24/outline'
import Tm from '../apijs/Apijs'
const props = defineProps({
    Namelist: { 
        type:Array,
        default:() => []
    },
    Itemlist: { 
        type:Array,
        default:() => []
     },
    idField: { type: String, default: 'id' }
})
const emit = defineEmits(['delete'])

const Shanchu = (id)=>{
    emit('delete', id)
}
const Fuzhi = async(item) => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(item))
        Tm.showMessage("复制成功")
    } catch (err) {
        Tm.showMessage("复制失败")
    }
}
</script>
