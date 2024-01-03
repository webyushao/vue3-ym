
import { patchClass } from './modules/class'
import { patchStyle } from './modules/style'
import { patchEvent } from './modules/event'
import { patchAttr } from './modules/attr'


export const patchProp = (el, key, prevValue, nextValue) => {
  // class style event attr

  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') { 
    // { color: 'red', background: 'red' } { color: 'red'} 

    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // 事件 addEventlistener, removeAddEventListener // 开始有 后来没有
    // @click fn1 @click fn2 // 之前有，之后也有
    // @click=() => fn1() @click= () => fn2()
    // invoker.fn1 = fn1
    // invoker.fn2 = fn2
    // @click = () => invoker.fn()
    patchEvent(el, key, nextValue)
  } else {
    // attr
    patchAttr(el, key, nextValue)
  }
}