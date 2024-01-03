import { currentInstance, setCurrentInstance } from "./component"


export const enum lifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHook (type) {
  // type是绑定到哪里 hook就是用户传递的钩子
  return (hook, target = currentInstance) => {
    if (target) {
      const warpperHooks = () => {
        setCurrentInstance(target)
        hook()
        setCurrentInstance(null)
      }
      const hooks = target[type] || (target[type] = [])
      console.log(warpperHooks)
    }
  }
}

export const onBeforeMount = createHook(lifecycleHooks.BEFORE_MOUNT)

export const onMounted = createHook(lifecycleHooks.MOUNTED)

export const onBeforeUpdate = createHook(lifecycleHooks.BEFORE_UPDATE)

export const onUpdated  = createHook(lifecycleHooks.UPDATED)