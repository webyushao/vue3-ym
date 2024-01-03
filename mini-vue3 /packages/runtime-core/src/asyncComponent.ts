import { Fragment, Text } from "./vnode"
import { h } from './h'
import { ref } from '@vue/reactivity'
export function defineAsyncComponent (loader) {
  let Component = null

  return {



    setup () {
      const load = ref(false)

      loader.then(c => {
        Component = c
        load.value = true
      })

      return () => {
        return load.value ? h(Component) : h(Fragment, [h(Text, 'hello')])
      }
    }
  }
}