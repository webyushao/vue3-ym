export const enum ShapeFlags {
  ELEMENT = 1, // 虚拟节点是元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2, // 普通组件
  TEXT_CHILDREN = 1 << 3, // 儿子是文本
  ARRAY_CHILDREN = 1 << 4,// 儿子是数组
  SLOTS_CHILDREN = 1 << 5,// 插槽
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

// <<  移位符  << 1 为 00000001 <<2 为 00000010        1 < 1 值为2 也就是1*2  向左移动一位就是对它做了个乘以2
// | 或 有一个是1,就是1
// & 都是1才是1

// 用大的和小的做与运算，> 0 就说明涵盖
console.log(ShapeFlags.COMPONENT & ShapeFlags.FUNCTIONAL_COMPONENT)