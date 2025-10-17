<!--Tab分栏组件-->
<template>
    <div class="mt-3">
        <TabGroup :selectedIndex="Selected">
            <TabList class="flex w-full rounded-xl bg-white ring-1 ring-slate-200 p-1 shadow-sm">
                <Tab v-for="(item, index) in listName" :key="index" as="template" v-slot="{ selected }">
                    <button @click="ClaickButton(index)" class="flex-1 basis-0 text-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition
                    focus:outline-none"
                        :class="selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'">
                        {{ item.label }}
                    </button>
                </Tab>
            </TabList>
        </TabGroup>
    </div>
</template>

<script setup>
import { TabGroup, TabList, Tab, } from '@headlessui/vue'
const props = defineProps({
    listName: {
        type: Array,
        default: () => []
    },
    Selected: {
        type: Number,
        default: 0
    }
})
const emit = defineEmits(['tabindex'])
const ClaickButton = (index) => {
    emit('tabindex', index)
}
</script>