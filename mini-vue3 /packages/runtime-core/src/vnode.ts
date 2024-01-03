
import { isObject, isString, ShapeFlags } from '@vue/shared'

export const Text = Symbol('text')

export const Fragment = Symbol('Fragment')
export function isVnode(vnode) {
  return vnode.__v_node == true
}


export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
export function createVnode(type: any, props = null, children = null ) {
  // 组件
  // 元素
  // 文本
  // 自定义的keep-alive
  // 用标识来区分，对应虚拟节点类型，表示采用的位运算方式，可以方便组合

  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.COMPONENT: 0
  // 虚拟节点要对应真实节点
  const vnode = {
    __v_node: true, // 添加标识是不是vnode
    type,
    props,
    children,
    shapeFlag,
    key: props?.key,
    el: null // 对应的真实节点
  }

  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      type = ShapeFlags.TEXT_CHILDREN
    }
    // vnode.shapeFlag |= type
    vnode.shapeFlag = vnode.shapeFlag | type
  }
  return vnode // 根据vnode.shapeFlag 来判断自己的类型和孩子的类型
}