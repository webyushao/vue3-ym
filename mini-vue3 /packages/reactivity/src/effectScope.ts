import { activeEffect } from "./effect";

export let aciveEffectScope;

class EffectScope {
  active = true;
  effects = []; // 这是收集内部的
  parent;
  scopes = [] // 这是收集外部的
  constructor (detached = false) {
    if (!detached && aciveEffectScope) { 
      aciveEffectScope.scopes || (aciveEffectScope.scopes = [])
    }
  }
  run (fn) {
    if (this.active) {
      try {
        this.parent = aciveEffectScope
        aciveEffectScope = this
      } finally {
        aciveEffectScope = this.parent
        this.parent = null
      }
      return fn()
    }
  }
  stop () {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop() // 让每一个effect都终止
      }
      this.active = false
    }
    if (this.scopes) {
      for (let i = 0; i < this.scopes.length; i++) {
        this.scopes[i].stop() // 让每一个effect都终止
      }
    }
  }
}

export function recordEffectScope (effect) {
  if (aciveEffectScope && aciveEffectScope.active) {
    aciveEffectScope.effects.push(effect)
  }
}
export function effectScope (detached) {
  return new EffectScope(detached)
}