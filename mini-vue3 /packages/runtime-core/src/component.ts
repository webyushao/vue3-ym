import { reactive } from "@vue/reactivity"
import { initProps } from "./componnetProps"
import { hasOwn, isFunction, isObject } from '@vue/shared'


export let currentInstance // 当前正在执行的实例。

export function setCurrentInstance(instance) {
  return currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}


export function createComponentInstance(vnode) {
  const instance = {
    data: null,
    isMounted: false,
    vnode,
    subTree: null,
    update: null,
    propsOptions: vnode.type.props || {},
    proxy: null,
    props: {},
    attrs: {},
    setupState: null,
    exposed: null,
    // 组件的生命周期，
    // slot
    // 事件
  }
  return instance
}

const publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props
}

const publicInstanceProxyHandler = {
  get(target, key) {
    let { data, props, setupState } = target
    if (data && hasOwn(key, data)) {
      return data[key]
    } else if (hasOwn(key, props)) {
      return props[key]
    } else if (setupState && hasOwn(key, setupState)) {
      return setupState[key]
    }
    const getter = publicProperties[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    let { data, props, setupState } = target
    if (hasOwn(key, data)) {
      data[key] = value
    } else if (hasOwn(key, props)) {
      console.warn(`props属性不能修改`)
      return false
    } else if (setupState && hasOwn(key, setupState)) {
      setupState[key] = value
    }
    return true
  }
}

export function setupComponent(instance) {
  const { type, props } = instance.vnode

  // 用户传递的props和把它解析成attr和props放在实例上
  initProps(instance, props)
  // 创建代理对象, 目的是当用户去取属性的时候，如果不在data上，就会去props上找，设置的时候props不能改，但是data可以修改。
  instance.proxy = new Proxy(instance, publicInstanceProxyHandler)

  let { setup } = type
  if (setup) {
    const setupContext = {
      attrs: instance.attrs,
      props: instance.props,
      emits: (events, ...args) => {
        const eventName = `on${events[0].toLowercase() + events.slice(1)}`
        const handler = instance.vnode.props[eventName]
        handler && handler(...args)
      },
      expose(exposed) {
        instance.expose = exposed
      }
    }

    setCurrentInstance(instance);
    let setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null)
    // setup返回的是render函数
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else {
      // 将返回结果作为了数据源 
      instance.setupState = setupResult
    }
  }


  let data = type.data
  if (data) {
    if (isFunction(data)) {
      // 用户将props转换为data
      instance.data = reactive(data.call(instance.proxy))
    }
  }

  instance.render = type.render // 将用户写的render转化为实例上的render
}