import { isObject } from '@vue/shared'
import { isFunction } from '@vue/shared'
import { activeEffect, ReactiveEffect, trackEffect, triggerEffect } from './effect'

class ComputedRefImpl {
  public dep = undefined;
  public __v_isRef =  true // 意味着有这个属性就需要用.value去取值
  public effect = undefined
  public _dirty = true;
  public _value = '' // 默认的缓存结果
  constructor(public getter, public setter) {
    
    // 我们将用户的getter放在effect中，
    // 这里面的firstName和lastName就会被这个effect收集起来
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true
      triggerEffect(this.dep)
    })
  }
  // get为类的属性访问器，跟vue2的defineProperty的get方法一样
  get value() {
    if (activeEffect) {
      // 如果有activeEffect， 意味着这个计算属性在effect中使用
      // 需要让计算属性收集这个effect
      // 用户取值发生依赖收集 
      trackEffect(this.dep || (this.dep = new Set()))
    }

    // 取值才执行，并把取到的值缓存起来
    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false
    }
    return this._value
  }

  set value (newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => { console.warn('no setter') }
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter)
} 