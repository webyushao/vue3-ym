function createInvoker (initialValue) {
  const invoker = (e) => invoker.value(e) // 后续只要更新invoker的value属性就好
  invoker.value = initialValue
  return invoker
}

export function patchEvent (el, key, nextValue) {
  // vue event invoker是vei的全称
  const invokers = el._vei || (el._vei = {}) // _vei vue event invoker

  // 如果nextValue 为空。而且有绑定过事件，要移除 onClick 
  const eventName = key.slice(2).toLowerCase()

  const existingInvoker = invokers[eventName]

  if (nextValue && existingInvoker) {
    // 更新事件
    existingInvoker.value = nextValue
  } else {
    if (nextValue) {
      // 缓存创建的invoker
      const invoker =(invokers[eventName] = createInvoker(nextValue))
      el.addEventListener(eventName, invoker)
    } else if (existingInvoker) {
      el.removeAddEventListener(eventName, existingInvoker)
      invokers[eventName] = null
    }
  }
}



