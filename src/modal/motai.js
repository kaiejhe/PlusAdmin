// 极简可复用：showModal(opts) -> Promise<boolean>
// 用 Tailwind 类做样式；没用 Tailwind 也能传自定义类名覆盖
export function showModal({
  title = '提示',
  content = '',
  confirmText = '确定',
  cancelText = '取消',
  showCancel = true,
  panelClass = 'relative w-[90%] max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5',
  maskClass  = 'absolute inset-0 bg-black/30'
} = {}) {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    host.className = 'fixed inset-0 z-[1000] flex items-center justify-center';
    host.innerHTML = `
      <div class="${maskClass}" id="__m_mask"></div>
      <div class="${panelClass}">
        <div class="text-base font-semibold text-gray-900">${title}</div>
        <div class="mt-3 text-sm text-gray-600 whitespace-pre-wrap">${content}</div>
        <div class="mt-5 flex justify-end gap-3">
          ${showCancel ? `<button id="__m_cancel" class="rounded-md px-3 py-1.5 text-sm ring-1 ring-gray-300 text-gray-700 hover:bg-gray-50">${cancelText}</button>` : ''}
          <button id="__m_ok" class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">${confirmText}</button>
        </div>
      </div>`;
    document.body.appendChild(host);

    const done = (ok) => { document.body.removeChild(host); resolve(ok); };
    host.querySelector('#__m_ok')?.addEventListener('click', () => done(true));
    host.querySelector('#__m_mask')?.addEventListener('click', () => done(false));
    host.querySelector('#__m_cancel')?.addEventListener('click', () => done(false));
  });
}

// 仅提示版（无取消按钮）
export function showAlert(content, title='提示', confirmText='知道了') {
  return showModal({ title, content, confirmText, showCancel: false });
}
