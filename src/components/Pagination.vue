<!--分页-->
<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-white/10 dark:bg-transparent">
    <!-- 移动端：上一页/下一页（演示，用 button 更合适） -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        type="button"
        @click="prev"
        :disabled="isFirstPage"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
      >
        Previous
      </button>
      <button
        type="button"
        @click="next"
        :disabled="isLastPage"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
      >
        Next
      </button>
    </div>

    <!-- 桌面端 -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <!-- 这里显示总数量（动态） -->
        <p class="text-sm text-gray-700 dark:text-gray-300">总数量：{{ total }}</p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-xs dark:shadow-none" aria-label="Pagination">
          <!-- Prev -->
          <button
            type="button"
            @click="prev"
            :disabled="isFirstPage"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-white/5"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="size-5" aria-hidden="true" />
          </button>

          <!-- 页码（根据 displayPages 动态渲染），当前页高亮 -->
          <template v-for="(p, idx) in displayPages" :key="idx">
            <span
              v-if="p === '…'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 select-none dark:text-gray-400 dark:ring-gray-700"
            >...</span>

            <button
              v-else
              type="button"
              :aria-current="p === page ? 'page' : undefined"
              @click="gotoPage(p)"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2"
              :class="p === page
                ? 'z-10 bg-indigo-600 text-white focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:focus-visible:outline-indigo-500'
                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-white/5'"
            >
              {{ p }}
            </button>
          </template>

          <!-- Next -->
          <button
            type="button"
            @click="next"
            :disabled="isLastPage"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-white/5"
          >
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="size-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

// ✅ 注意：是 Props 不是 Pops（你原文里拼成 Pops 了）
// ✅ 这些是“受控”值：父组件传入，子组件不直接修改
const props = defineProps({
  total: { type: Number, default: 0 },
  page:  { type: Number, default: 1 },   // 第几页：从 1 开始更自然
  pageSize: { type: Number, default: 10 } // 每页几条
})

// 子组件通过事件通知父组件更新
const emit = defineEmits(['update:page', 'update:pageSize', 'change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const isFirstPage = computed(() => props.page <= 1)
const isLastPage  = computed(() => props.page >= totalPages.value)

// 切换页码：只负责发事件，不直接改 props
function gotoPage(p) {
  const page = Math.min(totalPages.value, Math.max(1, Number(p)))
  if (page !== props.page) {
    emit('update:page', page) // v-model:page 支持
    emit('change', page)      // 可选：方便父组件统一监听
  }
}
function next() { gotoPage(props.page + 1) }
function prev() { gotoPage(props.page - 1) }

// 生成页码数组（带省略号）；你也可以改成更简单只显示固定几个页码
const displayPages = computed(() => {
  const total = totalPages.value
  const current = props.page
  const sibling = 1     // 当前页左右各显示几个
  const boundary = 1    // 两端保留几个

  if (total <= 1) return [1]

  const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)

  const startPages = range(1, Math.min(boundary, total))
  const endPages   = range(Math.max(total - boundary + 1, 1), total)

  const left  = Math.max(current - sibling, 1)
  const right = Math.min(current + sibling, total)
  const middle = range(left, right)

  const pages = []
  // 开头
  for (const p of startPages) if (!pages.includes(p)) pages.push(p)
  // 左省略
  if (middle[0] > startPages[startPages.length - 1] + 1) {
    pages.push('…')
  } else if (middle[0] === startPages[startPages.length - 1] + 1) {
    pages.push(middle[0]); middle.shift()
  }
  // 中间
  for (const p of middle) if (!pages.includes(p)) pages.push(p)
  // 右省略
  if (endPages[0] > pages[pages.length - 1] + 1) {
    pages.push('…')
  } else if (endPages[0] === pages[pages.length - 1] + 1) {
    pages.push(endPages[0]); endPages.shift()
  }
  // 结尾
  for (const p of endPages) if (!pages.includes(p)) pages.push(p)
  return pages
})
</script>
