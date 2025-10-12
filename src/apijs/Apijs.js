// src/apijs/Apijs.js
import { createVNode, render } from 'vue'

// 存储已挂载组件的 Map
const _instances = new Map()

// 动态加载并挂载组件
function _mountSingleton(component) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const vnode = createVNode(component)
  render(vnode, container)
  return { container, exposed: vnode.component.exposed }
}

// 销毁已挂载的组件
function _destroySingleton(key) {
  if (_instances.has(key)) {
    const { container } = _instances.get(key)
    render(null, container)  // 销毁组件渲染
    document.body.removeChild(container)  // 移除 DOM 元素
    _instances.delete(key)  // 从 Map 中删除
  }
}

// 获取或挂载组件实例
async function _getExposed(key, component) {
  if (!_instances.has(key)) {
    const { default: loadedComponent } = await import(component)
    const { container, exposed } = _mountSingleton(loadedComponent)
    _instances.set(key, { container, exposed })  // 缓存组件实例和容器
  }
  return _instances.get(key).exposed
}

// 创建 uni 全局 API
const Tm = {
  // 延迟加载组件：调用时加载
  async showMessage(msgOrOpts, type = 'success', duration = 2000) {
    const exposed = await _getExposed('message', '../components/ModalDialogs.vue')
    const opts = typeof msgOrOpts === 'string'
      ? { message: msgOrOpts, type, duration }
      : msgOrOpts
    exposed.open(opts)

    // 自动销毁组件
    setTimeout(() => {
      _destroySingleton('message')  // 在使用完后销毁
    }, duration)  // 等待 `duration` 毫秒后销毁
  },

  // 以后可以继续添加更多方法：
  // showConfirm, showToast 等
}

if (typeof window !== 'undefined') {
  window.Tm = Tm  // 挂载到全局
}

export default Tm
