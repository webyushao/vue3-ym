import { ShapeFlags, hasOwn } from "@vue/shared"
import { reactive } from '@vue/reactivity'
import { isSameVnode, Text, Fragment } from './vnode'
import { ReactiveEffect } from "packages/reactivity/src/effect"
import { queueJob } from './scheduler'
import { initProps } from './componnetProps'
import { createComponentInstance, setupComponent } from "./component"
// 渲染
export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling 
  } = options
  // createRenderer 可以用户自定义渲染方式
  // createRenderer 返回的render方法，接受参数为虚拟节点和容器
  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el)
    }
  }

  const unmount = (vnode) => {
    if (vnode.type === Fragment) { // fragment卸载的不是自己，而是他所有的儿子
      return unmountChildren(vnode.children)
    }
    hostRemove(vnode.el)
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }
  const mountElement = (vnode, container, anchor) => { // 初次渲染会调用mountElement
    console.log('第五步mountELement', vnode, container)
    const { type, props, children, shapeFlag } = vnode
    // 创建元素， vnode上保留着真实节点
    const el = (vnode.el = hostCreateElement(type))
    // 增添属性
    if (props) {
      for (let key in props) {
        // 如果有属性，循环他并设置hostPatchProp
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 处理子节点,子节点可能是数组，或者文本 
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    // 直接插入
    hostInsert(el, container, anchor)
  }


  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for(let key in newProps) {
        const prev = oldProps[key]
        console.log(prev, 'prec')

        const next = newProps[key]
        if (prev != next) { // 用新的盖掉旧数据
          hostPatchProp(el, key, prev, next)
        }
      }

      for (let key in oldProps) {
        if (! (key in newProps) ) {// 老的存在，新的没有了
          const prev = oldProps[key]
          hostPatchProp(el, key, prev, null)
        }
      }
    }
  }

  const patchKeyedChildren = (c1, c2, el) => { 
    debugger
    // 两个数组比较差异 全量比对
    // 比对过程是深度遍历， 先遍历父亲，在遍历孩子， 从父 -> 子 都要比对一遍
    // 目前没有优化比对，没有关心，只比对变化的部分blockTree patchFlags
    // 同级比对 父和父比 子和子比
    let i = 0; // 默认为0开始比

    // a b e d
    // a b c e d
    // i = 0 e1 = 3 e2  = 4
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // 同序列挂载
    while(i <= e1 && i <= e2) { // 从头开始比较 有一方完事就结束了 
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el) // 深度遍历
      } else {
        break;
      } 
      i++
    }
    // i = 2 e1 = 3 e2 = 4

    while(i <= e1 && i <= e2) { // 从尾开始比较 从后往前比
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }
    // i = 2 e1 = 1 e2 = 2

    // a b c    向后插入
    // a b c d e  i = 3 e1 = 2 e2 = 4

    //     c d e f
    // a b c d e f  i = 0 e1 = -1 e2 = 1
    // 我要知道我是添加还是删除 i比e1大， 说明新的长，老的短
    if (i > e1) { // 有新增
      if (i <= e2) {
        while(i <= e2) {
          // 看一下 如果e2往前移动了，那么e2的下一个值一定肯定存在， 意味着向前插入（跟初始值比较）
          // 如果e2 没有动 下一个就是空，意味着向后插入（跟初始值比较）

          const nextPos = e2 + 1
          // vue2是看下一个元素是否存在， vue3是看下一个元素是否越界
          const anchor = nextPos < c2.length ? c2[nextPos].el : null 
          patch(null, c2[i], el, anchor) // 没有判断是向前插入还是向后插入
          i++
        }
      }
    }

    //   a b
    // c a b  i = 0   e1 = -1  e2 = 0

    // 默认从0开始比对
    // a b c 
    // a b e d


    // 以下为同序列卸载 
    // a b c d
    // a b      i = 2 e1 = 3 e2 = 1
    // a b c d 
    //     c d  i = 0 e1 = 1 e2 = -1 
    // 什么情况下老的多，新的少
     else if (i > e2) { // 有删除
       while(i <= e1) {
        unmount(c1[i])
        i++
       }

       // ---------以上为优化处理 ---------
     } else {
      // a b  c d e    f g
      // a b  e c d h  f g
      //  s1 ------> e1 c d e
      //  s2 ------> e2 e c d h
      
      // i = 2 e1 = 4 e2 = 5
      let s1 = i // s1 --> e1 
      let s2 = i // s2 --> e2
      // 这里我们要复用老节点 key vue2根据老节点创建映射表  vue3中用新的可以做了映射表
      const keytoNewIndexToMap = new Map()

      for (let i = s2; i < e2; i++) {
        const vnode = c2[i]
        keytoNewIndexToMap.set(vnode.key, i)
      }

      const toBePatch = e2 - s2 + 1
      const newIndexToOldIndex = new Array(toBePatch).fill(0) // [0, 0, 0, 0]

      // 有了新的映射表之后去老的映射表查一下看是否存在，如果存在需要复用
      for (let i = s1; i < e1; i++) {
          const child = c1[i]

          let newIndex = keytoNewIndexToMap.get(child.key)
          if (newIndex === undefined) {
            unmount(child)
          } else {
            // 对比两个属性
            // 如果前后2个能复用，则比较这两个节点
            newIndexToOldIndex[newIndex - s2] = i + 1 // 标记老的位置
            
            patch(child, c2[newIndex], el) // 复用，但是此时并没有移动位置，只是把老的元素替换成新的了
          }
      }
      console.log(newIndexToOldIndex) // 对应的位置就是老索引加1

      const seq = getSequence(newIndexToOldIndex)
      let j = seq.length - 1
      for (let i = toBePatch; i >=0; i--) {
          const nextIndex = s2 + i
          const nextChild = c2[nextIndex]
          const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
          if (newIndexToOldIndex[i] === 0) {
            // 创建元素在插入
            patch(null, nextChild, el, anchor) 
          } else {
            // 直接做插入操作即可
            // [5, 3, 4, 0] ----> [1, 2]
            if (i !== seq[j]) {
              hostInsert(nextChild.el, el, anchor)
            } else {
              j-- // 不做移动，跳过节点
            }
          }
      }
     }
  }

  const patchChildren = (n1, n2, el) => {
    // 比较两方孩子的差异，更新el中的孩子
    const c1 = n1.children
    const c2 = n2.children
    // 1. 新的为文本，旧的为数组。删除老儿子，设置文本内容
    // 2. 新的为文本，旧的为文本，更新文本
    // 3. 新的为文本，旧的为空，更新文本
    // 4. 新的为数组，旧的为数组，diff算法
    // 5. 新的为数组，旧的为文本。 清空文本，进行挂载
    // 6. 新的为数组， 旧的问空 直接挂载新的
    // 7. 新的为空，删除所以旧的
    // 8. 空 空 不处理
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {// 新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 老的是数组
        unmountChildren(c1)
      }

      if (c1 !== c2) { // 文本内容不相同
        hostSetElementText(el, c2)
      }
    } else {
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { 
          // 最复杂的diff算法
            patchKeyedChildren(c1, c2, el)
          } else {
            // 老的是数组， 新的不是数组，删除老的
            unmountChildren(c1)
          }
        } else {
          if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 如果老的是文本，文本清空
            hostSetElementText(el, '')
          }
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 新的是数组，则挂载
            mountChildren(c2, el)
          } 
        }
    }
  }

  const patchElement = (n1, n2) => {// 比对n1和n2的属性和差异
    const el = n2.el = n1.el // 老元素和新元素复用
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, el) // 比较孩子的差异，更新el中的孩子
  }

  const processElement = (n1, n2, container, anchor) => {
    console.log('第四部processElement', n1, n2, container)
    if (n1 === null) {
      // 初次渲染
      mountElement(n2, container, anchor)
    } else {
      // diff算法
      patchElement(n1, n2)
    }
  }

  const processText = (n1, n2, el) => {
    if (n1 === null) { 
      hostInsert(n2.el = hostCreateText(n2.children), el)
    } else {
      let el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        // 说明文本有更新 
        hostSetText(el, n2.children)
      }
    }
  }

  const processFragment = (n1, n2, el) => {
    if (n1 === null) {
      mountChildren(n2.children, el)
    } else {
      patchKeyedChildren(n1.children, n2.children, el)
    }
  }

  const mountComponent = (vnode, container, anchor) => {
    // 如何挂载组件 vnode是指的组件的虚拟节点，subTree是指的render函数返回的虚拟节点
    // 1. 创建实例
    const instance = vnode.component = createComponentInstance(vnode) // 让虚拟节点知道对应的组件是谁
    // 2. 给实例赋予属性
    setupComponent(instance) // 设置instance属性
    // 3. 创建组件的effect
    setupRenderEffect(instance, container, anchor)    
  }

  const updateProps = (prevProps, nextProps) => {
    // 样式问题
    debugger
    for (const key in nextProps) {
      prevProps[key] = nextProps[key]
    }
    for (const key in prevProps) {
      if (!(key in nextProps)) {
        delete prevProps[key]
      }
    }
  }
  const updateComponentPrevRender = (instance, next) => {
    instance.next = null
    instance.vnode = next // 用新的虚拟节点替换成老的

    updateProps(instance.props, next.props) 

    // 还差一个插槽更新
  }
  const setupRenderEffect = (instance, container, anchor) => {
    const render = instance.render
    const componentFn = () => {
      // 稍后组件更新会执行这个方法
      if (!instance.isMounted) {
        const subTree = render.call(instance.proxy)
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        instance.subTree = subTree
      } else {
        let { next } = instance
        if (next) {
          // 如果有next，说明属性或者插槽要更新嘞。

          updateComponentPrevRender(instance, next) // 给属性赋值会导致页面更新
        }
        // 数据变化导致的更新
        const subTree = render.call(instance.proxy) // 这里也更新了
        patch(instance.subTree, subTree, container, anchor)
        instance.subTree = subTree
      }
    }
    const effect = new ReactiveEffect(componentFn, () => {
      queueJob(instance.update)
    })
    const update = (instance.update = effect.run.bind(effect))
    update()
  }

  const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
    let l1 = Object.keys(prevProps)
    let l2 = Object.keys(nextProps)
    if (l1.length !== l2.length) {
      return true
    }
    for (let i = 0; i < l2.length; i++) {
      const key = l2[i]
      if (nextProps[key] !== prevProps[key]) {
        return true
      }
    }
    return false
  }

  const shouldComponentUpdate = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1
    const { props: nextProps, children: nextChildren } = n2
    
    if (prevChildren || nextChildren) {
      // 如果组件有插槽，那就意味着组件要更新
      return true
    }

    if (prevProps === nextProps) {
      return false
    }
    return hasPropsChanged(prevProps, nextProps)

  }

  const updateComponent = (n1, n2) => {
    // 复用组件
    let instance = (n2.component = n1.component)
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2 // 我们将新虚拟节点挂载到实例上
      instance.update()
    }
  }

  const processComponent = (n1, n2, container, anchor) => {
    if (n1 === null) { 
      // 组件初渲染
      mountComponent(n2, container, anchor)
    } else {
      // 组件挂载或者初始化渲染
      updateComponent(n1, n2)
    }
  }

  const patch = (n1, n2, container, anchor = null) => {
    console.log('第三部进行patch', n1, n2, container)
    if (n1 === n2) {
      // 无需更新
      return
    } 

    // div =---- > p
    // 如果n1、n2都有值，则删除n1换n2
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    let { shapeFlag, type } = n2

    switch (type) {
      case Text: 
      // 处理文本
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default: 
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container, anchor)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(n1, n2, container, anchor)
      }
    }
  }
  const render = (vnode, container) => {
    debugger
    console.log('第一步，执行render函数', vnode, container)
    // vnode + dom api ==> 转为真实dom 插入到container中
    if (vnode === null) {
      // 1. 删除 或者卸载节点
      if (container._vnode) { // 说明渲染过了，我才会进行卸载操作
        unmount(container._vnode)
      }
    } else {
      // 初次渲染或者更新
      console.log('第二部，初次渲染，全新的插入到', container._vnode, vnode, container)
      patch(container._vnode || null, vnode, container)

    }
    container._vnode = vnode;
  }

  function getSequence (arr) { // 二分查找加贪心算法
    let len = arr.length
    let result = [0]
    let resultLastIndex
    let middle
    let start, end
    let p = arr.slice(0) // 用来标识索引
  
    for (let i = 0; i < arr.length; i++) {
      // 1. 只是为了不用每次都重新获取arr[i]
      const arrI = arr[i]
      // 2. 这个是vue3diff自己的最长递增子序列
      if (arrI !== 0) {
        // 3. 拿到之前定义的result最后一个值，因为最后一个值是最大的值
        resultLastIndex = result[result.length - 1]
        // 如果result最后的值要是比arrI小，就将arrI push进来
        if (arr[resultLastIndex] < arrI) {
          result.push(i)
          p[i] = resultLastIndex // 让当前最后一项记住前一项的索引
          continue
        }
  
        start = 0
        end = result.length - 1
        middle;
        while (start < end) {
          middle = (end + start) / 2 | 0
          if (arr[result[middle]] < arrI) {
            start = middle + 1
          } else {
            end = middle
          }
        }
  
        if (arrI < arr[result[start]]) {
          p[i] = result[start - 1] // 记住换的那个前一项的索引
          result[start] = i
        }
      }
    }
    // 追溯
    let i = result.length
    let last = result[i - 1] // 最后一项的索引
    console.log(p)
    while (i-- > 0) {
      result[i] = last // 用最后一项的索引来追溯
      last = p[last] // 用p的索引来追溯
    } 
  
    return result
  }

  return {
    render
  }
}