<template>
  <div class="mx-auto w-full max-w-[750px] p-4">
    <HeaderView title="Token 管理" :fanhui="true" />

    <!-- 分类切换条 -->
    <div class="mt-4">
      <!-- 中间：Tabs（Headless UI） -->
      <TabGroup :selectedIndex="selectedIndex" @change="(i)=> selectedIndex=i">
        <TabList class="flex w-full rounded-xl bg-white ring-1 ring-slate-200 p-1 shadow-sm">
          <Tab
            v-for="(cat, idx) in categories"
            :key="cat.key"
            as="template"
            v-slot="{ selected }"
          >
            <button
              class="flex-1 basis-0 text-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition
                     focus:outline-none"
              :class="selected
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 hover:bg-slate-100'"
            >
              {{ cat.label }}
            </button>
          </Tab>
        </TabList>
        <TabPanels class="mt-4">
          <TabPanel v-for="cat in categories" :key="cat.key" class="rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
            <Gridlists></Gridlists>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
import { ref } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import Gridlists from '../components/gridlists.vue'

const categories = [
  { key: 'pending', label: '等待订阅' },
  { key: 'used',    label: '订阅完成' },
  { key: 'failed',  label: '订阅失败' },
  { key: 'all',     label: '全部' },
]

const selectedIndex = ref(0)
function prev() { selectedIndex.value = (selectedIndex.value - 1 + categories.length) % categories.length }
function next() { selectedIndex.value = (selectedIndex.value + 1) % categories.length }
</script>
