

// 元素的增删改查、查找关系、文本的增删改查
export const nodeOps = {
  createElement (tagName) {
    return document.createElement(tagName)
  },
  // 增
  insert (child, parent, anchor) { // 插入某个节点。
    parent.insertBefore(child, anchor || null)
  },
  remove (child) {
    const parent = child.parentNode
    if (parent) {
       parent.removeChild(child)
    }
  },
  querySelector (selector) {
    return document.querySelector(selector)
  },
  parentNode (node) {
    return node.parentNode
  },
  nextSibling (node) {
    return node.nextSibling
  },
  setElementText (el, text) {
    el.textContent = text
  },
  createText (text) {
    return document.createTextNode(text)
  },
  setText (node, text) {
    return node.nodeValue = text
  }
}