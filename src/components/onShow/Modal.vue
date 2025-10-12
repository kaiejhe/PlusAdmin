<template>
  <TransitionRoot as="template" :show="isVisible">
    <Dialog as="div" class="relative z-[9999]" @close="handleDialogClose">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-[9999] w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center px-4 py-10 text-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative w-full max-w-sm transform overflow-hidden rounded-lg bg-white px-5 pb-5 pt-6 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:px-6 sm:pb-6 sm:pt-7">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    {{ opts.title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <div
                      class="whitespace-pre-wrap text-sm text-gray-500"
                      :class="contentAlignClass"
                    >
                      <slot>{{ opts.content }}</slot>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  @click="handleConfirm"
                >
                  {{ opts.confirmText }}
                </button>
                <button
                  v-if="opts.showCancel"
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="handleCancel"
                >
                  {{ opts.cancelText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

/**
 * 可配置项及默认值
 */
const defaultOptions = {
  title: '删除确认',
  content: '确定要删除当前记录吗？',
  showCancel: true,
  cancelText: '取消',
  confirmText: '确定',
  maskClosable: true,
  contentAlign: 'center', // 'left' | 'center' | 'right'
  type: 'info', // 兼容旧调用，不再用于样式
}

const isVisible = ref(false)
const opts = ref({ ...defaultOptions })
let resolver = null // 存储 Promise 的 resolve

/**
 * 打开对话框（返回 Promise）
 * 用法：await exposed.open(options)
 */
function open(options = {}) {
  opts.value = { ...defaultOptions, ...options }
  isVisible.value = true

  // 返回一个 Promise，点击“确定/取消/遮罩关闭/ESC”时 resolve
  return new Promise((resolve) => {
    resolver = resolve
  })
}

/**
 * 关闭对话框（内部使用）
 */
function close(result) {
  isVisible.value = false
  if (resolver) {
    resolver(result) // { confirm: boolean, cancel: boolean }
    resolver = null
  }
}

/**
 * 交互事件
 */
function handleConfirm() {
  close({ confirm: true, cancel: false })
}
function handleCancel() {
  close({ confirm: false, cancel: true })
}
function handleDialogClose() {
  if (!opts.value.maskClosable) return
  handleCancel()
}

/**
 * 文案对齐样式
 */
const contentAlignClass = computed(() => ({
  'text-center': opts.value.contentAlign === 'center',
  'text-left': opts.value.contentAlign === 'left',
  'text-right': opts.value.contentAlign === 'right',
}))

// 暴露 API
defineExpose({ open, close })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
