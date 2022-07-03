---
title: javascript
tags: 知识点
---

## 内存机制

js 内存空间分为栈(stack)、堆(heap)

栈：数据在栈内存中的存储与使用方式类似于数据结构中的堆栈数据结构，遵循后进先出的原则。

**堆：**

````js
var a1 = 0; // ``栈`
var a2 = "this is string"; // ``栈`
var a3 = null; // ``栈`
var b = { m: 20 }; // ``变量``b``存在于栈中，``{m: 20} ``作为对象存在于堆内存中`
var c = [1, 2, 3]; // ``变量``c``存在于栈中，``[1, 2, 3] ``作为对象存在于堆内存中```
````

![clip_image001](/images/clip_image001.png)

> 基础数据类型： `Number` `String` `Null` `Undefined` `Boolean`

**内存泄漏：**

当内存存在无法被垃圾回收时，这种就叫内存泄漏  
一段代码解释：

```js
// dom处理
const el = document.gteElementById("id");
el.onclick = () => {
  console.log(el); // 产生循环引用
};

// 闭包
const counter = () => {
  let num = 0;
  return () => {
    num++;
  };
};
const count = counter();
count(); // num === 1
count(); // num === 2
// num并不会被回收
```

**如何解决：**

1. 手动清除引用

```js
let el = document.gteElementById("id");
el.onclick = () => {
  console.log(el);
  el = null; // 执行完释放
};
```

2. 使用弱引用-不计入 gc

- weakMap
- weakSet

### 调用栈

**什么是调用栈？**  
`调用栈`指的是管理函数调用的一种数据结构，`栈`一种容器，遵循`先进后出`，`后进先出`。
**什么是栈溢出？**  
一段代码解释：

```js
function division(x, y) {
  return division(x, y);
}
division(1, 2);
```

函数递归调用，会出现压栈的行为，并不会弹出直到递归停止，当到达一定程度的数量，栈容器就会存在不够存放的情况，这种就叫栈溢出。
**如何解决栈溢出？**

1. 利用异步任务优化（宏任务/微任务）
2. 尾调用优化

### 内存的生命周期

JS 环境中分配的内存一般有如下生命周期：

1. _内存分配_：当我们申明变量、函数、对象的时候，系统会自动为他 们分配内存

2. _内存使用_：即读写内存，也就是使用变量、函数等

3. _内存回收_：使用完毕，由垃圾回收机制自动回收不再使用的内存

为了便于理解，我们使用一个简单的例子来解释这个周期。

var a = 20; // 在内存中给数值变量分配空间

alert(a + 100); // 使用内存

var a = null; // 使用完毕之后，释放内存空间

### 内存回收

在局部作用域中，当函数执行完毕，局部变量也就没有存在的必要了，因此垃圾收集器很容易做出判断并回收。但是全局变量什么时候需要自动释放内存空间则很难判断，因此在我们的开发中，需要尽量避免使用全局变量，以确保性能问题。

```JS

function fun1() {

 var obj = {name: 'csa', age: 24};

}



function fun2() {

 var obj = {name: 'coder', age: 2}

 return obj;

}



var f1 = fun1();

var f2 = fun2();

```

在上述代码中，当执行`var f1 = fun1();`的时候，执行环境会创建一个`{name:'csa', age:24}`这个对象，

当执行`var f2 = fun2();`的时候，执行环境会创建一个`{name:'coder', age=2}`这个对象

然后在下一次垃圾回收来临的时候，会释放`{name:'csa', age:24}`这个对象的内存，但并不会释放`{name:'coder', age:2}`这个对象的内存。

这就是因为在`fun2()`函数中将`{name:'coder, age:2'}`这个对象返回，并且将其引用赋值给了 f`2`变量，又由于`f2`这个对象属于全局变量，所以在页面没有卸载的情况下，`f2`所指向的对象`{name:'coder', age:2}`是不会被回收的。

### 标记清除算法

标记清除算法将“不再使用的对象”定义为“无法达到的对象”。简单来说，就是从根部（在 JS 中就是全局对象）出发定时扫描内存中的对象。凡是能从根部到达的对象，都是还需要使用的。那些无法由根部出发触及到的对象被标记为不再使用，稍后进行回收。

