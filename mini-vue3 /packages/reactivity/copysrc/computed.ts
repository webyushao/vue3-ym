

import { isFunction } from '@vue/shared'
import { ReactiveEffect, activeEffect, trackEffect, triggerEffect } from '../src/effect';
let noon = () => {}


class ComputedRefImpl {
  public dep;
  public __v_Ref;
  public _dirty = true
  public _value;
  public effect

  constructor (public getters, public setters) {
    this.effect = new ReactiveEffect(getters, () => {

      this._dirty = true
      // scheduler
    })
  }

  get () {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()))
    }

    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false
    }
    return this._value
  }

  set (newValue) {
    triggerEffect(this.dep)
    this.setters(newValue)
  }
}

export function computed (getterOrOptions) {
  let getter
  let setter
  let onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || noon
  }
  return new ComputedRefImpl(getter, setter)
}