<template>
  <loading :Name="logName" v-if="log"></loading>
  <div class="mx-auto w-full max-w-[750px] p-4">
    <HeaderView title="订阅管理" :fanhui="true" />
    <div class="mt-4">
      <TabGroup :selectedIndex="selectedIndex">
        <TabList class="flex w-full rounded-xl bg-white ring-1 ring-slate-200 p-1 shadow-sm">
          <Tab v-for="(cat, idx) in categories" :key="cat.key" as="template" v-slot="{ selected }">
            <button @click="SetPy(idx, cat)" class="flex-1 basis-0 text-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition
                    focus:outline-none"
              :class="selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'">
              {{ cat.label }}
            </button>
          </Tab>
        </TabList>
        <div class="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
          <div v-if="selectedIndex<3">
            <PlusTokenlist :CardList="Cardlist" @dellist="dellist" @updlist="updlist"></PlusTokenlist>
            <Pagination v-model:page="Page" @change="onPageChange" :total="total" :pageSize="PageSise"></Pagination>
          </div>
          <div class="" v-else>
              <section >
                <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">请上传完整的JSON格式</p>
                <div class="mt-4">
                  <div class="mt-2">
                    <textarea rows="8" v-model="TextArea" placeholder="请在此处粘贴完整的 JSON 数据..."
                      class="block w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 placeholder-slate-400
                   focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                   dark:bg-slate-900/60 dark:text-white dark:border-slate-600 dark:placeholder-slate-500 dark:focus:ring-indigo-400"></textarea>
                  </div>

                  <div class="mt-4 flex justify-end gap-3">
                    <button type="button" class="rounded-md px-5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300
                   dark:text-slate-200 dark:hover:bg-white/10 dark:ring-white/20"
                      @click="getElementById">
                      清空
                    </button>
                    <button type="button" @click="SetPostApi" class="rounded-md bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                      提交
                    </button>
                  </div>
                </div>
              </section>
          </div>
        </div>
      </TabGroup>
    </div>
  </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { onMounted, ref } from 'vue'
import { TabGroup, TabList, Tab, } from '@headlessui/vue'
import PlusTokenlist from '../components/PlusTokenlist.vue'
import { PostApi } from '../util/util'
import loading from '../components/loading.vue'
import Pagination from '../components/Pagination.vue'
import Tm from '../apijs/Apijs'
const logName = ref("正在查询")
const total = ref(0) //总数量
const Page = ref(1) //分页默认
const PageSise = ref(5)
const selectedIndex = ref(0)
const Cardlist = ref([])
const log = ref(true)
const TextArea = ref('')
const categories = [
  { key: 'o1', label: '等待订阅' },
  { key: 'o2',    label: '订阅完成' },
  { key: 'o3',  label: '订阅失败' },
  { key: 'all',     label: '提交Token' },
]

//清空输入框
const getElementById = ()=>{
  TextArea.value = ''
}

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
  console.log("----", res)
}

//监听分页
const onPageChange = (Tm)=>{
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"plusorder",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{state:categories[selectedIndex.value].key}
        }
    })
    GetList(JSONDATA)
}

const SetPy = async(e,cat)=>{
    if(e === selectedIndex.value) return
    selectedIndex.value = (e)
    if(cat.key==='all'){
        return
    }
    logName.value = "正在查询"
    log.value = true
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"plusorder",
            page:Page.value,
            pageSize:PageSise.value,
            filters:{state:categories[selectedIndex.value].key}
        }
    })
    const res = await PostApi(JSONDATA)
    if(res.ok){
        GetList()
    }else{
        log.value = false
    }
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
            filters:{state:categories[selectedIndex.value].key}
        }
    })
    const res = await PostApi(JSONDATA)
    if(res.ok){
        Cardlist.value = res.data
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