## 线程 VS 进程

线程：多线程可以并行处理，但是**线程是不能单独存在的，它是由进程来启动和管理的**。  
进程：**一个进程就是一个程序的运行实例**。详细的解释：启动一个程序的时候，操作系统回味该程序创建一块内存，用来存放代码、运行中的数据和一个执行任务的主线程

![屏幕截图 2021-11-30 221332](.//images/屏幕截图%202021-11-30%20221332.png)

从图中可以看出**线程依附于进程的，而进程中使用多线程并行处理能提升运算效率**

### 进程和线程关系

1. 进程中的任意一线程执行出错，都会导致整个进程的崩溃
2. 线程之间共享进程中的数据
3. 当一个进程关闭之后，操作系统会回收进程所占用的内存
4. 进程之间的内容相互隔离，进行通讯需要使用用于进程通信（IPC）的机制了

## Promise

### 解决了什么问题

**`promise`解决的是`异步编码风格`的问题**

1. 异步编程的问题： 代码逻辑不连续

### 状态和方法

1. **有几种状态**

- pending
- fulfilled
- rejected

2. **状态是否可变**
   状态不可变，resolve 之后不可 rejected，反之也是
3. **有哪些方法，应用场景**

- then
- race
- all
- catch
- reject
- allsettled
- any

1. **async/await**

2. **catch 的捕获机制**

   ```js
   function executor(resolve, reject) {
       let rand = Math.random();
       console.log(1)
       console.log(rand)
       if (rand > 0.5)
           resolve()
       else
           reject()
   }var p0 = new Promise(executor);
   var p1 = p0.then((value) => {
       console.log("succeed-1") return new Promise(executor)
   })
   var p3 = p1.then((value) => {
       console.log("succeed-2") return new Promise(executor)
   })
   var p4 = p3.then((value) => {
       console.log("succeed-3") return new Promise(executor)
   })
   p4.catch((error) => {
       console.log("error")
   })
   console.log(2)
   ```

   当第一个出错时。p4 仍可以捕获到错误。这样就解决了每个任务都需要单独处理异常的问题

​ https://juejin.cn/post/6945319439772434469

3.

**​ 思考**

1. **Promise 中为什么要引入微任务？**

2. **Promise 中是如何实现回调函数返回值穿透的？**

3. **Promise 出错后，是怎么通过“冒泡”传递给最后那个捕获异常的函数？**

   promise 部分实现

```js
class AlleyPromise {
  // 1、Promise三种状态
  static PENDING = "PENDING";
  static FULFILED = "FULFILED";
  static REJECTED = "REJECTED";

  constructor(callback) {
    // 容错处理
    if (typeof callback !== "function") {
      throw new TypeError("Promise resolver undefined is not a function");
    }

    // 初始状态
    this.promiseStatus = AlleyPromise.PENDING;

    // 定义resolve函数队列 reject函数队列
    this.resolveQueues = [];
    this.rejectQueues = [];

    //定义初始值
    this.value;

    //调用callback函数
    callback(this._resolve.bind(this), this._reject.bind(this));
  }
  _resolve(val) {
    queueMicrotask(() => {
      // 更改成功状态
      if (this.promiseStatus !== AlleyPromise.PENDING) return;
      this.promiseStatus = AlleyPromise.FULFILED;
      this.value = val;
      let handler;
      while ((handler = this.resolveQueues.shift())) {
        handler(this.value);
      }
    });
  }
  _reject(val) {
    queueMicrotask(() => {
      // 更改失败状态
      if (this.promiseStatus !== AlleyPromise.PENDING) return;
      this.promiseStatus = AlleyPromise.REJECTED;
      this.value = val;
      let handler;
      while ((handler = this.rejectQueues.shift())) {
        handler(this.value);
      }
    });
  }
  then(resolveHandler, rejectHandler) {
    return new AlleyPromise((resolve, reject) => {
      function newResolveHandler(val) {
        // 首先判断 resolveHandler是否是一个函数
        if (typeof resolveHandler === "function") {
          /*
                获取resolveHandler 函数的返回值进行判断
                如果是promise则继续.then，不是则直接将结果返回
                */
          let result = resolveHandler(val);
          if (result instanceof AlleyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } else {
          resolve(val);
        }
      }

      function newRejectHandler(val) {
        if (typeof rejectHandler === "function") {
          let result = rejectHandler(val);
          if (result instanceof AlleyPromise) {
            result.then(resolve, reject);
          } else {
            reject(result);
          }
        } else {
          reject(val);
        }
      }

      this.resolveQueues.push(newResolveHandler);
      this.rejectQueues.push(newRejectHandler);
    });
  }
  catch(rejectHandler) {
    return this.then(undefined, rejectHandler);
  }
  static all(iterator) {
    let len = iterator.length;
    let n = 0;
    let vals = [];
    return new AlleyPromise((resolve, reject) => {
      iterator.forEach((item) => {
        item
          .then((val) => {
            ++n;
            vals.push(val);
            if (len === n) {
              resolve(vals);
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    });
  }
  static race(iterator) {
    return new AlleyPromise((resolve, reject) => {
      iterator.forEach((item) => {
        item
          .then((val) => {
            resolve(val);
          })
          .catch((e) => {
            reject(e);
          });
      });
    });
  }
  static resolve(val) {
    return new AlleyPromise((resolve) => {
      resolve(val);
    });
  }
  static reject(val) {
    return new AlleyPromise((resolve, reject) => {
      reject(val);
    });
  }
}

const promise1 = new AlleyPromise((resolve, reject) => {
  //   reject(1213);
  setTimeout(() => {
    resolve();
  }, 2001);
});

// promise1
//   .then((res) => {
//     return MyPromise.resolve("valu23e");
//   })
//   .then((res) => {
//     console.log(res);
//   });
promise1
  .then((res) => 123)
  .then((res) => new AlleyPromise((res) => res(12)))
  .then((res) => {
    console.log(23, res);
  })

  .catch((res) => {
    console.log(23, res);
  });
a;
```

## 宏任务和微任务

1. **宏任务**

- 渲染事件（解析 DOM、计算布局、绘制）
- 用户交互事件（鼠标点击、滚动页面）
- js 脚本执行事件
- 网络请求完成事件

**为了协调这些任务在主线程上稳定执行，引入了消息队列和事件循环机制，`消息队列中`的任务，就称为`宏任务`，`消息队列`中的任务是通过事件循环系统执行的**

2. **微任务**

- `MutationObserver`监控某 DOM 节点，通过 js 操作节点，节点发生变化，产生记录 DOM 变化的微任务

- 使用`Promise`，调用`Promise.resolve()`或者`Promise.reject()`产生微任务

执行脚本时，在宏任务执行过程中有时候会产生很多微任务，引擎会创建一个微任务队列，来存放微任务
**微任务执行时机：**
**当前宏任务执行完成时，清空栈时，引擎检查微任务队列，按顺序执行队列中的任务**
**如果微任务队列执行中产生新的微任务，同样的会加到同个微任务队列中，循环执行。并不会推迟到下个宏任务中执行**

**结论：**

- 微任务和宏任务时绑定的，每个宏任务在执行时会创建自己的微任务队列。

- 微任务时长会影响到当前宏任务的时长

- 在一个宏任务中，分别创建一个用于回调的宏任务和微任务，无论什么情况，微任务都早于宏任务。
  ```js
  function fn(cb) {
    console.log("谁先执行呢");
    setTimeout(() => {
      console.log("setTimeout执行");
      cb();
    });
    new Promise((resolve) => {
      resolve();
    }).then(() => {
      console.log("Promise执行");
      cb();
    });
  }
  fn(() => {});
  // 谁先执行呢
  // Promise执行
  // setTimeout执行
  ```

```js
function executor(resolve, reject) {
  let rand = Math.random();
  console.log(1);
  console.log(rand);
  if (rand > 0.5) resolve();
  else reject();
}
var p0 = new Promise(executor);

var p1 = p0.then((value) => {
  console.log("succeed-1");
  return new Promise(executor);
});

var p3 = p1.then((value) => {
  console.log("succeed-2");
  return new Promise(executor);
});

var p4 = p3.then((value) => {
  console.log("succeed-3");
  return new Promise(executor);
});

p4.catch((error) => {
  console.log("error");
});
console.log(2);
```

## 作用域

作用域，可以说是一套储存变量，访问变量的一套规则。指的是在这规则约束下，变量，函数，标识符可访问的区域。
js 作用域是`词法作用域`，一种静态作用域，静态作用域是`代码编译阶段就决定好了，跟函数调用没有关系`  
有三种作用域：  
全局作用域  
函数作用域  
块级作用域

## 作用域链

当作用域套作用域时，就形成了一条作用域链。  
全局套函数  
函数套函数
比如

```js
var b = 1;
function a() {
  console.log(b);
}
```

作用： 可让 a 函数可以访问到外部作用的变量，查找变量时的这条链就称为作用域链

> 但注意，作用域链时基于词法作用域的，也就是说作用域链的形成是代码书写阶段就已经确认下来

## 闭包

本质： 根据词法作用域，内部函数总是可以访问外部函数中声明的变量，当通过调用外部函数返回的内部函数时，外部执行完，但是内部函数引用外部函数的变量依然保存在内存，把这个些变量的结合称之为闭包。外部函数的闭包

## 执行上下文

执行上下文，是代码的执行环境。执行上下文可分为以下：

1. 全局执行上下文：

- window 对象
- this
- 其他变量对象

2. 函数执行上下文

- arguments
- this（不固定，根据谁引用就指向谁）
- 其他活动对象

3. eval 执行上下文

分仔细还可以将执行上下文分为：

- 变量环境 （var 等定义的变量）
- 词法环境（let、const 等定义的变量）
- 作用域链（scope）
- this

执行上下文的生命周期：  
创建阶段：

1. 生成变量对象，安排内存
2. 确认 this
3. 确认作用域
   执行阶段：
4. 变量赋值

> 变量提升，也就是在全局上下文创建阶段，给变量初始化安排内存，这时并未赋值

## 调用栈

先说结论，调用栈呢，是一种数据栈的数据结构管理执行上下文的，当执行环境执行多个函数时，也就是执行上下文执行调用函数时，会按顺序压入栈，执行到谁就先压入，遵循先进后出，执行完立即弹出。  
从调用栈理解作用域：  
我们所说，外部函数往往是访问不到内部函数的，这是为什么呢？

```js
function a() {
  console.log(bb);
  function b() {
    var bb = "a拿不到我";
  }
  b();
}
a();
```

调用栈的执行情况： 此时`b`位于栈顶，执行完直接弹出栈，`b执行上下文被销毁`，`a`自然是拿不到`bb这个处于b作用域的变量`

## 执行环境中的变量对象和活动对象

概念：每一个执行环境中都有一个与之关联的`变量对象`。如果这个环境是函数，那么将`活动对象`作为`变量对象`,`活动对象`最开始只包含一个变量，`arguments`对象。作用域链中的下一个比那辆对象来自外部环境
扩展：当执行流进入一个函数，函数的环境推入一个环境栈中，执行之后，再将环境弹出。
代码在一个环境中执行时，会创建变量对象的`作用域链`。作用域用途，是保证对执行环境有权访问的所有变量和函数的有序访问

## this 那些事

`this`对象是在运行时基于函数的执行环境绑定的

1. **默认绑定规则**：`this`指向`window`
2. **隐式绑定规则**：函数被当作对象的方法调用时，`this`指向对象（谁调用就指向谁）
3. **显示绑定规则**：`call`、`apply`、`bind`改变`this`指向

## bind、apply、call 实现

```js
let obj = {
  a: 123,
};
function fn(p) {
  console.log(this.a, p);
}
// call
fn.call(obj, "wuxunyu"); // 123,wuxunyu

// bind
const fn1 = fn.bind(obj);
fn1("wuxunyu"); // 123, wuxunyu

// apply
fn.apply(obj, ["wuxunyu"]); // 123, wuxunyu

Function.prototype.myCall = function (context, ...arg) {
  context.fn = this;
  context.fn(...arg);
  delete context.fn;
};

Function.prototype.myBind = function (context, ...arg) {
  context.fn = this;
  return function () {
    context.fn(...arg);
    delete context.fn;
  };
};

Function.prototype.myApply = function (context, arg) {
  if (!Array.isArray(arg)) {
    return;
  }
  context.fn = this;
  context.fn(...arg);
  delete context.fn;
};
```

## 原型对象和原型链

1. **原型对象**

- 概念：每一个构造函数中都有一个对象，`prototype`，称为原型对象。

- 构造函数、原型和实例的关系：原型对象`prototype`都包含一个指向构造函数`constructor`的指针，而实例都包含一个指向原型对象的内部指针`__proto__`

  ```js
  function SuperType() {
    this.property = true;
  }
  const superType = new SuperType();
  console.log(superType.__proto__ === SuperType.prototype); // true
  ```

2. **原型链**
   假设，让`A`的原型对象`prototype`等于另一个类型`B`的实例，此时`A`原型对象`prototype`将包含一个指向`B`原型的指针`__proto__`,相应的，`B`原型中也包含着一个指向另一个构造函数的指针。假如，又让`C`的原型对象`prototype`等于`A`的实例,如此层层递进，就构成了实例与原型的链条，这就是原型链的基本概念

```js
function SuperType() {
  this.property = true;
}
SuperType.prototype.getSuperValue = function () {
  return this.property;
};
function SubType() {
  this.subproperty = false;
}
// 继承了 SuperType
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subproperty;
};
var instance = new SubType();
console.log(instance.getSuperValue()); // true
```

![image-20211128015555102](/images/image-20211128015555102.png)

> 原型链的基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法

## 继承

### 原型链继承

```js
function Child() {
  this.name = "child";
}

function Parent() {
  this.eat = [1, 2, 3];
}

Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

child1.eat.push(4);
child1.eat; // [1,2,3,4]
child2.eat; // [1,2,3,4]
```
缺点: 子共用同个属性方法，同个引用类型
### 借用构造函数继承

```js
function Child() {
  Parent.call(this); // 将parent的this指向child，将parent方法转移到child
  this.name = "child";
}
function Parent() {
  this.eat = [1, 2, 3];
}

Parent.prototype.getName = function() {
  console.log(this.name);
}

const child1 = new Child();
const child2 = new Child();
child1.eat.push(4);
child1.eat; // [1,2,3,4]
child2.eat; // [1,2,3]


child1.getName() // 报错
```
解决了原型链继承方法缺点
缺点:  子获取不到父原型上的属性方法

### 组合继承


```js
function Child() {
  Parent.call(this); // 将parent的this指向child，将parent方法转移到child
  this.name = "child";
}
function Parent() {
  this.eat = [1, 2, 3];
}

Parent.prototype.getName = function() {
  console.log(this.name);
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child1 = new Child();
const child2 = new Child();
child1.eat.push(4);
child1.eat; // [1,2,3,4]
child2.eat; // [1,2,3]


child1.getName() // child
```
解决了借用构造函数获取不到父类原型上的属性方法
缺点: 调用了两次父类

### 原型式继承

```js
const child = {
  name: 'child',
  eat: [1,2,3],
  getName: function(){
    console.log(this.name);
  }
}

const child1 = Object.create(child);
const child2 = Object.create(child);
child1.eat.push(4);
child1.eat; // [1,2,3,4]
child2.eat; // [1,2,3,4]

```
缺点: 虽然简洁，但是同样存在引用同个引用问题
### 寄生式继承
与原型式差不多，只不过多了可以扩展父类的方法
### 寄生组合式继承
```js

.... // 与组合继承一样，只不过prototype的赋值有些不同
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const child1 = new Child();
const child2 = new Child();
child1.eat.push(4);
child1.eat; // [1,2,3,4]
child2.eat; // [1,2,3]
```
最优继承方式
## new 实现

1. **创建空对象 `obj` = {}**
2. **`this`指向新对象，并执行构造函数，并获取返回结果**
3. **设置原型链，新对象原型对象指向构造函数`prototype`**
4. **判断构造函数返回结果是否为对象，是则返回，否则返回由`new`创建的对象`a`**

```javascript
function myNew() {
  const obj = {};
  const constructor = [].shift.call(arguments);
  const result = constructor.apply(obj, arguments); // 改变构造函数中的this
  obj.__proto__ = constructor.prototype; // obj的原型对象指向构造函数prototype
  return typeof result === "object" ? result : obj;
}
myNew(function () {
  this.a = 2323;
}); // {a: 2323}
new (function () {
  this.a = 2323;
})(); // {a: 2323}
```

## instanceOf 实现

```js
function A() {}
const a = new A();
a instanceof A; // true
a instanceof Object; // true

function myInstanceof(a, b) {
  let p = a.__proto__;
  while (p) {
    if (p === b.prototype) {
      return true;
    }
    p = p.__proto__;
  }
  return false;
}
```

## 性能优化

### 如何让网络通信更快

#### CDN

CDN 全称 content delivery network，又称`内容分发网络`，CDN 有两个指标，`全局负载均衡`和`缓存系统`

1. 全局负载均衡
   用户在访问服务器的时候，首先要向 `DNS 服务器`发起请求，经过解析后返回到这个网站域名的注册服务器去解析，`DNS 解析服务器`会**解析到另外一个域名，这个域名最终指向` CDN 全局负载均衡服务器`**，然后智能的挑选一个就近的最佳节点。
2. 缓存系统(命中率&回源率)
   - 命中率: `命中缓存的次数/总请求次数`
   - 回源率: 没命中缓存，即从服务器拿数据

#### 减少请求次数

##### 资源合并

http 请求是需要建立连接的，这个过程是需要时间的，当多个资源有多个请求时，明显的很耗费时间  
解决方案：

1. 雪碧图

##### 域名分片

同个域名浏览器可以有 6-8 个网络连接（tcp 连接），**以 `Chrome` 为例，限制一个域名同时并发 6 个连接**
解决方案：

1. 多域名

##### HTTP 缓存

[HTTP 缓存](../http/readme.md#缓存)

#### 压缩资源

##### 数据压缩

1. gzip 与新的 br

gzip: 运用广泛  
br: 由 `Chrome` 开发的新的压缩算法，性能比 `gzip` 高由于浏览器兼容问题，运用不广

##### 代码文件压缩

1. HTML/CSS/JS 中的注释、空格、长变量名等

##### 静态资源

1. 字体图标，去除元数据（图片中的作者，时间，大小等信息），缩小尺寸及分辨率，使用 `jpg` 或者 `webp` 格式

##### 头与报文

1. `http1.1` 中减少不必要的头
2. 减少 `cookie` 数据量

#### HTTP2 协议

`HTTP2 协议`本身就比 `HTTP1.1` 快上很多!

那么快在哪？

##### 头部压缩

**臃肿的请求**头（平均测试为 `460` 字节）是使之变慢的重要原因之一，HTTP2 为此的解决方案：

1. 专门的 HPACK 压缩算法
   - 索引表
   - 霍夫曼编码

**索引表：**

需要`客户端`和`服务端`共同维护，分为一个静态表 `Static Table`（**静态表存放几乎所有常用的头信息键值对**），一个动态表 `Dynamic Table`。

- 当客户端请求的时候只需要发送表`Static Table`中的索引值比如: `:method=GET` 用 2 表示等，并且值会通过**霍夫曼编码**进行压缩字符
- 当发送了一个在`Static Table`中的 `User-Agent`，索引为 ` 58，但是他的值不在``Static Table `中，请求的时候用 `58`，表示 `User-Agent`，服务器接收后会将 `User-Agent` 添加到`Dynamic Table`，缓存起来

##### 二进制帧

在 HTTP1.1 文本字符分割的数据流，导致解析慢且容易出错，解决方案：  
**二进制帧：**

1. 帧长度
2. 帧类型
3. 帧标识

##### 链路复用(多路复用)

![屏幕截图 2021-12-31 010537](/images/屏幕截图%202021-12-31%20010537.png)

> 简单来说： **一个域名只维护一个 TCP，一个 TCP 可以并发多个 HTTP 请求**

那么多路复用有什么优点以及怎么在现实体现它的快速呢：  
假设，有服务端的最大并发 `TCP` 量为 `600，那么在` `HTTP1.1` 下，一个客户端最大的 `TCP` 并发为 `6` 个，那么在最大的并发量下，可接纳最多的用户为` 600 / 6 = 100` 个，那如果第 `101` 一个发起请求，那么还要等那 `100` 用户其中之一的 `TCP` 完成之后才开始`（队头阻塞`）。那么在 `HTTP2` 的多路复用下：  
**一个域名共用一个 TCP，意味着可达到的并发用户量为 600 / 1 = 600 个！与服务端并发量达到一致。并且一个 TCP 可并发多个 HTTP 请求**，再利用上述所说二进制分层实现并行请求，任何时候都可以发送请求给服务器解决对队头阻塞问题

### 如何让数据处理更高效

1. HTML 语义标签加强 DOM 解析
2. 多使用为元素，减少 JS 多 DOM 的查找遍历
3. 能用 HTML/CSS 实现的效率就不用用 JS
4. 逻辑与展示解耦，避免不必要的 JS 引擎启动（HTML 出现 js 代码）
5. 减少作用域查找和闭包，避免==
6. SSR 服务端渲染（next.js，nuxt.js）

#### SSR 服务端渲染

在客户端请求服务器的时候，服务器到数据库种获取数据，并且在服务器种将 vue 等组件，数据等转化为 HTML，服务器再将 HTML 返回给客户端。**这个在服务器将组件数据等转为 HTML 的过程就叫服务端渲染**  
要了解 SSR，首先要了解同构的概念。

##### 同构

在服务端渲染中，有两种页面渲染方式，

1. 前端服务器通过请求服务器获取数据并组装 HTML 返回给浏览器，浏览器直接解析 HTM 给页面
2. 浏览器在交互过程中，请求新的数据并动态更新渲染页面

这两种有一点不同点，也就是第一种是在服务器将 HTML 返回给客户端，而第二种是在客户端组成 HTML，运行环境不一样那么同构要做的事就是用一套代码兼容这两种情况

##### 同构的条件

对于同构的应用来说，必须实现客户端和服务端的路由、模型组件、模型数据的共享。

SSR 图解：  
![SSR图解](.//images/786a415a-5fee-11e6-9c11-45a2cfdf085c.png)

## 解释性语言和编译性语言

`编译性语言（C/GO...）`,在程序运行之前要经过编译器编译，编译后机器保留机器能读懂的二进制文件，当程序运行的时候直接运行二进制，不需重新编译  
`解释性语言（JS/Python..）`,在每次运行时都要经过解释器动态解释和运行

编译器和解释器原理：  
![编译器和解释器](.//images/e10bcb4c5b2d5fc20787089de0e10a5.png)

### 如何执行 JS

JIT(即时编译 just in time)技术：  
热点代码会执行编译。  
![js执行过程](.//images/bde7952e95c68bba437997ddc92d89f.png)

1. 逐行解逐行执行
2. 热点区一次性编译（JIT）
   字节码需要解释器转换成机器码才能执行

> ps: 机器码所需内存比字节码大，但是执行速度快,

## ES7

- Array.prototype.includes()
- Math.pow()

## ES8

- async/await
- Object.values()
- Object.entries()

## ES9

- 异步迭代

```js
for (let i of array) {
  await doSomething(i);
}
```

- Promise.finally()
- Rest/Spread 属性

## ES10

- flat()
- flatMap()
- Object.fromEntries()
- BigInt

## ES11

- 空值处理 ??
- 可选链 ?
- Promise.allSettled
- Dynamic import

## 隐式转换

js 的隐式转换会发生在运算过程，比如`+ - * / == < >`;
简单类型：  
一般的情况会将两侧转换会数字再进行运算：  
比如：

```js
1 + false; // 1
1 + Number(false); // 1 + 0

1 == false;
1 == Number(false); // 1 == 0
```

特殊情况：
当 `+` 号 两个存在字符串，两边会直接当作字符串运算

```js
1 + "1"; // 11
```

引用类型：  
会执行`ToPrimitive`运算，默认执行 `valueOf -> toString` 转换基本类型运算

```js
let a = {};
a > false; // false

a.valueOf(); // {}
a.toString(); // [object Object]
Number("[obejct Object]") > false; // NaN > false
```

## 浏览器窗口通讯
