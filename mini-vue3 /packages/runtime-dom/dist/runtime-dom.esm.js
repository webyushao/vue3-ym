// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(tagName) {
    return document.createElement(tagName);
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    return node.nodeValue = text;
  }
};

// packages/runtime-dom/src/modules/class.ts
var patchClass = (el, value) => {
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};

// packages/runtime-dom/src/modules/style.ts
var patchStyle = (el, prev, next) => {
  if (next) {
    const style = el.style;
    for (let key in next) {
      style[key] = next[key];
    }
    for (let key in prev) {
      if (next[key] == null) {
        style[key] = null;
      }
    }
  } else {
    el.removeAttribute("style");
  }
};

// packages/runtime-dom/src/modules/event.ts
function createInvoker(initialValue) {
  const invoker = (e) => invoker.value(e);
  invoker.value = initialValue;
  return invoker;
}
function patchEvent(el, key, nextValue) {
  const invokers = el._vei || (el._vei = {});
  const eventName = key.slice(2).toLowerCase();
  const existingInvoker = invokers[eventName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue);
      el.addEventListener(eventName, invoker);
    } else if (existingInvoker) {
      el.removeAddEventListener(eventName, existingInvoker);
      invokers[eventName] = null;
    }
  }
}

// packages/runtime-dom/src/modules/attr.ts
var patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};

// packages/runtime-dom/src/pathProp.ts
var patchProp = (el, key, prevValue, nextValue) => {
  if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
};

// packages/shared/src/shapeFlag.ts
console.log(6 /* COMPONENT */ & 2 /* FUNCTIONAL_COMPONENT */);

// packages/shared/src/index.ts
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isFunction = (value) => {
  return typeof value === "function";
};
var isArray = Array.isArray;
var isString = (value) => {
  return typeof value === "string";
};
var ownProperty = Object.prototype.hasOwnProperty;
var hasOwn = (key, value) => ownProperty.call(value, key);

// packages/runtime-core/src/vnode.ts
var Text = Symbol("text");
var Fragment = Symbol("Fragment");
function isVnode(vnode) {
  return vnode.__v_node == true;
}
function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function createVnode(type, props = null, children = null) {
  let shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 6 /* COMPONENT */ : 0;
  const vnode = {
    __v_node: true,
    type,
    props,
    children,
    shapeFlag,
    key: props == null ? void 0 : props.key,
    el: null
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else {
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag = vnode.shapeFlag | type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      }
      return createVnode(type, propsOrChildren);
    } else {
      return createVnode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
}

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
      return this.fn();
    }
    try {
      this.parent = activeEffect;
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
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, type, key) {
  debugger;
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
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}

// packages/runtime-core/src/scheduler.ts
var queue = [];
var isFlashing = false;
var reslovePromise = Promise.resolve();
var queueJob = (job) => {
  console.log(job, "job");
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlashing) {
    isFlashing = true;
    reslovePromise.then(() => {
      console.log(queue, "QUEUE");
      isFlashing = false;
      const copy = queue.slice(0);
      queue.length = 0;
      copy.forEach((c) => {
        c();
      });
    });
  }
};

// packages/reactivity/src/baseHandler.ts
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

