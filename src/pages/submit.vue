<template>
  <div class="mx-auto w-full max-w-[750px] p-4">
    <HeaderView title="上传 Token" :fanhui="true" />

    <!-- 卡片容器（可选） -->
    <section class="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 p-5 sm:p-6 dark:bg-slate-800/60 dark:ring-white/10">
      <!-- 表单标题（左对齐，层级更清晰） -->
      <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">请上传完整的JSON格式</p>
      <div class="mt-4">
        <div class="mt-2">
          <textarea
            id="comment"
            name="comment"
            rows="8"
            placeholder="请在此处粘贴完整的 JSON 数据..."
            class="block w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 placeholder-slate-400
                   focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                   dark:bg-slate-900/60 dark:text-white dark:border-slate-600 dark:placeholder-slate-500 dark:focus:ring-indigo-400"
          ></textarea>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300
                   dark:text-slate-200 dark:hover:bg-white/10 dark:ring-white/20"
            @click="document.getElementById('comment').value=''"
          >
            清空
          </button>
          <button
            type="button"
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            提交
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeaderView from '../components/headerView.vue'
</script>
