import { recordEffectScope } from "./effectScope";

export let activeEffect = undefined // 当前正在运行的effect是谁

function clearupEffect (effect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect) // 解除effect，重新依赖收集
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  // 这里表示在实例上加了fn属性
  public active = true; // 这个effect默认是激活状态
  public deps = []
  public parent = null;

  constructor (public fn, private scheduler?) { // 加了public之后，用户传递的参数也会在this上，this.fn
    recordEffectScope(this)
  }
  run () { // 就是执行effect
    if (!this.active) { return this.fn() } // 如果这里是非激活状态，只需要执行函数，不需要进行依赖收集

    // 这里就要做依赖收集了， 核心就是当前的 effect 和稍后渲染的 属性关联 在一起，
    try {
      this.parent = activeEffect; // 这里是记录如果effect嵌套情况，记录当前的effect是谁，方便找到
      activeEffect = this;

      // 这里我们需要在用户执行函数之前将之前收集的内容清空，在重新收集
      clearupEffect(this)

      return this.fn(); // 当稍后调用取值操作的时候，就可以获取全局的effect
    } finally {
      activeEffect = this.parent;
      this.parent = null;
    }
  }
  stop () {// 先将effect清空掉。在变成失活态
    this.active = false;
    clearupEffect(this);
  }
}

// 依赖收集就是把当前的，变成全局的，稍后取值的时候可以拿到全局的effect，之后会触发proxy的get方法，就可以将effect和key关联起来。
export function effect (fn, options: any={}) {// 1. 创建一个effect函数
  // 这里的fn可以根据状态变化重新执行，effect可以嵌套使用
  const _effect = new ReactiveEffect(fn, options.scheduler); // 2. 创建响应式的effect
  _effect.run(); // 3. 执行
  const runner = _effect.run.bind(_effect) // 绑定this指向, 保证在执行的时候当前的this是effect
  runner.effect = _effect // 将effect挂载到runner函数上
  return runner
}

// 一个effect对应多个属性，一个属性对应多个effect
// 结论多对多
const targetMap = new WeakMap();
export function track (target, type, key) {
  debugger
  // 对象： 某个属性》》 多个effect
  // let mapping = { 一对多的关系
  //   target: {
  //     key: [effect, effect, effect]
  //   }
  // }
  if (!activeEffect) return;
  let depsMap = targetMap.get(target); // 第一次没有
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  console.log(targetMap, 'targteMap')
  trackEffect(dep)
  // let shouldTrack = !dep.has(activeEffect); // 去重了
  // if (shouldTrack) {
  //   dep.add(activeEffect);
  //   activeEffect.deps.push(dep) // 让effect记录对应的dep，稍后清理的时候会用到
  // }
  // 单项指的是，属性记录了effect， 反向记录，
  // 应该让effect也记录他被哪些属性收集过，这样做的好处是Eileen可以清理
  // 对象： 某个属性 》》 多个effect
  // WeakMap = {对象： { Map: {name: Set -》 effect }}}
}

export function trackEffect(dep) {
  let shouldTrack = !dep.has(activeEffect); // 去重了
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep) // 让effect记录对应的dep，稍后清理的时候会用到
  }
}


export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return; // 触发的值不在模版中使用，不更新
  let effects = depsMap.get(key); // 找到了属性对应的effect
  if (effects) {
    triggerEffect(effects)
    // 永远在执行之前先拷贝一份，不要关联引用
    // effects = new Set(effects)
    // effects.forEach(effect => {
    //   // 我们在执行effect的时候，又要执行自己，那我们就需要屏蔽掉，不要无限调用
    //   if (effect !== activeEffect) {
    //     if (effect.scheduler) {
    //       effect.scheduler() // 如果用户传入了调度函数，则用用户的
    //     } else {
    //       effect.run() // 否则刷新默认视图
    //     }
    //   }
    // })
  }
}

export function triggerEffect (effects) {
  // 永远在执行之前先拷贝一份，不要关联引用
  effects = new Set(effects)
  effects.forEach(effect => {
    // 我们在执行effect的时候，又要执行自己，那我们就需要屏蔽掉，不要无限调用
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler() // 如果用户传入了调度函数，则用用户的
      } else {
        effect.run() // 否则刷新默认视图
      }
    }
  })
}

// 1. 先搞了一个响应式对象 new Proxy
// 2. effect 默认数据变化要能更新，
// 我们先将正在执行的effect作为全局变量，渲染（取值），我们在get方法中进行依赖收集
// 3、weakMap (对象： Map(key: set))
// 4 稍后用户发生数据变化，会通过对象属性来查找对应的effect集合，找到effect全部执行