// packages/runtime-core/src/componnetProps.ts
function initProps(instance, rawProps) {
  console.log(instance, rawProps);
  const props = {};
  const attrs = {};
  const options = instance.propsOptions;
  if (rawProps) {
    for (let key in rawProps) {
      const val = rawProps[key];
      if (key in options) {
        props[key] = val;
      } else {
        attrs[key] = val;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}

// packages/runtime-core/src/component.ts
var currentInstance;
function setCurrentInstance(instance) {
  return currentInstance = instance;
}
function getCurrentInstance() {
  return currentInstance;
}
function createComponentInstance(vnode) {
  const instance = {
    data: null,
    isMounted: false,
    vnode,
    subTree: null,
    update: null,
    propsOptions: vnode.type.props || {},
    proxy: null,
    props: {},
    attrs: {},
    setupState: null,
    exposed: null
  };
  return instance;
}
var publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props
};
var publicInstanceProxyHandler = {
  get(target, key) {
    let { data, props, setupState } = target;
    if (data && hasOwn(key, data)) {
      return data[key];
    } else if (hasOwn(key, props)) {
      return props[key];
    } else if (setupState && hasOwn(key, setupState)) {
      return setupState[key];
    }
    const getter = publicProperties[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    let { data, props, setupState } = target;
    if (hasOwn(key, data)) {
      data[key] = value;
    } else if (hasOwn(key, props)) {
      console.warn(`props\u5C5E\u6027\u4E0D\u80FD\u4FEE\u6539`);
      return false;
    } else if (setupState && hasOwn(key, setupState)) {
      setupState[key] = value;
    }
    return true;
  }
};
function setupComponent(instance) {
  const { type, props } = instance.vnode;
  initProps(instance, props);
  instance.proxy = new Proxy(instance, publicInstanceProxyHandler);
  let { setup } = type;
  if (setup) {
    const setupContext = {
      attrs: instance.attrs,
      props: instance.props,
      emits: (events, ...args) => {
        const eventName = `on${events[0].toLowercase() + events.slice(1)}`;
        const handler = instance.vnode.props[eventName];
        handler && handler(...args);
      },
      expose(exposed) {
        instance.expose = exposed;
      }
    };
    setCurrentInstance(instance);
    let setupResult = setup(instance.props, setupContext);
    setCurrentInstance(null);
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = setupResult;
    }
  }
  let data = type.data;
  if (data) {
    if (isFunction(data)) {
      instance.data = reactive(data.call(instance.proxy));
    }
  }
  instance.render = type.render;
}

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
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
  } = options;
  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  };
  const unmount = (vnode) => {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children);
    }
    hostRemove(vnode.el);
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };
  const mountElement = (vnode, container, anchor) => {
    console.log("\u7B2C\u4E94\u6B65mountELement", vnode, container);
    const { type, props, children, shapeFlag } = vnode;
    const el = vnode.el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el);
    } else if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prev = oldProps[key];
        console.log(prev, "prec");
        const next = newProps[key];
        if (prev != next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      for (let key in oldProps) {
        if (!(key in newProps)) {
          const prev = oldProps[key];
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, el) => {
    debugger;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      let s1 = i;
      let s2 = i;
      const keytoNewIndexToMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 < e2; i2++) {
        const vnode = c2[i2];
        keytoNewIndexToMap.set(vnode.key, i2);
      }
      const toBePatch = e2 - s2 + 1;
      const newIndexToOldIndex = new Array(toBePatch).fill(0);
      for (let i2 = s1; i2 < e1; i2++) {
        const child = c1[i2];
        let newIndex = keytoNewIndexToMap.get(child.key);
        if (newIndex === void 0) {
          unmount(child);
        } else {
          newIndexToOldIndex[newIndex - s2] = i2 + 1;
          patch(child, c2[newIndex], el);
        }
      }
      console.log(newIndexToOldIndex);
      const seq = getSequence(newIndexToOldIndex);
      let j = seq.length - 1;
      for (let i2 = toBePatch; i2 >= 0; i2--) {
        const nextIndex = s2 + i2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndex[i2] === 0) {
          patch(null, nextChild, el, anchor);
        } else {
          if (i2 !== seq[j]) {
            hostInsert(nextChild.el, el, anchor);
          } else {
            j--;
          }
        }
      }
    }
  };
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (n1, n2) => {
    const el = n2.el = n1.el;
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el);
  };
  const processElement = (n1, n2, container, anchor) => {
    console.log("\u7B2C\u56DB\u90E8processElement", n1, n2, container);
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };
  const processText = (n1, n2, el) => {
    if (n1 === null) {
      hostInsert(n2.el = hostCreateText(n2.children), el);
    } else {
      let el2 = n2.el = n1.el;
      if (n1.children !== n2.children) {
        hostSetText(el2, n2.children);
      }
    }
  };
  const processFragment = (n1, n2, el) => {
    if (n1 === null) {
      mountChildren(n2.children, el);
    } else {
      patchKeyedChildren(n1.children, n2.children, el);
    }
  };
  const mountComponent = (vnode, container, anchor) => {
    const instance = vnode.component = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  };
  const updateProps = (prevProps, nextProps) => {
    debugger;
    for (const key in nextProps) {
      prevProps[key] = nextProps[key];
    }
    for (const key in prevProps) {
      if (!(key in nextProps)) {
        delete prevProps[key];
      }
    }
  };
  const updateComponentPrevRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance.props, next.props);
  };
  const setupRenderEffect = (instance, container, anchor) => {
    const render3 = instance.render;
    const componentFn = () => {
      if (!instance.isMounted) {
        const subTree = render3.call(instance.proxy);
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        instance.subTree = subTree;
      } else {
        let { next } = instance;
        if (next) {
          updateComponentPrevRender(instance, next);
        }
        const subTree = render3.call(instance.proxy);
        patch(instance.subTree, subTree, container, anchor);
        instance.subTree = subTree;
      }
    };
    const effect2 = new ReactiveEffect(componentFn, () => {
      queueJob(instance.update);
    });
    const update = instance.update = effect2.run.bind(effect2);
    update();
  };
  const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
    let l1 = Object.keys(prevProps);
    let l2 = Object.keys(nextProps);
    if (l1.length !== l2.length) {
      return true;
    }
    for (let i = 0; i < l2.length; i++) {
      const key = l2[i];
      if (nextProps[key] !== prevProps[key]) {
        return true;
      }
    }
    return false;
  };
  const shouldComponentUpdate = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1;
    const { props: nextProps, children: nextChildren } = n2;
    if (prevChildren || nextChildren) {
      return true;
    }
    if (prevProps === nextProps) {
      return false;
    }
    return hasPropsChanged(prevProps, nextProps);
  };
  const updateComponent = (n1, n2) => {
    let instance = n2.component = n1.component;
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2;
      instance.update();
    }
  };
  const processComponent = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountComponent(n2, container, anchor);
    } else {
      updateComponent(n1, n2);
    }
  };
  const patch = (n1, n2, container, anchor = null) => {
    console.log("\u7B2C\u4E09\u90E8\u8FDB\u884Cpatch", n1, n2, container);
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    let { shapeFlag, type } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container);
        break;
      default:
        if (shapeFlag & 1 /* ELEMENT */) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & 6 /* COMPONENT */) {
          processComponent(n1, n2, container, anchor);
        }
    }
  };
  const render2 = (vnode, container) => {
    debugger;
    console.log("\u7B2C\u4E00\u6B65\uFF0C\u6267\u884Crender\u51FD\u6570", vnode, container);
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      console.log("\u7B2C\u4E8C\u90E8\uFF0C\u521D\u6B21\u6E32\u67D3\uFF0C\u5168\u65B0\u7684\u63D2\u5165\u5230", container._vnode, vnode, container);
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  function getSequence(arr) {
    let len = arr.length;
    let result = [0];
    let resultLastIndex;
    let middle;
    let start, end;
    let p = arr.slice(0);
    for (let i2 = 0; i2 < arr.length; i2++) {
      const arrI = arr[i2];
      if (arrI !== 0) {
        resultLastIndex = result[result.length - 1];
        if (arr[resultLastIndex] < arrI) {
          result.push(i2);
          p[i2] = resultLastIndex;
          continue;
        }
        start = 0;
        end = result.length - 1;
        middle;
        while (start < end) {
          middle = (end + start) / 2 | 0;
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arrI < arr[result[start]]) {
          p[i2] = result[start - 1];
          result[start] = i2;
        }
      }
    }
    let i = result.length;
    let last = result[i - 1];
    console.log(p);
    while (i-- > 0) {
      result[i] = last;
      last = p[last];
    }
    return result;
  }
  return {
    render: render2
  };
}

