 
 // 对元素可以进行元素操作

 import { nodeOps } from './nodeOps'
 import { patchProp } from './pathProp'
 import { createRenderer } from '@vue/runtime-core'

 // dom操作api
 const renderOptions = Object.assign(nodeOps, { patchProp })
  console.log(renderOptions, 'renderOptions')
 export const render = (vnode, container) => { 
  createRenderer(renderOptions).render(vnode, container)
 }
 export * from '@vue/runtime-core'