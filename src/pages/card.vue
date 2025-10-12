<template>
    <loading :Name="logName" v-if="log"></loading>
    <div class="mx-auto w-full max-w-[750px] p-4">
        <HeaderView title="卡密管理" :fanhui="true" />
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
                        <Card :CardList="Cardlist" @dellist="dellist" @updlist="updlist"></Card>
                        <Pagination v-model:page="Page" @change="onPageChange"  :total="total"  :pageSize="PageSise"></Pagination>
                    </div>
                    <Setcard v-else></Setcard>
                </div>
            </TabGroup>
        </div>
    </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { onMounted, ref } from 'vue'
import { TabGroup, TabList, Tab, } from '@headlessui/vue'
import Card from '../components/card.vue'
import Setcard from '../components/setcard.vue'
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
const categories = [
  { key: 'o1', label: '未使用' },
  { key: 'o2',    label: '已使用' },
  { key: 'o3',  label: '已废弃' },
  { key: 'all',     label: '创建卡密' },
]

//监听分页
const onPageChange = (Tm)=>{
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"card",
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
            table:"card",
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
            table:"card",
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
//修改数据状态
const updlist = async (item)=>{
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
