import { isObject } from '@vue/shared'
import { reactive } from './reactive'
import { activeEffect, ReactiveEffect, track, trigger } from './effect'


export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export function isReactive (target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}

export const mutableHandlers = {
  get (target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)
    // return target[key]
    // receiver就是proxy
    //1.  使用Reflect保证this是正常的,改变了取值时候的this指向。
    //2.  如果你不使用reflect，那么你在取值的时候如果targte对象方法中又引用了其他的属性是不会触发的
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      return reactive(res) // 深度代理实现，性能好，取值的时候才去代理，不用担心性能
    }
    return res
  },
  set (target, key, value, receiver) {
    // receiver就是proxy
    let oldValue = target[key] // 没有修改之前的值
    // result为boolean类型 true
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}