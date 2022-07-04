---
title: vue
date: 2022-05-04 11:08:20
tags: 知识点
categories: [javascript, vue]
--- 
## v-if 和 v-for 的优先级

源码： compiler/codegen/index.js

v-for 优先于 v-if

同时出现会先执行 v-for,浪费性能，先循环再判断是否显示（v-if）

源码中

Else if(v-for)

Else if (v-if)

v-for 明显优先于 v-if

## data 是一个函数

源码： initData()

## diff

源码：mountComponent()

源码：patchVnode() diff 发生地方，深度优先，同层比较

源码：updateChildren()

![image-20211104003501161](/images/image-20211104003501161.png)

## vue3 特性

1.  更快

- 虚拟 DOM 重写
- 优化 slots 的生成
- 静态树的提升
- 静态属性的提升
- 基于 Proxy 的响应式系统

2. 更小：通过摇树优化核心库体积
3. 更容易维护：Typescript + 源码模块化
4. 更加友好

- 跨平台： 编译器核心和运行时核心与平台无关，使得 Vue 更容易与任何平台（Web,Android,IOS）使用

5. 更容易使用

- 改进 Typescript 支持，编辑器能够提供强有力的类型检查和错误及警告
- 更改好的调试支持
- 独立的响应化模块
- Compostions API

## Vue 性能优化方法

- 路由懒加载

- keep-alive

- 使用 v-show 复用 DOM

- v-for 遍历避免同时使用 v-if

- 长列表性能优化

  使用 Object.freeze()

​ defindProperty configruable = false

​ 虚拟滚动（三方库，vue-virtual-scrlloer）

- 事件的销毁

  组件本身的事件再销毁的时候会自动销毁。

  但使用定时器等。建议再 beforeDestroy 时卸载定时器，防止内存泄漏

- 图片的懒加载

```html
// 记录滚动条位置，到达时才显示 <img v-lazy="src" />
```

- 第三方插件按需引入

```js
import { Button } from "element-ui";
```

- 无状态的组件标记为函数式组件
- 子组件分割
  切割有动态内容的组件，不会影响其他内容的渲染，有独立的 watcher
- 变量本地化
  在计算属性使用计算属性时，使用赋值变量，减少 computed 中 get 的逻辑运行（缓存处理等）

```javascript
export default {
	computed() {
		base() {
			return 12;
		},
        count() {
            const base = this.base; // 不要频繁引用this.base
            let res = 0;
            for (let i = 0; i < 1000; i++) {
                return += base;
            }
        }
	}
}
```

## Virtual Dom 有哪些优势，为何要设计它

DOM 引擎、JS 引擎相互独立，但又工作在一个线程，JS 代码调用 DOM API 必须挂起 JS 引擎，这意味有可能会产生阻塞。且若大量的调用 DOM API，浏览器可能引起大量重绘排版，引起更大的性能消耗

VDOM 和真实 DOM 的区别和优化：

1. VDOM 不会立马进行排版和重绘操作
2. VDOM 进行频繁修改，然后一次性比较并修改真实 DOM 需要修改的部分，减少 DOM 节点排版和重绘消耗

## 关于 render 不为人知的秘密
## 原生操作DOM和通过框架封装操作

貌似用documentFragment或直接操作dom 性能更好，为什么要使用虚拟dom方式去操作呢？

1. 性能 vs 维护性
2. 框架封装的具有描述性目标性
3. 框架保证 不用你手动优化
## 关于render不为人知的秘密
- render的结果为一个 Vnode  
- 组件render互不干扰  
那么问题来了：    
依赖一当发生变化，那么所在组件渲染的render函数会重新执行，那如果组件里面嵌套组件，当父组件执行render的时候，要重新生成vnode吗，子组件的render不会执行那么也就不会生成vnode，子组件没有新的vnode，patch的时候怎么比对新旧节点？

- render 的结果为一个 Vnode
- 组件 render 互不干扰  
  那么问题来了：  
  依赖一当发生变化，那么所在组件渲染的 render 函数会重新执行，那如果组件里面嵌套组件，当父组件执行 render 的时候，要重新生成 vnode 吗，子组件的 render 不会执行那么也就不会生成 vnode，子组件没有新的 vnode，patch 的时候怎么比对新旧节点？

## 关于依赖收集

### 原理

Dep observer Watch 之间的关系

先定义响应数据 -> 修改 get -> 在 get 中利用 dep.depend

### computed 缓存和依赖收集原理

会为每个 `computed` 属性增加 `Watcher` 并且改写 `Object.definedProperty` 的 `set` 属性,
缓存： 当调用 `computed` 属性时，用 `dirty` 属性会判断 是否已经执行过，为 `true` 则重新计算，随后设置为 `false`  
render 中调用属性时，

1. `watcher.eavalute()`
2. `popTarget(将 computed watcher 弹出，由渲染 watcher 接管)`
3. ` dirty = false`
4. ` computed watcher.depend()`
5. `computed dep.depend`
6. `渲染 watcher.addDep(收集 computed 的依赖)`
7. ` 依赖发生变化， update()`
8. `dirty = true`
9. `重新执行 render`
10. `执行 watcher.eavalute()`

- 关键代码：

initState

```js
// computed get
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
```

Watcher

```js
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  // 执行computed属性函数
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    value = this.getter.call(vm, vm)
    popTarget()
    return value
  }
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } ....
  }
```

```js
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
```

## 生命周期的顺序理解

## 基于vue.js 3 响应式原理

...


