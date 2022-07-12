---
title: typescript
date: 2022-05-04 11:08:20
tags: 知识点
categories: [javascript, typescript]
---

文章内容不会仔细讲基础用法，而是从 `typescript` 的应用场景，优点，还有工作中常用的知识角度总结。

> 去往 [typescript](https://www.typescriptlang.org/) 官网查看基础用法等

## 应用场景

1. 当调用函数，没有任何注释时，硬头皮看入参逻辑
2. 代码健壮性，需要展示函数的各种参数给别人看时
3. 维护底层类库，优化参数类型却不知有多少引用时
4. 定义好接口，但联调时发生 length 取不到错误时

**还可以做什么**

5. vscode 补全语法
6. 重构代码
7. 接口定义代替文档
8. 养成类型思维

## 特点

1. 类型检查

   在编译阶段就完成了数据的类型检查抛错，不会打包上线，降低线上 bug 率

2. 语言扩展

   与 ES 规范保持一致同时，也会借鉴其他语言的特性，比如 抽象类，接口，装饰器等新语法特性

3. 工具属性

   可以编译成 js，无需任何加成就可以在任何平台上运行

## 常用的基本的关键字

`as` / `interface` / `type` / `extends` / `enmu` / `is` / `keyof`，简单介绍：

- **as**：类型断言，比如：`let o: number | string; (o as string).length`
- **interface**：定义接口类型，可重复定义
- **type**：一般用于简单类型的接口定义，不可重复定义
- **extends**：用在类身上代表继承，用在接口（interface）上代表扩展属性，用在条件类型上代表对类型的约束
- **enmu**：枚举
- **is**：判断一个变量属于某种类型或接口
- **keyof**：可枚举对象的属性

## 枚举 enum

```ts
enum Role {
  Owner = 1,
  Guest,
}
```

编译成 js：

```js
var Role;
(function(Role){
  Role[Role['Owner'] = 1] = 'Owner'
  Role[Role['Guest'] = 2] = 'Guest'
})(Role || Role = {})

```

枚举成员属性`只读`

```js
Role.Owner = 2; // 只读不可修改
```

### 计算成员和表达式

```ts
enum Enum {
  a = 1 + 2,
  b = Math.random(),
  c = '123'.length,
}
```

编译成 js：

```js
var Enum;
(function (Enum) {
  Enum[(Enum['a'] = 3)] = 'a';
  Enum[(Enum['b'] = Math.random())] = 'b';
  Enum[(Enum['c'] = '123'.length)] = 'c';
})(Enum || (Enum = {}));
```

- 表达式 `a` 成员在编译阶段完成
- 计算属性 `b` 成员和 `c` 成员，不会在编译时算出结果而是会推迟到代码执行阶段

### 常量枚举

```ts
const enum Enum {
  a,
  b,
  c,
}
const Month = [Enum.a, Enum.b, Enum.c];
```

编译成 js：

```js
var Month = [0 /* Enum.a */, 1 /* Enum.b */, 2 /* Enum.c */];
```

常量枚举，只能编译枚举的值，可以减少编译后的的代码

## 接口和类

`class` 在被类型继承时可自动分析成类型比如：

```ts
class Auto {
  state = 1;
}

interface AutoInterface extends Auto {}
```

当 `AutoInterface` 作为一个类的接口时，那么该类就必须实现接口了的属性和方法：

```ts
class A implements AutoInterface {
  state = 23; // 需要实现 Auto 里的属性
}
```

但是只能共享公共属性，不能有保护和私有属性比如：

```ts
class Auto {
  state = 1;
  private name = 'hello';
}

class A implements AutoInterface {
  // 类“A”错误实现接口“AutoInterface”。
  state = 23;
}
```

> Class `'A'` incorrectly implements interface `'AutoInterface'`.
> Property `'name'` is missing in type `'A'` but required in type `'Auto'`.

对于私有属性若一定要实现 `AutoInterface` 接口，那么可以先继承 `Auto` 类：

```ts
class A extends Auto implements AutoInterface {
  state = 23;
}
```

这样就不报错了。

接口和类之间的关系可以概括如下图：

![interface/implements/extends/class](/images/interface.png)

`interface` 可以用 `extends` 来扩展，并且可以通过 `extends` 继承类中的所有属性方法。
`class` 可以通过 `implements` 实现 `interface` ，但是仅限于`公共属性`

## 泛型

泛型指不预先确定的数据类型，具体的类型在使用的时候才能确定

泛型不能运用于静态成员

泛型约束：

```ts
interface Length = {
  length: number;
}

function Log<T extends Length>(value: T) {
  return value.length
}
```

上面例子代表着 Log 函数传进去的参数必须要有 length 属性

```ts
Log([1]);
Log('123');
Log({ length: 1 });
```

## 类型兼容

1. 接口兼容
   成员少的会兼容成员多的

   ```ts
   let x = { a: 1, b: 2 };
   let y = { a: 1, b: 2, c: 3 };

   x = y;

   y = x; // 报错
   ```

2. 函数兼容

   - 参数个数

     ```ts
     type Handler = (a: number, b: number) => void;
     function hof(handler: Handler) {}
     let handler1 = (a: number) => {};
     let handler2 = (a: number, b: number, c: number) => {};

     hof(handler1);
     hof(handler2); // 报错。 handler2 比 Handler 多一个参数
     ```

     参数多的兼容参数少的

   - 参数类型

     ```ts
     interface Point3D {
       x: number;
       y: number;
       z: number;
     }
     interface Point2D {
       x: number;
       y: number;
     }
     let p3d = (p: Point3D) => {};
     let p2d = (p: Point2D) => {};

     p3d = p2d;
     p2d = p3d; // 报错
     ```

     参数是对象时，成员多的可以兼容成员少的

   - 返回值类型
     ```ts
     let f = () => ({ name: 'a' });
     let g = () => ({ name: 'a', location: 'b' });
     f = g;
     g = f; // 报错
     ```
     与接口兼容一样

## 类型保护

`类型保护`：ts 能够再特定的区块中保证变量属于某种确定的类型，有 4 种方法：

1. instanceof
2. in
3. typeof
4. 创建一个保护类型的函数

```ts
class Java {
  helloJava() {}
}

class Javascript {
  helloJavascript() {}
}

function isJava(lang: Java | Javascript): lang is Java {
  return (lang as Java).helloJava != null;
}

function getLang(lang: Java | Javascript) {
  if (isJava(lang)) {
    lang.helloJava(); // 自动提示 helloJava 方法
  } else {
    lang.helloJavascript(); // 自动提示 helloJavascript 方法
  }
}
```

## type 和 interface 区别

- type 不可以重复声明
- 扩展类型的表达方式不同

官网例子：

```ts
// Interface
interface Animal {
  name: string;
}

interface Bear extends Animal {
  honey: boolean;
}

const bear = getBear();
bear.name;
bear.honey;
```

```ts
// type
type Animal = {
  name: string;
};

type Bear = Animal & {
  honey: boolean;
};

const bear = getBear();
bear.name;
bear.honey;
```

```ts
interface Window {
  title: string;
}

interface Window {
  ts: TypeScriptAPI;
}

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
```

```ts
type Window = {
  title: string;
};

type Window = {
  ts: TypeScriptAPI;
};

// Error: Duplicate identifier 'Window'.
```

## never/unknow/any 区别

- any: 代表任何类型，没有类型校验
- unknow：未知类型，编译器不能推断类型显示 `unknow` ，配合 `as` 可以用来强制转换类型
- never：永远不会返回类型，可用于函数和属性

never 的例子：

```ts
interface Man {
  type: 'man';
}

interface Woman {
  type: 'woman';
}

type ManKind = Man | Woman;

function getType(value: ManKind) {
  switch (value.type) {
    case 'man':
      return 'man';
    case 'woman':
      return 'woman';
    default: //  这里 value 的 类型便是 never
      console.log(value);
      return '';
  }
}
```

若 `value` 的类型 在 `switch` 都列举完了，那么理论上，永远都不会执行到 `default` ，所以 `value` 的类型是 `never`

## 索引类型

有时会获取对象的值去组合成一个集合例如：

```ts
let obj = {
  a: 1,
  b: 2,
  c: 3,
};
// values [1,2,3]
function getValues(obj, keys: string[]): number[] {
  return keys.map((key) => obj[key]);
}

getValues(obj, ['a', 'b']); // [1,2]
getValues(obj, ['d', 'e']); // 利用类型约束 提示不存在的属性
```

改成如下：

```ts
function getValues<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map((key) => obj[key]);
}
```

## Pick/Partial/Record/Readonly 高级用法

```ts
interface Obj {
  a: number;
  b: string;
  c: boolean;
}

Pick<Obj, 'a' | 'b'>; // { a: number; b: string }

Readonly<Obj>; // 属性都变成只读

Partial<Obj>; // 属性都变成可选

Record<'a' | 'b', Obj>; // 将 a 和 b 映射成 Obj类型
```

`Pick` 实现原理

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

`Readonly` 实现原理

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

`Partial` 实现原理

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

`Record` 实现原理

```ts
type Record<T extends keyof any, K> = {
  [P in T]: K;
};
```

## 条件类型

`T extends U ? X : Y`

这里的 `extends` 指的是 `T` 分配给 `U` ，所以 `T` 中要有满足 `U` 的所有成员才成立。要**跟类的 extends 区分开，并不是 T 继承 U，T 是 U 的子类的概念**

举例说明：

```ts
interface A {
  a: number;
  b: string;
  c: boolean;
}

interface B {
  a: number;
  b: string;
}
```

`A` 中有 `B` 的所有成员，那么 `A extends B` 成立

```ts
interface A {
  a: number;
}

interface B {
  a: number;
  b: string;
}
```

`A` 缺少 `B` 中的 `b` 成员，那么 `A extends B` 不成立

### 联合的条件类型

普通的联合的条件类型：

`T | P extends U ? X : Y`

```ts
type A = {
  a: number;
  b: number;
};

type B = {
  b: number;
};

type C = {
  a: number;
  b: number;
};

type Re = A | B extends C ? 'a' : 'null'; // null
```

`A` 和 `B` 必须都满足 `C` 中的成员才成立，但有一种特殊的条件联合类型，`泛型的联合类型`

同样的 `A / B / C`，但是将 `Re` 改成泛型：

```ts
type Re<T> = T extends C ? 'a' : 'b';

let re: Re<A | B>; // a | b
```

泛型的条件联合类型它会进行拆解成 `多个的条件联合类型`：

```ts
let re: Re<A | B>;
// 拆解
let re: Re<A> | Re<B>; // a | b
let re: A extends C ? 'a' : 'b' | B extends C ? 'a' : 'b'; // a | b
```

## 重写属性类型

有些时候，可能会对某一类库的类型进行二次开发，发现某一个属性的类型不符合我们预期，我们可以引用类库的类型，并且对属性进行重写类型比如
假设 一个用户信息表格的接口，返回了的数据 `result` 中有列对应的字段以及值，
列对应的字段类型如下：

```ts
interface TableData {
  userName: string;
  age: string;
}

const result: TableData[]; // 返回的接口数据结构
```

那么有一个类库表格的类型 `TableProps`， 其中包含列的类型 `TableColumn` ：

```ts
interface TableColumn {
  /* 显示于列头文本 */
  label?: string;
  /** 对应列内容的字段名 */
  prop?: string; // userName  age
}

interface TableProps {
  /* 省略其他 */
  tableColumn: TableColumn[];
}
```

假设有一个函数 `createTable` 里面返回了列表的配置信息，执行之后会根据配置去匹配接口返回来的 `result` 生成一个表格：

```ts
function createTable(): TableProps {
  return {
    /* 省略其他配置 */
    tableColumn: [
      {
        label: '姓名',
        prop: 'userName',
      },
      {
        label: '年龄',
        prop: 'age',
      },
    ],
  };
}
```

可以看出来 `tableColumn` 里的 `prop` 现在只是 `string` 类型，但是在实际代码中，我们是可以提前知道 `prop` 对应的后端字段是什么，所以其实还可以优化，可利用 `Omit` 重写 `prop` 的类型：

```ts
interface MyTableColumn<T> extends Omit<TableColumn, 'prop'> {
  prop?: keyof T; // userName  age
}

interface TableProps<T = any> {
  /* 省略其他 */
  tableColumn: MyTableColumn<T>[];
}

// 这样，在写 prop 的时候就会自动提示有哪些后端字段了
function createTable(): TableProps<TableData> {
  return {
    /* 省略其他配置 */
    tableColumn: [
      {
        label: '姓名',
        prop: 'userName',
      },
      {
        label: '年龄',
        prop: 'age',
      },
    ],
  };
}
```

## import type

类型保护，不会编译
