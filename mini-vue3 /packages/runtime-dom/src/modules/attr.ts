
export const patchAttr = (el, key, value) => {
  if (value == null) { // 如果没有类名就是移除
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
   }
}