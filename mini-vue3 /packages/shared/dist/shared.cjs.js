var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/shared/src/index.ts
var src_exports = {};
__export(src_exports, {
  ShapeFlags: () => ShapeFlags,
  assign: () => assign,
  isArray: () => isArray,
  isFunction: () => isFunction,
  isNumber: () => isNumber,
  isObject: () => isObject,
  isString: () => isString
});
module.exports = __toCommonJS(src_exports);

// packages/shared/src/shapeFlag.ts
var ShapeFlags = /* @__PURE__ */ ((ShapeFlags2) => {
  ShapeFlags2[ShapeFlags2["ELEMENT"] = 1] = "ELEMENT";
  ShapeFlags2[ShapeFlags2["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
  ShapeFlags2[ShapeFlags2["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
  ShapeFlags2[ShapeFlags2["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
  ShapeFlags2[ShapeFlags2["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
  ShapeFlags2[ShapeFlags2["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
  ShapeFlags2[ShapeFlags2["TELEPORT"] = 64] = "TELEPORT";
  ShapeFlags2[ShapeFlags2["SUSPENSE"] = 128] = "SUSPENSE";
  ShapeFlags2[ShapeFlags2["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
  ShapeFlags2[ShapeFlags2["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
  ShapeFlags2[ShapeFlags2["COMPONENT"] = 6] = "COMPONENT";
  return ShapeFlags2;
})(ShapeFlags || {});
console.log(6 /* COMPONENT */ & 2 /* FUNCTIONAL_COMPONENT */);

// packages/shared/src/index.ts
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isFunction = (value) => {
  return typeof value === "function";
};
var assign = Object.assign;
var isArray = Array.isArray;
var isString = (value) => {
  return typeof value === "string";
};
var isNumber = (value) => {
  return typeof value === "number";
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ShapeFlags,
  assign,
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString
});
//# sourceMappingURL=shared.cjs.js.map
