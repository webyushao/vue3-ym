// 提供多样api，方便区分

import { isObject } from "@vue/shared"
import { createVnode, isVnode } from "./vnode"

export function  h(type, propsOrChildren, children?) {
  const l = arguments.length

  // h(type, {}) h('div', {}, 'hello word') length
  // h(type, h('span')) h('div', h('span'))
  // h(type, []) h('div', ['hello word'])
  // h(type, '文本) // h('div', 'hello word')
  // h(component, {a: 1, b:2}, 'hello word') // type为对象的。
  // h(type, {})  h(type, h(type, {})) 转换成 h(type, [h(type, {})])  h(type, []) h(type, text)
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren])
      }
      return createVnode(type, propsOrChildren)
    } else {
      // 数组或者文本 指定没有属性
      return createVnode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // h('div', {}, a, b, c, d) // 这样的操作第二个参数必须是属性
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) {
      // h('div', {}, h('span')) => h('div', {}, [h('span')]) 
      children = [children]
    }
    return createVnode(type, propsOrChildren, children)
  }
}