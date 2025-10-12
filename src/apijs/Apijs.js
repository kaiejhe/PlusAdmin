// src/apijs/Apijs.js
import { createVNode, render } from 'vue'

// —— 静态导入所有会用到的组件 —— //
import Toast from '../components/onShow/Toast.vue'
import Modal from '../components/onShow/Modal.vue'

// 单例缓存
const _instances = new Map()

function _mountSingleton(component) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const vnode = createVNode(component)
  render(vnode, container)
  const exposed = vnode.component?.exposed
  return { container, exposed }
}

function _destroySingleton(key) {
  const inst = _instances.get(key)
  if (!inst) return
  if (inst.timer) {
    clearTimeout(inst.timer)
  }
  render(null, inst.container)
  document.body.removeChild(inst.container)
  _instances.delete(key)
}

function _getExposed(key, component) {
  if (!_instances.has(key)) {
    const { container, exposed } = _mountSingleton(component)
    if (!exposed) {
      console.error(`[Tm] component for "${key}" exposes nothing.`)
    }
    _instances.set(key, { container, exposed, timer: null })
  }
  return _instances.get(key).exposed
}

// 全局 API
const Tm = {
  // —— Toast：和你原来的逻辑一致 —— //
  showMessage(msgOrOpts, type = 'success', duration = 2000) {
    const exposed = _getExposed('message', Toast)
    if (!exposed?.open) return

    const opts = typeof msgOrOpts === 'string'
      ? { message: msgOrOpts, type, duration }
      : msgOrOpts

    const inst = _instances.get('message')
    if (inst?.timer) {
      clearTimeout(inst.timer)
      inst.timer = null
    }

    exposed.open(opts)

    const dismissDelay = opts?.duration ?? duration
    const timer = setTimeout(() => {
      const current = _instances.get('message')
      if (current?.timer === timer) {
        _destroySingleton('message')
      }
    }, dismissDelay)

    if (inst) {
      inst.timer = timer
    }
  },

  // —— Modal：Promise 化，等待用户操作 —— //
  async showModal(options = {}) {
    const exposed = _getExposed('modal', Modal)
    if (!exposed?.open) return Promise.resolve({ confirm: false, cancel: true })
    // 直接把 Promise 结果透传给调用方
    return exposed.open(options)
  },

  // 可选：暴露手动销毁
  destroy(key) {
    _destroySingleton(key)
  }
}

// 浏览器环境挂全局
if (typeof window !== 'undefined') window.Tm = Tm
export default Tm
