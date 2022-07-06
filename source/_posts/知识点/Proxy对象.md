---
title: Proxy对象
date: 2022-07-05 14:12:28
tags: 知识点
categories: [javascript, 基础知识]
---

Proxy 是什么？ 使用 Proxy 可以创建一个代理对象，能够实现对其他对象的代理，允许拦截并重新定义对一个对象的基本操作。

"Javascript 中一切皆对象"， 那么， 到底是什么对象呢？

## 理解常规对象(ordinary object)和异质对象(exotic object)

根据 `ECMAScript` 规范，对象可分为两种对象，` 常规对象(ordinary object)`和`异质对象(exotic object)`， **任何不属于常规对象的对象都是异质对象**，那到底什么是常规对象，什么是异质对象，就要先了解对象的内部方法和内部槽。

常规对象见下表:

![table 1: 对象内部必要方法](/images/ordinary-object.png)

对于 `[[Get]]`， 我们很熟悉， 举个例子:

```js
obj.foo;
```

引擎内部会调用`[[Get]]`内部方法读取属性值。当然其他操作比如 修改， 删除都会触发相应的内部方法。

> 一个对象必须部署 `table 1` 这 11 个内部方法

除了 `table 1` 中的方法外，还存在两个额外的方法: `[[Call]]` `[[Construct]]`:

![table 2: 额外的必要内部方法](/images/function-object.png)

一个对象如果被作为函数调用时，就会自动部署 `table 2` 这两个方法。**看这个对象是否是函数时，可以为此作为判断**

了解了内部方法，那么就可以了解什么是常规对象和异质对象了， 满足以下条件的就是常规对象:

**内部方法都是由`table 1` 和 `table 2`中规范实现的**

那么不满足以上条件的都是异质对象。

