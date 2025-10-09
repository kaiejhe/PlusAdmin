<template>
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
                    <Card v-if="selectedIndex<3"></Card>
                    <Setcard v-else></Setcard>
                </div>
            </TabGroup>
        </div>
    </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { ref } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import Card from '../components/card.vue'
import { FunnelIcon } from '@heroicons/vue/24/outline'
import Setcard from '../components/setcard.vue'

const categories = [
  { key: 'pending', label: '未使用' },
  { key: 'used',    label: '已使用' },
  { key: 'failed',  label: '已废弃' },
  { key: 'all',     label: '创建卡密' },
]

const selectedIndex = ref(0)
function SetPy(e){
    if(e === selectedIndex.value) return
    selectedIndex.value = (e)
    console.log("------", selectedIndex.value)
}
// function prev() { selectedIndex.value = (selectedIndex.value - 1 + categories.length) % categories.length }
// function next() { selectedIndex.value = (selectedIndex.value + 1) % categories.length }
</script>
