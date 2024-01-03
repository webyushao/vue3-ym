import { isObject } from "@vue/shared";
import { isReactive } from "./baseHandler";

export enum ReactiveFlags {
  isReactive = '__v_isReactive'
}


export function reactive(target) {
  if (!isObject(target)) return

  let reactiveMap = new WeakMap()
  if (reactiveMap.get(target)) {
    return reactiveMap
  }

  const proxy = new Proxy(target, {
    get (target, key, receiver) {
      if (key === ReactiveFlags.isReactive) {
        return true
      }
      const res = Reflect.get(target, key, receiver)
      if (isObject(res)) {
        return reactive(res)
      }
      return res
    },
    set (target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        // 更新
      }
      return result
    }
  })
}