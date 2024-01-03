import { isObject } from "@vue/shared"
import { isReactive } from "./baseHandler"
import { ReactiveEffect } from "../src/effect"

function treverse (source, s = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (s.has(source)) {
    return source
  }
  s.add(source)
  for (let key in source) {
    treverse(source[key], s)
  }
  return source
}

function dowatch (source, cb, { immediate } = {} as any) {
  let getters
  if (isReactive(source)) {
    getters = () => treverse(source)
  } else if (isObject(source)) {
    getters = source
  }
  let oldValue = undefined

  const job = () => {
    if (cb) {
      const newValue = effect.run()
      cb(newValue, oldValue)
      oldValue = newValue
    } else {
      effect.run()
    }
   
  }
  const effect = new ReactiveEffect(getters, job)
  if (immediate) {
    return job()
  }
  oldValue = effect.run()
}

export function watch (source, cb, options) {
  dowatch(source, cb, options)
}

export function watchEffect (source, cb, options) {
  dowatch(source, cb, options)
}