> ECMAScript 原文
> An ordinary object is an object that satisfies all of the following criteria:
> For the internal methods listed in Table 4, the object uses those defined in 10.1.
> If the object has a `[[Call]]` internal method, it uses the one defined in 10.2.1.
> If the object has a `[[Construct]]` internal method, it uses the one defined in 10.2.2.
> An exotic object is an object that is not an ordinary object.
> [https://262.ecma-international.org/13.0/#ordinary-object](https://262.ecma-international.org/13.0/#ordinary-object)

那么 `Proxy` 是常规对象还是异质对象？

首先要查阅 `ECMAScript` 对 `Proxy` 的定义:

![table 3: Proxy对象部署的内部方法](/images/Proxy.png)

由此可以看出 Proxy 内部实现的方法和`table 1` ，`table 2`中的方法一样，举个例子:

```js
const obj = new Proxy({ foo: 1 });
obj.foo;
```

同样的，引擎内部会调用部署到代理对象中的`[[Get]]`内部方法读取属性值，虽然会部署相同的内部方法，但是行为却是不同，也就是当创建代理对象的时候没有指定的对应拦截函数，那么就会调用原始的方法，在该例子中没有指定 `get()`，那么当读取时就会调用原始对象的`[[Get]]`方法，从`[[Get]]`就可以看出，`Proxy是一个异质对象`，因为并没有按照 `table 1`中的规范来

> ECMAScript 原文
> `A Proxy object is an exotic object(异质对象)` whose essential internal methods are partially implemented using ECMAScript code.
>
> When a handler method is called to provide the implementation of a Proxy object internal method, the handler method is passed the proxy's target object as a parameter. A proxy's handler object does not necessarily have a method corresponding to every essential internal method. Invoking an internal method on the proxy results in the invocation of the corresponding internal method on the proxy's target object if the handler object does not have a method corresponding to the internal trap.
> [https://262.ecma-international.org/13.0/#sec-proxy-object-internal-methods-and-internal-slots](https://262.ecma-international.org/13.0/#sec-proxy-object-internal-methods-and-internal-slots)

## 如何代理 Object

前文中我们提到 `get()` 去拦截对象的读取，那在读取的概念中时很广泛的，很多操作都暗藏着读取，下面列举可能读取对象属性的行为:

- 属性访问： `obj.foo`
- in 操作符： `'foo' in obj`
- for...in 遍历： `for ... in obj`

### obj.foo

对于普通的属性访问，我们都知道会被 `get()` 拦截:

```js
const obj = new Proxy(
  { foo: 1 },
  {
    get(target, key) {
      // target 为原对象
      return tartget[key];
    },
  }
);

obj.foo;
```

### 'foo' in obj

对于 `in` 操作符，应该如何拦截呢？还是要去查 `ECMAScript` 规范 对于 `in` 的定义:

    ShiftExpression in RelationalExpression
    1. 让 lref 是计算 RelationalExpression 的结果。
    2. 让 lval 是 GetValue(lref) 的结果。
    3. 让 rref 是对 ShiftExpression 求值的结果。
    4. 让 val  是 GetValue(rref) 的结果。
    5. 如果 Type(rval) 不是 Object，抛出TypeError异常。
    6. 返回 HasProperty(rval, ToPropertyKey(lval)) 的结果

> ECMAScript 原文
> https://262.ecma-international.org/13.0/#sec-relational-operators

重点在第 `6` 步， 查看 `table 3`中的 `HasProperty`，对应的拦截函数为 `has`，那么我们就可以对 `in` 操作符进行拦截了:

```js
const obj = new Proxy(
  { foo: 1 },
  {
    has(target, key) {
      // target 为原对象
      const has = !!tartget[key];
      return has; // true or false
    },
  }
);

'foo' in obj;
```

### for ... in obj

再来看看 `ECMAScript` 对 `for ... in` 的部分定义:

    6. 如果iterationKind为enumerate，则
        a. 如果exprValue为undefined或null 则
          i. 返回补全记录{[[Type]]: break， [[Value]]: empty， [[Target]]: empty}
        b. 让 obj 为 ToObject (exprValue) 的结果
        c. 让  iterator 为 EnumerateObjectProperties(obj)

重点看 第 `6` 点中的 `c`， EnumerateObjectProperties：

```js
function* EnumerateObjectProperties(obj) {
  const visited = new Set();
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key === 'symbol') continue;
    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
    if (desc) {
      visited.add(key);
      if (desc.enumerable) yield key;
    }
  }
  const proto = Reflect.getPrototypeOf(obj);
  if (proto === null) return;
  for (const protoKey of EnumerateObjectProperties(proto)) {
    if (!visited.has(protoKey)) yield protoKey;
  }
}
```

> ECMAScript 原文
> [14.7.5.6 ForIn/OfHeadEvaluation](https://262.ecma-international.org/13.0/#sec-runtime-semantics-forinofheadevaluation) > [EnumerateObjectProperties](https://262.ecma-international.org/13.0/#sec-enumerate-object-properties)

可以看出 `for ... in` 内部调用了 `ownKeys` 这个方法，那么我们就可以对其拦截了：

```js
const obj = new Proxy(
  { foo: 1 },
  {
    ownKeys(target) {
      return Reflect.ownKeys(target); // ['foo']
    },
  }
);

for (key in obj) {
}
```

## 如何代理数组

数组是一个特殊的对象，它对某一类属性名进行特殊处理，既然是一个对象，那么它内部方法基本和 `table 1` 一致，不同的是 `[[DefineOwnProperty]]` 方法的处理不同，这也说明了数组是一个 `异质对象`

> ECMAScript 原文
> [https://262.ecma-international.org/13.0/#sec-array-exotic-objects](https://262.ecma-international.org/13.0/#sec-array-exotic-objects)

同样的，我们需要知道在数组中读取的行为有哪些，下面列举了部分`读取`操作：

- 通过索引访问值： `arr[0]`
- 访问数组长度 length：`arr.length`
- 把数组当对象：`用 for ... in 遍历`
- `for ... of 迭代遍历`
- 数组原型方法：`contact/join/every/some/find/includes` 等等，以及不改变原数组的方法

再看看有哪些涉及到元素的`设置`的操作：

- 通过索引修改数组元素值： `arr[0] = 'bar'`
- 修改数组长度： `arr.length = 0`
- 栈方法： `push/pop/shift/unshift`
- 修改原数组方法： `splice/sort 等`


既然除了 `[[DefineOwnProperty]]` ，其他内部方法都一致，说明了同样的劫持方法在数组同样生效

```js
const proxy = new Proxy(['foo'], {
  get(target, key) {
    return tartget[key];
  },
  ownKeys(target) {
    return Reflect.ownKeys(target); // ['foo']
  },
});

proxy[0]; // get
for (key in obj) { // ownKeys
}
```

> 对于对象和数组涉及到修改的，都会经过 `set` 拦截函数，可以自己去尝试~ 

文章还提到了 `Reflect`，这个方法提供了访问一个对象的默认行为，详细的就不再赘叙。最后，我们成功拦截了对象和数组，如其他需要拦截，最主要的还是要去翻阅 [ECMAScript](https://tc39.es/ecma262/) 