// packages/runtime-core/src/apilifecycle.ts
var lifecycleHooks = /* @__PURE__ */ ((lifecycleHooks2) => {
  lifecycleHooks2["BEFORE_MOUNT"] = "bm";
  lifecycleHooks2["MOUNTED"] = "m";
  lifecycleHooks2["BEFORE_UPDATE"] = "bu";
  lifecycleHooks2["UPDATED"] = "u";
  return lifecycleHooks2;
})(lifecycleHooks || {});
function createHook(type) {
  return (hook, target = currentInstance) => {
    if (target) {
      const warpperHooks = () => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null);
      };
      const hooks = target[type] || (target[type] = []);
      console.log(warpperHooks);
    }
  };
}
var onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
var onMounted = createHook("m" /* MOUNTED */);
var onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
var onUpdated = createHook("u" /* UPDATED */);

// packages/runtime-core/src/asyncComponent.ts
function defineAsyncComponent(loader) {
  let Component = null;
  return {
    setup() {
      const load = ref(false);
      loader.then((c) => {
        Component = c;
        load.value = true;
      });
      return () => {
        return load.value ? h(Component) : h(Fragment, [h(Text, "hello")]);
      };
    }
  };
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { patchProp });
console.log(renderOptions, "renderOptions");
var render = (vnode, container) => {
  createRenderer(renderOptions).render(vnode, container);
};
export {
  Fragment,
  Text,
  createComponentInstance,
  createRenderer,
  createVnode,
  currentInstance,
  defineAsyncComponent,
  getCurrentInstance,
  h,
  isSameVnode,
  isVnode,
  lifecycleHooks,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  render,
  setCurrentInstance,
  setupComponent
};
//# sourceMappingURL=runtime-dom.esm.js.map
