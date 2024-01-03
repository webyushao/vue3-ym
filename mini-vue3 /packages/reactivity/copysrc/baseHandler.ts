import { isObject } from "@vue/shared"
import { reactive } from "./reactive"


export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}


export const mutableHandlers = {
  get (target, key, receiver) {
    if (target[key] === '__v_isReactive') {
      return true
    }
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      reactive(res)
    }
    return res
  },
  set (target, key, value, receiver) {
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (value !== oldValue) {

    }
    return result
  }
}