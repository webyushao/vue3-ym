import { activeEffect, ReactiveEffect, trackEffect } from "../src/effect";



let activeEffect = undefined
class ReactiveEffect {
  public active = true
  public deps = []
  public parent = null
  constructor (public fn) {}
  run () {
    if (!this.active) {
      return this.fn()
    }
    try {
      parent = activeEffect
      activeEffect = this
      this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = null
    }
  }

}
let mapping = {
  target: {
    key: {}
  }
}
const targetMap = new WeakMap()
export function track (target, type, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffect(dep)
  
}

export function trackEffect (dep) {
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}
export function effect(fn, scheduler) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}




// effect(() => {
//   return person.name + person.age
// })
// let mapping = {
//   target: new Map(
//     key: new Set()
//   )
//   }
// }
function trigger (target, key, value) {
  const depsMap = targetMap.get(target) 
  const dep = depsMap.get(key)
  if (dep) {

  }
}