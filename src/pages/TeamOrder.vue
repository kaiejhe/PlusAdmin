<!-- YourPage.vue -->
<template>
    <loading :Name="logName" v-if="log"></loading>
    <div class="mx-auto w-full max-w-[850px] p-4">
        <HeaderView title="Team邀请管理" :fanhui="true"></HeaderView>
        <TabListView :listName="TabNameLs" :Selected="Tabinde" @tabindex="TabText"></TabListView>
        <div v-if="Tabinde < 3" class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
            <BaseTable :Namelist="ColumnName" :Itemlist="Itemlist" @delete="dellist">
                <template #cell-State="{ row }">
                    <div class="relative inline-block">
                        <select v-model="row.State" @change="Upitem(row)" class="appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300
             focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
                            <option value="o1">等待邀请</option>
                            <option value="o2">邀请成功</option>
                            <option value="o3">邀请失败</option>
                        </select>
                        <ChevronDownIcon
                            class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                            aria-hidden="true" />
                    </div>
                </template>
                <template #cell-created_at="{ value }">
                    {{ GetTime(value) }}
                </template>
            </BaseTable>
            <Pagination v-model:page="Page" @change="onPageChange" :total="total" :pageSize="PageSise"></Pagination>
        </div>
    </div>

</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import BaseTable from '../components/BaseTable.vue'
import HeaderView from '../components/headerView.vue'
import TabListView from '../components/TabListView.vue'
import Pagination from '../components/Pagination.vue'
import { onMounted, ref } from 'vue'
import { GetTime, PostApi } from '../util/util'
import Loading from '../components/loading.vue'
const total = ref(0)            //数据总数量
const Page = ref(1)             //默认第几页
const PageSise = ref(5)         //每页几条数据
const Tabinde = ref(0)          //分栏当前选中项
const logName = ref('')         //加载中提示词
const log = ref(false)          //加载框状态
const Itemlist = ref([])        //数据列表
const TabNameLs = [             //分栏数组
  { key: 'o1', label: '等待邀请' },
  { key: 'o2',    label: '邀请完成' },
  { key: 'o3',  label: '邀请失败' },
  { key: 'all',     label: '提交Token' },
]


const ColumnName = [
    { key: 'usEmail', label: '用户邮箱', cellClass: 'text-center whitespace-nowrap' },
    { key: 'accEmail', label: '团队邮箱', cellClass: 'text-center whitespace-nowrap' },
    { key: 'Time', label: '售后时间', cellClass: 'text-center whitespace-nowrap' },
    { key: 'State', label: '邀请状态' },        // 用插槽
    { key: 'created_at', label: '创建时间' },         // 用插槽
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
            table:"teamorder",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{state:TabNameLs[Tabinde.value].key}
        }
    })
    GetList(JSONDATA)
}


//查询订单数据接口
const GetList = async()=>{
    logName.value = "正在查询"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"teamorder",
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

//修改状态
const Upitem = async(item)=>{
    logName.value = "正在修改"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle: "updlist",
        data: {
            table: "teamorder",
            id: item.id,
            updates: { State: item.State }
        }
    })
    const res = await PostApi(JSONDATA)
    if (res.ok) {
        await GetList()
    }
    setTimeout(() => {
        log.value = false
        Tm.showMessage({ message: res.msg })
    }, 500);
}
//删除数据
const dellist = async(id)=>{
    console.log("-------------", id)
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
            table:"teamorder",
            id:id
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
onMounted(()=>{
    GetList()
})

</script>
