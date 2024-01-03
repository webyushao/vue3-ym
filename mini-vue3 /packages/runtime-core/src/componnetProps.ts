import { reactive } from '@vue/reactivity' 
export function initProps (instance, rawProps) {
  console.log(instance, rawProps)
  const props = {}
  const attrs = {}
  const options = instance.propsOptions
  if (rawProps) {
    for (let key in rawProps) {
      const val = rawProps[key]
      if (key in options) {
        props[key] = val
      } else {
        attrs[key] = val
      }
    }
  }
  instance.props = reactive(props) // 源码上使用的是shallreactive, 
  instance.attrs = attrs
}

