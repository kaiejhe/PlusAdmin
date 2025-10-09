<template>
    <loading Name="正在查询" v-if="log"></loading>
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
                    <Card :CardList="Cardlist" v-if="selectedIndex<3"></Card>
                    <Setcard v-else></Setcard>
                </div>
            </TabGroup>
        </div>
    </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { onMounted, ref } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import Card from '../components/card.vue'
import Setcard from '../components/setcard.vue'
import { PostApi } from '../util/util'
import loading from '../components/loading.vue'
const Page = ref(1) //分页默认
const PageSise = ref(10)
const selectedIndex = ref(0)
const Cardlist = ref([])
const log = ref(true)
const categories = [
  { key: 'o1', label: '未使用' },
  { key: 'o2',    label: '已使用' },
  { key: 'o3',  label: '已废弃' },
  { key: 'all',     label: '创建卡密' },
]


function SetPy(e,cat){
    if(e === selectedIndex.value) return
    selectedIndex.value = (e)
    if(cat.key==='all'){
        return
    }
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"card",
            Page:Page.value,
            PageSise:PageSise.value,
            filters:{state:cat.key}
        }
    })
    GetList(JSONDATA)
}
const GetList = async(Body)=>{
    log.value = true
    const res = await PostApi(Body)
    if(res.ok){
        Cardlist.value = res.data
    }else{
        Toastify({
            text: res.msg,
            gravity: "top",       // top / bottom
            position: "center",   // left / center / right
            offset: { y: 350 },     // 再往下移就调大 y
            duration: 2000
        }).showToast()
    }
    setTimeout(()=>{
        log.value = false
    },500)
    
}
onMounted(()=>{
    const JSONDATA = JSON.stringify({
        msgoogle:"getlist",
        data:{
            table:"card",
            Page:Page.value,
            PageSise:PageSise.value
        }
    })
    GetList(JSONDATA)
})


</script>
