import { isObject } from '@vue/shared'
import { mutableHandlers, ReactiveFlags } from './baseHandler'
// 将数据装换成响应式的数据, 只能做对象的代理

// new WeakMap和new Map（）区别是，new WeapMap()只能用对象作为键。 map可以用任意类型作为键
// map可以被遍历， weakMap不可以被遍历
// Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键； WeakMap 的键是弱引用，键所指向的对象可以被垃圾回收，此时键是无效的
const reactiveMap = new WeakMap(); // key只能是对象

// 实现同一个对象，代理多次，返回同一个代理 new WeakMap
// 代理对象被再次代理，可以直接返回 isReactive

export function reactive (target) {
  if (!isObject(target)) {
    return target
  }
  if (target[ReactiveFlags.IS_REACTIVE]) { // 如果目标对象是一个代理对象（proxy），那么一定被代理过了，会走get（为啥会为true，因为只要访问这个属性，就会走proxy的get，所以proxy一定会走）
    return target
  }

  // 并没有重新定义属性，只是代理。在取值的时候会调用get， 在存值的时候在调用set
  let exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }
  // 第一次普通对象代理，我们会通过new Proxy代理一次
  // 下一次你传递的是proxy，我们可以看一下有没有代理过，如果访问过这个proxy，有get方法的时候说明就访问过了

  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy) // 判断相同的代理是否是一个
  return proxy
}