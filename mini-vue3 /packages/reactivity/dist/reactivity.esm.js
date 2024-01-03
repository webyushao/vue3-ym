// packages/reactivity/src/effectScope.ts
var aciveEffectScope;
function recordEffectScope(effect2) {
  if (aciveEffectScope && aciveEffectScope.active) {
    aciveEffectScope.effects.push(effect2);
  }
}

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function clearupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = null;
    recordEffectScope(this);
  }
  run() {
    if (!this.active) {
      this.fn();
    }
    try {
      parent = activeEffect;
      activeEffect = this;
      clearupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = null;
    }
  }
  stop() {
    this.active = false;
    clearupEffect(this);
  }
};
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, type, key) {
  if (!activeEffect)
    return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Set());
  }
  console.log(targetMap, "targteMap");
  trackEffect(dep);
}
function trackEffect(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap)
    return;
  let effects = depsMap.get(key);
  if (effects) {
    triggerEffect(effects);
  }
}
function triggerEffect(effects) {
  effects = new Set(effects);
  effects.forEach((effect2) => {
    console.log(effect2, activeEffect, "\u662F\u5426\u76F8\u540C");
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}

// packages/shared/src/index.ts
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isFunction = (value) => {
  return typeof value === "function";
};
var isArray = Array.isArray;

// packages/reactivity/src/baseHandler.ts
function isReactive(target) {
  return !!(target && target["__v_isReactive" /* IS_REACTIVE */]);
}
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, "get", key);
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, "set", key, value, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
console.log(0 /* status1 */, 1 /* status2 */, 2 /* status3 */);
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  let exisitingProxy = reactiveMap.get(target);
  if (exisitingProxy) {
    return exisitingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this.effect = void 0;
    this._dirty = true;
    this._value = "";
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
      triggerEffect(this.dep);
    });
  }
  get value() {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
var computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("no setter");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
};

// packages/reactivity/src/watch.ts
function traverse(source, s = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (s.has(source)) {
    return source;
  }
  s.add(source);
  for (let key in source) {
    traverse(source[key], s);
  }
  return source;
}
function doWatch(source, cb, { immediate } = {}) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  let cleanup;
  const onCleanUp = function(usercb) {
    cleanup = usercb;
  };
  const job = () => {
    if (cb) {
      const newValue = effect2.run();
      if (cleanup)
        cleanup();
      cb(newValue, oldValue, onCleanUp);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (immediate) {
    return job();
  }
  oldValue = effect2.run();
}
function watch(source, cb, options) {
  doWatch(source, cb, options);
}
function watchEffect(effect2, options) {
  doWatch(effect2, null, options);
}

// packages/reactivity/src/ref.ts
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
function ref(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = void 0;
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffect(this.dep);
    }
  }
};
var ObjectRefImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
};
function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}
function toRefs(object) {
  const ret = {};
  for (let key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
export {
  computed,
  effect,
  reactive,
  ref,
  toRef,
  toRefs,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.esm.js.map
