<template>
  <Transition name="fade">
    <div v-if="show"
      class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md px-4 py-2 text-sm text-white shadow-md"
      :class="{
        'bg-green-500': type === 'success',
        'bg-red-500': type === 'error',
        'bg-blue-500': type === 'info'
      }">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const message = ref('保存成功')
const type = ref('success')
let timer = null

function open({ message: msg, type: t = 'success', duration = 2000 }) {
  message.value = msg
  type.value = t
  show.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { show.value = false }, duration)
}

// 关键：把可调用的方法暴露出去，供外部服务调用
defineExpose({ open })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
