<template>
    <header class="rounded-2xl bg-slate-900 text-white px-5 py-4 shadow-md flex items-center justify-between">
        <button id="logout-btn" @click="smartBack" :class="[
            'ml-4 shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40',
            fanhui ? '' : 'invisible'
        ]">
            <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
        </button>
        <div class="flex-1 text-center">
            <h1 class="text-xl font-bold tracking-tight">{{ title }}</h1>
            <p class="mt-1 text-xs text-white/70">{{ cotent }}</p>
        </div>
        <button id="logout-btn" :class="[
            'ml-4 shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40',
            showLogout ? '' : 'invisible'
        ]">
            <ArrowRightOnRectangleIcon class="h-5 w-5" aria-hidden="true" />
        </button>
    </header>
</template>
<script setup>
import { ArrowLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
const router = useRouter()
const GetJson = defineProps({
    title: {
        type: String,
        default: "Plus 后台管理"
    },
    cotent: {
        type: String,
        default: "后台登录网址:https://My91.My"
    },
    showLogout: {
        type: Boolean,
        default: false
    },
    fanhui: {
        type: Boolean,
        default: false
    },
})
function smartBack() {
    if (window.history.length > 1) {
        router.back()
    } else {
        router.push({ name: 'home' }) // 这里是兜底路由，你可改成想去的页面
    }
}
</script>