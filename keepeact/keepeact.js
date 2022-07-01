function isEmpty(value) {
  return Array.isArray(value) ? value.length === 0 : value == null;
}
const toKebabCase = (value) => value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
const handlers = ["onclick", "onClick", "onchange", "onChange", "oninput", "onInput"];
class VNode {
  constructor(type, attributes, listeners, children, text) {
    this.type = type;
    this.children = children;
    this.text = text;
    this.attributes = attributes;
    this.listeners = listeners;
    this.key = attributes && attributes.key;
  }
}
function createVNode(type, props, ...children) {
  const attributes = props && Object.keys(props).filter((v) => !handlers.includes(v)).reduce((pre, cur) => {
    pre[cur] = props[cur];
    return pre;
  }, {});
  const listeners = props && Object.keys(props).filter((v) => handlers.includes(v)).reduce((pre, cur) => {
    pre[cur] = props[cur];
    return pre;
  }, {});
  const vchildren = children && children.flat(2).map((v) => {
    return (v == null ? void 0 : v.type) != null ? v : createTextVNode(v);
  });
  return new VNode(type, attributes, listeners, vchildren, void 0);
}
function createTextVNode(text) {
  return new VNode(void 0, void 0, void 0, void 0, String(text) || "");
}
function isVText(vnode) {
  return vnode.text != null;
}
function isVDom(vnode) {
  return typeof vnode.type === "string";
}
function isVComponent(vnode) {
  return typeof vnode.type === "function" && vnode.type.prototype && vnode.type.prototype.render;
}
class Diff {
  constructor(dom) {
    this.dom = dom;
  }
  sameVNode(a, b) {
    if (a.type === b.type && a.key === b.key && this.sameInputType(a, b)) {
      return true;
    }
  }
  sameInputType(a, b) {
    if (a.type !== "input") {
      return true;
    }
    const a1 = a.attributes.type;
    const b1 = b.attributes.type;
    if (a1 == null && b1 == null) {
      return true;
    }
    return a1 === b1;
  }
  patch(oldVNode, newVNode) {
    this.checkDuplicateKeys(newVNode.children);
    if (this.sameVNode(oldVNode, newVNode)) {
      this.patchVNode(oldVNode, newVNode);
    } else {
      const oldElmParent = oldVNode.elm.parentNode;
      this.dom.createElement(newVNode);
      this.dom.insertBefore(oldElmParent, newVNode.elm, oldVNode.elm);
      this.dom.removeChild(oldElmParent, oldVNode.elm);
    }
  }
  patchVNode(oldVNode, newVNode) {
    if (newVNode === oldVNode) {
      return;
    }
    const elm = newVNode.elm = oldVNode.elm;
    if (isVText(newVNode)) {
      if (isVText(oldVNode) && newVNode.text !== oldVNode.text) {
        oldVNode.elm.data = newVNode.text;
      }
    } else if (isVDom(oldVNode) && isVDom(newVNode)) {
      this.dom.updateVDom(elm, oldVNode, newVNode);
      if (!isEmpty(oldVNode.children) && !isEmpty(newVNode.children) && oldVNode.children !== newVNode.children) {
        this.updateChildren(elm, oldVNode.children, newVNode.children);
      } else if (!isEmpty(newVNode.children)) {
        newVNode.children.forEach((v) => {
          this.dom.createElement(v);
          this.dom.appendChild(elm, v.elm);
        });
      } else if (!isEmpty(oldVNode.children)) {
        this.dom.removeChildren(elm);
      }
    }
    if (isVComponent(oldVNode) && isVComponent(newVNode)) {
      newVNode.component = oldVNode.component;
    }
  }
  updateChildren(parentNode, oldChild, newChild) {
    let oldStartIndx = 0;
    let newStartIndx = 0;
    let oldEndIndx = oldChild.length - 1;
    let newEndIndx = newChild.length - 1;
    let oldStartNode = oldChild[0];
    let oldEndNode = oldChild[oldEndIndx];
    let newStartNode = newChild[0];
    let newEndNode = newChild[newEndIndx];
    let keyMap;
    while (oldStartIndx <= oldEndIndx && newStartIndx <= newEndIndx) {
      if (oldEndNode == null) {
        oldEndNode = oldChild[--oldEndIndx];
      } else if (oldStartNode == null) {
        oldStartNode = oldChild[++oldStartIndx];
      } else if (this.sameVNode(oldStartNode, newStartNode)) {
        this.patchVNode(oldStartNode, newStartNode);
        oldStartNode = oldChild[++oldStartIndx];
        newStartNode = newChild[++newStartIndx];
      } else if (this.sameVNode(oldEndNode, newEndNode)) {
        this.patchVNode(oldEndNode, newEndNode);
        oldEndNode = oldChild[--oldEndIndx];
        newEndNode = newChild[--newEndIndx];
      } else if (this.sameVNode(oldStartNode, newEndNode)) {
        this.patchVNode(oldStartNode, newEndNode);
        this.dom.insertBefore(parentNode, oldStartNode.elm, this.dom.nextSibling(oldEndNode.elm));
        oldStartNode = oldChild[++oldStartIndx];
        newEndNode = newChild[--newEndIndx];
      } else if (this.sameVNode(oldEndNode, newStartNode)) {
        this.patchVNode(oldEndNode, newStartNode);
        this.dom.insertBefore(parentNode, oldEndNode.elm, oldStartNode.elm);
        oldEndNode = oldChild[--oldEndIndx];
        newStartNode = newChild[++newStartIndx];
      } else {
        if (!keyMap)
          keyMap = this.oldVNodeKeyToMap(oldChild, oldStartIndx, oldEndIndx);
        const indexInold = keyMap.get(newStartNode.key);
        if (indexInold == null) {
          this.dom.createElement(newStartNode);
          this.dom.insertBefore(parentNode, newStartNode.elm, oldStartNode.elm);
        } else {
          const oldNode = oldChild[indexInold];
          if (this.sameVNode(oldNode, newStartNode)) {
            this.patchVNode(oldNode, newStartNode);
            oldChild[indexInold] = void 0;
            this.dom.insertBefore(parentNode, oldNode.elm, oldStartNode.elm);
          } else {
            this.dom.createElement(newStartNode);
            this.dom.insertBefore(parentNode, newStartNode.elm, oldStartNode.elm);
          }
        }
        newStartNode = newChild[++newStartIndx];
      }
    }
    if (oldStartIndx > oldEndIndx) {
      const provit = newChild[newEndIndx + 1];
      const elm = provit ? provit.elm : null;
      for (; newStartIndx <= newEndIndx; newStartIndx++) {
        this.dom.createElement(newChild[newStartIndx]);
        this.dom.insertBefore(parentNode, newChild[newStartIndx].elm, elm);
      }
    } else if (newStartIndx > newEndIndx) {
      for (; oldStartIndx <= oldEndIndx; oldStartIndx++) {
        if (oldChild[oldStartIndx]) {
          this.dom.destroyComponents(oldChild[oldStartIndx]);
          this.dom.removeChild(parentNode, oldChild[oldStartIndx].elm);
        }
      }
    }
  }
  oldVNodeKeyToMap(oldChild, start, end) {
    const map = /* @__PURE__ */ new Map();
    for (let i = start; i <= end; i++) {
      const v = oldChild[i];
      if (v.key) {
        map.set(v.key, i);
      }
    }
    return map;
  }
  checkDuplicateKeys(child) {
    const seen = {};
    for (const vnode of child) {
      const key = vnode.key;
      if (!isEmpty(key)) {
        if (seen[key]) {
          console.warn(`Duplicate keys detected: '${key}'. This may cause an update error.`, vnode);
        } else {
          seen[key] = true;
        }
      }
    }
  }
}
var TriggleType = /* @__PURE__ */ ((TriggleType2) => {
  TriggleType2["ADD"] = "ADD";
  TriggleType2["EDIT"] = "EDIT";
  TriggleType2["DELETE"] = "DELETE";
  return TriggleType2;
})(TriggleType || {});
var SearchOriginMathods = /* @__PURE__ */ ((SearchOriginMathods2) => {
  SearchOriginMathods2["includes"] = "includes";
  SearchOriginMathods2["indexOf"] = "indexOf";
  return SearchOriginMathods2;
})(SearchOriginMathods || {});
const arrayInstrumentations = {};
const searchOriginMathods = Object.entries(SearchOriginMathods).map((v) => v[0]);
searchOriginMathods.forEach((method) => {
  arrayInstrumentations[method] = function(...args) {
    const orignMethod = Array.prototype[method];
    let res = orignMethod.apply(this, args);
    if (res === false || res === -1) {
      res = orignMethod.apply(this["_raw"], args);
    }
    return res;
  };
});
const ITERATE_KEY = Symbol();
function createReactive(obj, isShallow, isReadonly) {
  const data = new Proxy(obj, {
    get(target, key, receiver) {
      if (key === "_raw") {
        return target;
      }
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (!isReadonly) {
        track(target, key);
      }
      const res = Reflect.get(target, key, receiver);
      if (isShallow) {
        return res;
      }
      if (typeof res === "object" && res != null) {
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    },
    set(target, key, newValue, receiver) {
      if (isReadonly) {
        console.error(`\u5C5E\u6027: [${String(key)}] \u53EA\u8BFB`);
        return true;
      }
      const oldValue = target[key];
      const type = Array.isArray(target) ? Number(key) < target.length ? "EDIT" : "ADD" : target[key] ? "EDIT" : "ADD";
      const res = Reflect.set(target, key, newValue, receiver);
      const isTarget = () => receiver._raw === target;
      if (isTarget()) {
        if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
          trigger(target, key, type, newValue);
        }
      }
      return res;
    },
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (hadKey && res) {
        trigger(target, key, "DELETE");
      }
      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      track(target, Array.isArray(target) ? "length" : ITERATE_KEY);
      return Reflect.ownKeys(target);
    }
  });
  return data;
}
const reactiveMap = /* @__PURE__ */ new Map();
function reactive(obj) {
  const exisit = reactiveMap.get(obj);
  if (exisit)
    return exisit;
  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy;
}
function ref(value) {
  const wrapper = {
    value
  };
  Object.defineProperty(wrapper, "__is_ref", {
    value: true
  });
  return reactive(wrapper);
}
function readonly(obj) {
  return createReactive(obj, false, true);
}
const bucket = /* @__PURE__ */ new WeakMap();
let effectActiveFn = null;
let effectStack = [];
let shouldTrack = true;
var OriginMathods = /* @__PURE__ */ ((OriginMathods2) => {
  OriginMathods2["push"] = "push";
  OriginMathods2["pop"] = "pop";
  OriginMathods2["shift"] = "shift";
  OriginMathods2["unshift"] = "unshift";
  return OriginMathods2;
})(OriginMathods || {});
const orignMethods = Object.entries(OriginMathods).map((v) => v[0]);
orignMethods.forEach((method) => {
  arrayInstrumentations[method] = function(...args) {
    const orignMethod = Array.prototype[method];
    shouldTrack = false;
    const res = orignMethod.apply(this, args);
    shouldTrack = true;
    return res;
  };
});
function effect(fn, options) {
  const effectFn = () => {
    cleanup(effectFn);
    effectActiveFn = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    effectActiveFn = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!(options == null ? void 0 : options.lazy)) {
    effectFn();
  }
  return effectFn;
}
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const v = effectFn.deps[i];
    v.delete(effectFn);
  }
  effectFn.deps.length = 0;
}
function track(target, key) {
  if (!effectActiveFn || !shouldTrack) {
    return;
  }
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, deps = /* @__PURE__ */ new Set());
  }
  deps.add(effectActiveFn);
  effectActiveFn.deps.push(deps);
}
function trigger(target, key, type, newValue) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    return;
  }
  const effects = depsMap.get(key);
  const effectToRun = /* @__PURE__ */ new Set();
  effects == null ? void 0 : effects.forEach((fn) => {
    if (fn !== effectActiveFn) {
      effectToRun.add(fn);
    }
  });
  if (type === TriggleType.ADD || type === TriggleType.DELETE) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects == null ? void 0 : iterateEffects.forEach((fn) => {
      if (fn !== effectActiveFn) {
        effectToRun.add(fn);
      }
    });
  }
  if (type === TriggleType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get("length");
    lengthEffects == null ? void 0 : lengthEffects.forEach((fn) => {
      if (fn !== effectActiveFn) {
        effectToRun.add(fn);
      }
    });
  }
  if (key === "length" && Array.isArray(target)) {
    depsMap.forEach((effects2, key2) => {
      if (key2 >= newValue) {
        effects2 == null ? void 0 : effects2.forEach((fn) => {
          if (fn !== effectActiveFn) {
            effectToRun.add(fn);
          }
        });
      }
    });
  }
  effectToRun.forEach((fn) => {
    var _a;
    if ((_a = fn == null ? void 0 : fn.options) == null ? void 0 : _a.scheduler) {
      fn.options.scheduler(fn);
    } else {
      fn();
    }
  });
}
function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else if (typeof source === "object") {
    getter = () => options.deep ? traverse(source) : source;
  } else {
    console.error(`${source} \u4E0D\u662F\u4E00\u4E2A\u51FD\u6570\u6216\u8005\u5BF9\u8C61`);
  }
  let oldValue;
  let cleanup2;
  function onInValidate(fn) {
    cleanup2 = fn;
  }
  const job = () => {
    const newValue = effectFn();
    if (cleanup2) {
      cleanup2();
    }
    cb(oldValue, newValue, onInValidate);
    oldValue = newValue;
  };
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: job
  });
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}
function traverse(value, seen = /* @__PURE__ */ new Set()) {
  if (value == null || typeof value !== "object" || seen.has(value))
    return value;
  seen.add(value);
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      traverse(value[key], seen);
    }
  }
  return value;
}
class Dom {
  constructor(context) {
    this.context = context;
  }
  createElement(vnode) {
    var _a;
    if (isVDom(vnode)) {
      const el = document.createElement(vnode.type);
      vnode.elm = el;
      if (vnode.children) {
        vnode.children.forEach((v) => {
          const node = this.createElement(v);
          node && this.appendChild(vnode.elm, node);
        });
      }
      vnode.listeners && Object.keys(vnode.listeners).forEach((v) => {
        const name = v.toLowerCase().replace(/^on/, "");
        const value = vnode.listeners[v];
        vnode.elm.addEventListener(name, value);
      });
      vnode.attributes && Object.keys(vnode.attributes).forEach((v) => {
        const name = v;
        const value = vnode.attributes[v];
        this.setAttribute(el, name, value);
      });
      return vnode.elm;
    } else if (isVText(vnode)) {
      const text = document.createTextNode(vnode.text);
      vnode.elm = text;
    } else if (isVComponent(vnode)) {
      vnode.component = KComponent.create(vnode.type, {
        ...vnode.listeners,
        ...vnode.attributes
      });
      vnode.elm = (_a = vnode.component.$vNode) == null ? void 0 : _a.elm;
    }
    return vnode.elm;
  }
  appendChild(parentNode, newNode) {
    parentNode.appendChild(newNode);
  }
  insertBefore(parentNode, newNode, node) {
    parentNode.insertBefore(newNode, node);
  }
  removeChild(parentNode, node) {
    parentNode.removeChild(node);
  }
  removeChildren(parentNode) {
    const child = parentNode.childNodes;
    for (let i = child.length - 1; i >= 0; --i) {
      this.removeChild(parentNode, child[i]);
    }
  }
  destroyComponents(vnode) {
    var _a;
    if (isVComponent(vnode)) {
      (_a = vnode.component) == null ? void 0 : _a.destroy();
      vnode.children.forEach((c) => this.destroyComponents(c));
    }
  }
  nextSibling(node) {
    return node.nextSibling;
  }
  setAttribute(elm, key, newValue) {
    if (key === "valueChange")
      return;
    if (key === "value") {
      elm[key] = newValue;
    } else if (key === "ref") {
      this.context.$refs[newValue] = elm;
    } else if (key === "style" || key === "class") {
      const v = this.normalizeAttr(key, newValue);
      elm.setAttribute(key, v);
    } else {
      elm.setAttribute(key, newValue);
    }
  }
  styleObjToString(value) {
    let str;
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const v = value[key];
        const k = toKebabCase(key);
        if (v) {
          if (!str) {
            str = `${k}:${v}`;
          } else {
            str += `;${k}:${v}`;
          }
        }
      }
    }
    return str;
  }
  classObjToString(value) {
    let str;
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const v = value[key];
        if (v) {
          if (!str) {
            str = key;
          } else {
            str += ` ${key}`;
          }
        }
      }
    }
    return str;
  }
  normalizeAttr(attrKey, value) {
    let str;
    if (typeof value === "string") {
      return str;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      if (attrKey === "class") {
        str = this.classObjToString(value);
      } else if (attrKey === "style") {
        str = this.styleObjToString(value);
      }
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string") {
          if (!isEmpty(v)) {
            if (!str) {
              str = v;
            } else {
              str += ` ${v}`;
            }
          }
        } else if (typeof v === "object" && !Array.isArray(v)) {
          const c = this.normalizeAttr(attrKey, v);
          if (c) {
            str += ` ${c}`;
          }
        }
      }
    }
    return str;
  }
  updateVDom(elm, oldVNode, newVnode) {
    if (isVDom(newVnode) && elm instanceof HTMLElement) {
      newVnode.attributes && Object.keys(newVnode.attributes).forEach((key) => {
        const oldValue = oldVNode.attributes[key];
        const newValue = newVnode.attributes[key];
        if (oldValue === newValue) {
          return;
        } else if (!isEmpty(newValue)) {
          this.setAttribute(elm, key, newValue);
        }
      });
      oldVNode.attributes && Object.keys(oldVNode.attributes).forEach((key) => {
        const newValue = newVnode.attributes[key];
        if (isEmpty(newValue)) {
          elm.removeAttribute(key);
        }
      });
      newVnode.listeners && Object.keys(newVnode.listeners).forEach((key) => {
        const oldValue = oldVNode.listeners[key];
        const newValue = newVnode.listeners[key];
        const handleName = key.toLowerCase().replace(/^on/, "");
        if (oldValue === newValue) {
          return;
        } else if (!isEmpty(newValue)) {
          if (!isEmpty(oldValue)) {
            elm.removeEventListener(handleName, oldValue);
          }
          elm.addEventListener(handleName, newValue);
        }
      });
      oldVNode.listeners && Object.keys(oldVNode.listeners).forEach((key) => {
        const newValue = newVnode.listeners[key];
        const handleName = key.toLowerCase().replace(/^on/, "");
        if (isEmpty(newValue)) {
          elm.addEventListener(handleName, newValue);
        }
      });
    }
  }
}
var ChangeDetectionStrategy = /* @__PURE__ */ ((ChangeDetectionStrategy2) => {
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["Onpush"] = 0] = "Onpush";
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["Default"] = 1] = "Default";
  return ChangeDetectionStrategy2;
})(ChangeDetectionStrategy || {});
function Component(options) {
  const s = (arg) => {
  };
  const r = (arg) => {
  };
  const stage = {
    render: r,
    setup: s
  };
  return function(arg) {
    var _a, _b;
    arg.create = function(container, p2) {
      mountComponent(container, {
        content: arg,
        props: p2
      });
    };
    arg.prototype.$stage = (_a = options == null ? void 0 : options.changeDetection) != null ? _a : 1;
    (_b = stage[ChangeDetectionStrategy[options == null ? void 0 : options.changeDetection]]) == null ? void 0 : _b.call(stage, arg);
  };
}
function Watch(path, options = {}) {
  return createDecorator((ctx, target, name) => {
    const cb = target[name];
    const pathList = path.trim().split(".");
    let objValue = ctx;
    let lastPath = pathList[pathList.length - 1];
    for (const key of pathList) {
      if (key === lastPath) {
        break;
      }
      objValue = objValue[key];
    }
    const obj = objValue[lastPath]["_raw"];
    const value = createComponentPropsReactive(objValue, lastPath);
    watch(typeof obj === "object" ? value.value : () => value.value, (...arg) => cb.apply(ctx, arg), options);
  });
}
function Prop() {
  return createDecorator(function(ctx, target, name) {
    const outValue = ctx.$props[name];
    createComponentPropsReactive(ctx, name, true, outValue);
  });
}
function Ref(key) {
  return createDecorator(function(ctx, target, name) {
    ctx[name] = { is_kp_DomRef: true };
    ctx.$nextTick(() => {
      ctx[name] = ctx.$refs[key];
    });
  }, true);
}
let flushing = false;
const p = Promise.resolve();
const jobQueue = /* @__PURE__ */ new Set();
function flushJob() {
  if (!jobQueue)
    return;
  if (flushing)
    return;
  flushing = true;
  p.then(() => {
    jobQueue.forEach((fn) => {
      fn();
    });
  }).finally(() => flushing = false);
}
class KComponent {
  constructor(arg) {
    this.$refs = {};
    this.$updating = false;
    this.$dom = new Dom(this);
    this.$diff = new Diff(this.$dom);
    Object.assign(this, arg);
  }
  $nextTick(fn) {
    let p1;
    if (fn) {
      p.then(() => {
        fn();
      });
    } else {
      p1 = p;
    }
    return p1;
  }
  writeValue(value) {
  }
  static create(com, props, $el) {
    var _a, _b;
    const component = new com({ $el, ...props });
    component.$props = props;
    if (component.writeValue) {
      component.writeValue(props && props.value);
    }
    (_a = component.$RefDecorators) == null ? void 0 : _a.forEach((fn) => fn(component));
    if (component.$stage === 1 || component.$stage == null) {
      createComponentReactive(component);
    }
    (_b = component.$Decorators) == null ? void 0 : _b.forEach((fn) => fn(component));
    component.created();
    component.beforeMount();
    component.mount();
    component.mounted();
    return component;
  }
  created() {
  }
  beforeMount() {
  }
  mount() {
    effect(() => {
      this.patch();
    }, {
      scheduler(fn) {
        jobQueue.add(fn);
        flushJob();
      }
    });
  }
  mountElement() {
    this.$vNode = this.render();
    const node = this.$dom.createElement(this.$vNode);
    if (this.$el && node) {
      this.$dom.insertBefore(this.$el.parentNode, node, this.$el.nextSibling);
      this.$dom.removeChild(this.$el.parentNode, this.$el);
    }
  }
  patchComponent() {
    let newVNode = this.render();
    if (!newVNode) {
      newVNode = createTextVNode("");
    }
    this.$diff.patch(this.$vNode, newVNode);
    this.$vNode = newVNode;
  }
  update() {
    if (this.$updating) {
      return;
    }
    this.$updating = true;
    Promise.resolve().then(() => {
      this.$updating = false;
      this.patch();
      this.updated();
    });
  }
  patch() {
    if (!this.$vNode) {
      this.mountElement();
    } else {
      this.patchComponent();
    }
  }
  mounted() {
  }
  updated() {
  }
  destroy() {
  }
}
class ValueComponent extends KComponent {
  onChange(value) {
    if (this.valueChange) {
      this.valueChange(value);
    }
  }
}
function createComponentReactive(componentObj) {
  const obj = {};
  for (const key in componentObj) {
    if (Object.prototype.hasOwnProperty.call(componentObj, key)) {
      const element = componentObj[key];
      const isComputed = typeof element === "object" && element.is_kp_computed;
      const isDomRef = typeof element === "object" && element.is_kp_DomRef;
      if (!key.startsWith("$") && !isComputed && !isDomRef && !(element instanceof Set) && !(element instanceof Map)) {
        obj[key] = element;
      }
    }
  }
  const reactiveData = reactive(obj);
  for (const key in reactiveData) {
    Object.defineProperty(componentObj, key, {
      get() {
        return reactiveData[key];
      },
      set(value) {
        reactiveData[key] = value;
        componentObj.updated();
      }
    });
  }
}
function createComponentPropsReactive(target, key, readonly2, outValue) {
  const value = ref(outValue || target[key]);
  Object.defineProperty(target, key, {
    get() {
      return value.value;
    },
    set(newValue) {
      if (readonly2) {
        console.error(new Error(`Prop ${key} \u5C5E\u6027\u4E0D\u80FD\u4FEE\u6539`));
      } else {
        value.value = newValue;
        target.updated();
      }
    }
  });
  return value;
}
function createDecorator(factory, is_kp_DomRef) {
  return function(...rest) {
    const [target] = rest;
    const props = is_kp_DomRef ? "$RefDecorators" : "$Decorators";
    (target[props] || (target[props] = [])).push((ctx) => factory(ctx, ...rest));
  };
}
function mountComponent(container, p2) {
  const { props, content } = p2;
  KComponent.create(content, props, container);
}
var button_component = /* @__PURE__ */ (() => "button{color:red}\n")();
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$1(target, key, result);
  return result;
};
let KButton = class extends ValueComponent {
  constructor() {
    super(...arguments);
    this.count = 0;
    this.showStop = true;
    this.max = 3;
  }
  countChange(a, b) {
    console.log("\u76D1\u6D4B count:", `oldValue: ${a}`, `newValue: ${b}`);
    this.showStop = this.count > this.max;
  }
  get countValue() {
    return this.showStop ? "stop" : this.count;
  }
  button() {
    this.$nextTick(() => {
      console.log(this.buttonEl.innerText);
    });
    return /* @__PURE__ */ createVNode("button", {
      onClick: () => {
        if (this.showStop)
          return;
        this.count++;
        this.onChange(this.count);
      }
    }, "click+1");
  }
  render() {
    return /* @__PURE__ */ createVNode("div", {
      id: "wuxunyu",
      ref: "button"
    }, this.countValue, " ", this.button());
  }
};
__decorateClass$1([
  Prop()
], KButton.prototype, "defaultCount", 2);
__decorateClass$1([
  Prop()
], KButton.prototype, "max", 2);
__decorateClass$1([
  Ref("button")
], KButton.prototype, "buttonEl", 2);
__decorateClass$1([
  Watch("count", {
    immediate: true
  })
], KButton.prototype, "countChange", 1);
KButton = __decorateClass$1([
  Component()
], KButton);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
let WelCome = class extends ValueComponent {
  constructor() {
    super(...arguments);
    this.max = 6;
  }
  buttonDemo() {
    return /* @__PURE__ */ createVNode(KButton, {
      valueChange: (e) => {
        this.onChange(e);
      },
      max: this.max
    });
  }
  render() {
    const welcomeWrapper = /* @__PURE__ */ createVNode("div", null, /* @__PURE__ */ createVNode("p", null, "WelCome to Keepeact,  ."), /* @__PURE__ */ createVNode("p", null, "demo:  well stop, if count ", ">", " ", this.max), /* @__PURE__ */ createVNode("ul", null, /* @__PURE__ */ createVNode("li", null, this.buttonDemo())));
    return welcomeWrapper;
  }
};
WelCome = __decorateClass([
  Component()
], WelCome);
export { KButton, WelCome, mountComponent };
