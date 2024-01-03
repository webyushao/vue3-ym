export const isObject = (value) => {
  return typeof value === 'object' && value !== null
}

export const isFunction = (value) => {
  return typeof value === 'function'
}


export const assign = Object.assign

export const isArray = Array.isArray

export const isString = (value) => {
  return typeof value === 'string'
}

export const isNumber = (value) => {
  return typeof value === 'number'
}

const ownProperty = Object.prototype.hasOwnProperty

export const hasOwn = (key, value) => ownProperty.call(value, key)

export * from './shapeFlag'