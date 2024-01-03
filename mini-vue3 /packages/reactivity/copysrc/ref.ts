import { isObject } from "@vue/shared";
import { reactive} from './reactive'
import { activeEffect, triggerEffect } from "../src/effect";
import { trackEffect } from "./effect";

export function ref (value) {
  return new RefImpl(value)
}

function toReactive (value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  dep = undefined
  _value;
  __v_isRef = true
  constructor (public rawValue) {
    this._value = toReactive(rawValue)
  }

  get value () {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()))
    }
    return this._value
  }

  set value (newValue) {
    if (newValue !== this.rawValue) {
      toReactive(newValue)
      this.rawValue = newValue
      triggerEffect(this.dep)
    }
  }
}

class ObjectRefImpl {
  __v_isRef = true

  constructor (public _object, public key) {

  }
  get value () {
    return this._object[this.key]
  }
  set (newValue) {
    this._object[this.key] = newValue
  }
}

export function toRef (target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs (object) {
  const ret = {}
  for (let key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}