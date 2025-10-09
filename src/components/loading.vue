<template>

    <div
        class="fixed inset-0 z-50 grid place-items-center bg-gradient-to-br from-slate-100/70 to-slate-200/40 dark:from-slate-900/60 dark:to-slate-800/40 backdrop-blur">
        <div
            class="relative w-[14rem] rounded-2xl border border-white/30 bg-white/60 p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800/60 dark:border-white/10">
            <!-- 彩色渐变环 -->
            <div class="mx-auto grid place-items-center">
                <span class="relative grid size-12 place-items-center">
                    <span
                        class="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-purple-500 opacity-20 blur" />
                    <span class="size-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                </span>
            </div>

            <p class="mt-4 text-center text-sm font-medium text-slate-800 dark:text-slate-100">{{Name}}</p>
            <p class="mt-1 text-center text-xs text-slate-500 dark:text-slate-300/80">请稍候，马上就好…</p>

            <!-- 细进度条（装饰） -->
            <div class="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <div
                    class="h-full w-1/3 animate-[loading_1.4s_ease_infinite] rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500">
                </div>
            </div>
        </div>
    </div>

</template>
<script setup>
const Pops = defineProps({
    Name:{
        type:String,
        default:"正在加载"
    }
})
</script>