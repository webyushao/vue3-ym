// 总结 watch 是Effect + scheduler
// watchEffect 就是一个effect

import { isReactive } from './baseHandler'
import { ReactiveEffect } from './effect'
import { isFunction, isObject } from '@vue/shared'

function traverse (source, s = new Set()) {
  if (!isObject(source)) {
    return source
  } 
  // 遍历对象有循环引用的问题， 考虑循环引用的问题，采用set来解决此问题
  if (s.has(source)) {
    return source
  }
  s.add(source)

  for(let key in source) {
    traverse(source[key], s) // 递归取值
  }
  return source
}

function doWatch (source, cb, { immediate } = {} as any) {
  let getter
  if (isReactive(source)) {
    getter = () => traverse(source)
  } else if (isFunction(source)) {
    getter = source
  }
  console.log(getter, 'getter')
  let oldValue;
  let cleanup;
  const onCleanUp = function (usercb) {
    cleanup = usercb
  }
  const job = () => {
    // 内部要调用cb
    if (cb) { // 说明是watch api
      const newValue = effect.run() // 再次调用effect 拿到新值 
      if (cleanup) cleanup()
      cb(newValue, oldValue, onCleanUp) // 拿到新老值
      oldValue = newValue // 更新
    } else { // 说明是watchEffect
      effect.run() // 调用run方法会触发我们的清理
    }
  }
  const effect = new ReactiveEffect(getter, job)
  if (immediate) {
    return job()
  }
  oldValue = effect.run() // 保留老值
}

export function watch (source, cb, options) {
  doWatch(source, cb, options)
} 

export function watchEffect (effect, options) {
  doWatch(effect, null, options)
}