<template>
  <loading :Name="logName" v-if="log"></loading>
  <div class="mx-auto w-full max-w-[750px] p-4">
    <HeaderView title="Plus订阅管理" :fanhui="true" />
    <TabListView :listName="TabNameLs" :Selected="Tabinde" @tabindex="TabText"></TabListView>
    <div v-if="Tabinde < 3" class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
      <BaseTable :Namelist="ColumnName" :Itemlist="Itemlist" @delete="dellist">
        <template #cell-State="{ row }">
          <div class="relative inline-block">
            <select v-model="row.State" @change="Upitem(row)" class="appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300
             focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
              <option value="o1">等待订阅</option>
              <option value="o2">订阅完成</option>
              <option value="o3">订阅失败</option>
            </select>
            <ChevronDownIcon class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              aria-hidden="true" />
          </div>
        </template>
        <template #cell-created_at="{ row }">
          <div class="grid ">
            <span>{{ GetTime(row.created_at) }}</span>
            <span v-if="row.Usedat">{{ GetTime(row.usaeged_at) }}</span>
          </div>
        </template>
        <template #cell-Cardkey="{ row }">
          <div class="grid ">
            <span>{{ row.usOrder }}</span>
            <span>{{row.Cardkey}}</span>
          </div>
        </template>
      </BaseTable>
      <Pagination v-model:page="Page" @change="onPageChange" :total="total" :pageSize="PageSise"></Pagination>
    </div>
    <div v-else class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
      <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">请上传完整的JSON格式</p>
      <div class="mt-4">
        <textarea 
          rows="8"
          v-model="TextArea"
          placeholder="请在此处粘贴完整的 JSON 数据..."
          class="block w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/60 dark:text-white dark:border-slate-600 dark:placeholder-slate-500 dark:focus:ring-indigo-400">
        </textarea>
      </div>
      <div class="mt-4 flex justify-end gap-3">
          <button
            type="button"
            @click="getElementById"
            class="rounded-md px-5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300 dark:text-slate-200 dark:hover:bg-white/10 dark:ring-white/20">
             清空 
          </button>
          <button
            type="button"
            @click="SetPostApi"
            class="rounded-md bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            提交
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import { onMounted, ref } from 'vue'
import TabListView from '../components/TabListView.vue'
import BaseTable from '../components/BaseTable.vue'
import { GetTime, PostApi } from '../util/util'
import loading from '../components/loading.vue'
import Pagination from '../components/Pagination.vue'
import Tm from '../apijs/Apijs'
const logName = ref("正在查询")
const total = ref(0) //总数量
const Page = ref(1) //分页默认
const PageSise = ref(5)
const Tabinde = ref(0)
const Itemlist = ref([])
const log = ref(true)
const TextArea = ref('')
const TabNameLs = [
  { key: 'o1', label: '等待订阅' },
  { key: 'o2',    label: '订阅完成' },
  { key: 'o3',  label: '订阅失败' },
  { key: 'all',     label: '提交Token' },
]

//清空输入框
const getElementById = ()=>{
  TextArea.value = ''
}

//获取当前选中的分栏
const TabText = (ind)=>{
    Tabinde.value = ind
    if(Tabinde.value<3){
        GetList()
    }
}

const ColumnName = [
    { key: 'Cardkey', label: '订单|卡密', cellClass: 'text-center whitespace-nowrap' },
    { key: 'Email', label: 'Email', cellClass: 'text-center whitespace-nowrap' },
    { key: 'State', label: '订阅进度', cellClass: 'text-center whitespace-nowrap' },
    { key: 'created_at', label: '创建时间', cellClass: 'text-center whitespace-nowrap'  }
]

//提交Token订阅
const SetPostApi = async()=>{
  const match = TextArea.value.match(/"accessToken":"([\s\S]*?)"/);
  if(!match || !match[1]){
    Tm.showMessage("请输入完整的JSON参数")
    return 
  }
  log.value = true
  logName.value = "正在提交"
  const JSONDATA = JSON.stringify({
    msgoogle:"AdminToken",
    data:{
      Token:match[1],
      Cardcode:"PLUX-XXXX-XXXX-ADMM"
    }
  })
  const res = await PostApi(JSONDATA)
  log.value = false
  Tm.showMessage(res.msg)
  
}
//修改状态
const Upitem = async(item)=>{
    logName.value = "正在修改"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle: "updlist",
        data: {
            table: "plusorder",
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
//监听分页
const onPageChange = (Tm)=>{
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"plusorder",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{State:TabNameLs[Tabinde.value].key}
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
            table:"plusorder",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{State:TabNameLs[Tabinde.value].key}
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
            table:"plusorder",
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
//修改数据状态
const updlist = async (item)=>{
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"updlist",
        data:{
            table:"plusorder",
            id:item.id,
            updates:{State:item.State}
        }
    })
    console.log("---------", JSONDATA)
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
