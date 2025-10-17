<template>
    <loading :Name="logName" v-if="log"></loading>
    <div class="mx-auto w-full max-w-[750px] p-4">
        <HeaderView title="卡密管理" :fanhui="true"></HeaderView>
        <TabListView :listName="TabNameLs" :Selected="Tabinde" @tabindex="TabText"></TabListView>
        <div v-if="Tabinde<3" class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
            <BaseTable :Namelist="ColumnName" :Itemlist="Itemlist" @delete="dellist">
                <template #cell-state="{ row }">
                    <div class="relative inline-block">
                        <select v-model="row.state" @change="Upitem(row)" class="appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300
             focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
                            <option value="o1">待使用</option>
                            <option value="o2">已使用</option>
                            <option value="o3">已废弃</option>
                        </select>
                        <ChevronDownIcon
                            class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                            aria-hidden="true" />
                    </div>
                </template>
                <template #cell-type="{ row }">
                    <div class="flex gap-1">
                        <span>{{ row.type }}</span>
                        <span v-if="row.type=='Team'">| {{ row.CardTime }}/天</span>
                    </div>
                </template>
                <template #cell-created_at="{ value }">
                    {{ GetTime(value) }}
                </template>
            </BaseTable>
            <Pagination v-model:page="Page" @change="onPageChange" :total="total" :pageSize="PageSise"></Pagination>
        </div>
        <div v-else class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
            <Setcard></Setcard>      
        </div>
    </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { onMounted, ref } from 'vue'
import BaseTable from '../components/BaseTable.vue'
import TabListView from '../components/TabListView.vue'
import { PostApi,GetTime } from '../util/util'
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import loading from '../components/loading.vue'
import Pagination from '../components/Pagination.vue'
import Tm from '../apijs/Apijs'
import Setcard from '../components/setcard.vue'
const logName = ref("正在查询")      //加载提示词
const total = ref(0)                //数据总数量
const Page = ref(1)                 //当前第几页
const PageSise = ref(5)             //每页多少条
const Tabinde = ref(0)              //当前选中分栏
const Itemlist = ref([])
const log = ref(true)
const TabNameLs = [
  { key: 'o1', label: '未使用' },
  { key: 'o2',    label: '已使用' },
  { key: 'o3',  label: '已废弃' },
  { key: 'all',     label: '创建卡密' },
]
//列表名称数据绑定
const ColumnName = [
    { key: 'cardtext', label: '订阅卡密', cellClass: 'text-center whitespace-nowrap' },
    { key: 'state', label: '当前状态', cellClass: 'text-center whitespace-nowrap' },
    { key: 'type', label: '卡密类型', cellClass: 'text-center whitespace-nowrap' },
    { key: 'created_at', label: '创建时间', cellClass: 'text-center whitespace-nowrap' },
]


//获取当前选中的分栏
const TabText = (ind)=>{
    Tabinde.value = ind
    if(Tabinde.value<3){
        GetList()
    }
}


//监听分页
const onPageChange = (Tm)=>{
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"card",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{state:TabNameLs[Tabinde.value].key}
        }
    })
    GetList(JSONDATA)
}

const GetList = async()=>{
    logName.value = "正在查询"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"card",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{state:TabNameLs[Tabinde.value].key}
        }
    })
    const res = await PostApi(JSONDATA)
    if(res.ok){
        Itemlist.value = res.data
        total.value = res.total
    }
    setTimeout(()=>{
        log.value = false
    },500)
    
}
onMounted(()=>{
    GetList()
})

//删除数据
const dellist = async(tr)=>{
    const mpdal = await Tm.showModal()
    if(mpdal.cancel){
        console.log("", mpdal)
        return
    }
    logName.value = "正在删除"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"dellist",
        data:{
            table:"card",
            id:tr
        }
    })
    const res = await PostApi(JSONDATA)
    if(res.ok){
       await GetList()
    }
    setTimeout(() => {
        log.value = false
        Tm.showMessage({message:res.msg})
    }, 500);
}
//删除数据

//修改数据状态
const Upitem = async (item)=>{
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"updlist",
        data:{
            table:"card",
            id:item.id,
            updates:{state:item.state}
        }
    })
    const res = await PostApi(JSONDATA)
    if(res.ok){
      await  GetList()
    }
    setTimeout(() => {
        log.value = false
        Tm.showMessage({message:res.msg})
    }, 500);
}

</script>
