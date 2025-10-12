<template>
    <div class="mx-auto w-full max-w-[750px] p-4">
        <headerView />
        <div class="mt-6">
            <div class="grid grid-cols-2 gap-4">
                <!-- 基础设置 -->
                <button @click="go('settings')"
                    class="group relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]">
                    <div class="text-3xl mb-2 select-none">⚙️</div>
                    <div class="font-semibold">基础设置</div>
                    <div class="text-xs text-slate-500 mt-0.5">Basic Settings</div>
                    <span
                        class="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-indigo-400/60"></span>
                </button>

                <!-- 卡密管理 -->
                <button @click="go('card')"
                    class="group relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]">
                    <div class="text-3xl mb-2 select-none">🎫</div>
                    <div class="font-semibold">卡密管理</div>
                    <div class="text-xs text-slate-500 mt-0.5">Card Code Management</div>
                    <span
                        class="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-indigo-400/60"></span>
                </button>

                <!-- 订单管理 -->
                <button @click="go('token')"
                    class="group relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]">
                    <div class="text-3xl mb-2 select-none">📦</div>
                    <div class="font-semibold">订单管理</div>
                    <div class="text-xs text-slate-500 mt-0.5">Order Management</div>
                    <span
                        class="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-indigo-400/60"></span>
                </button>

                <!-- 提交订单 -->
                <button @click="go('submit')"
                    class="group relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]">
                    <div class="text-3xl mb-2 select-none">📝</div>
                    <div class="font-semibold">提交订单</div>
                    <div class="text-xs text-slate-500 mt-0.5">Submit Order</div>
                    <span
                        class="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-indigo-400/60"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import headerView from '../components/headerView.vue'
import { useRouter,useRoute } from 'vue-router'
 const Tabtoutr = useRouter()
const user = ref('')

onMounted(() => {
    user.value = sessionStorage.getItem('user') || ''
})



function go(act) {
    if(act==='settings') return Tabtoutr.push({ name: 'settings' })
    if(act==='card') return Tabtoutr.push({ name: 'card' })
    if(act==='token') return Tabtoutr.push({ name: 'token' })
    if(act==='submit') return Tabtoutr.push({ name: 'submit' })
    
}
    
    onMounted (()=>{
        const user =  localStorage.getItem('username')
        if(!user){
            Tabtoutr.push('/')
        }
    })
</script>