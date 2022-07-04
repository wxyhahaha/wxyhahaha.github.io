---
title: angular升级
date: 2021-09-22 17:11:34
tags: 笔记
---

## 6 升 7

项目使用 `angular@6+ng-zorro-antd@1.5`
背景：
项目中列表数据量大，滚动，操作等卡顿
此前已经根据该问题利用数据触底加载的方案进行简单优化，但是当全部数据加载完毕时，页面还存在卡顿现象
原因：

> All watchers are run every time anything happens. Click handlers, HTTP response processors, and timeouts all trigger a digest
> 每次发生任何事情时，所有的观察者都会运行。点击处理程序、HTTP 响应处理器和 settimeout 等都会触发脏值检测

`angular` 的检测机制有关，点击页面都会影响 `angular` 去检测组件，当页面有大量 dom 时检测成本也相应变高，导致页面卡顿 
1. 利用 `angular` 框架自带的虚拟滚动
（需要将 `cdk` 升级到 `7`，cdk 的升级是与其他 angular 模块分开升级的，可查看 cdk 的更新日志）
去优化，减少 `dom` 节点，减少检测 
2. 采用 `CheckOnce` 策略 https://angular.cn/api/core/ChangeDetectionStrategy
过程：

```bash
1. ng update @angular/cli@7 ng update @angular/core@7
2. ng update @angular/cdk@7
3. ng update ng-zorro-antd@7
```

升级后样式会有差异：

1. `nztree` 树状组件箭头图标显示
2. `nztable` 表格内 `font-family` 字体
3. 很多组件采用 `onpush` 策略，数据需要改变引用指针才会触发页面更新

参考文档：
> angular： https://github.com/angular/angular/blob/master/CHANGELOG.md#700-2018-10-18
  cdk: https://github.com/angular/components/blob/master/CHANGELOG.md#700-amethyst-ammonite-2018-10-17
  ng-zorro-antd: https://ng.ant.design/version/7.5.x/docs/changelog/zh#7-0-0
  更新指南: https://update.angular.io/?l=2&v=9.1-10.0

## 8 升 9 9 升 10

升级一个项目框架，要从几个方面考量 

1. 升级的必要性 
2. 升级的版本兼容性 
3. 升级之后带来了什么好处

1. 大小（包括升级期间，调整的兼容性代码）

升级前：
1.22+2.1=3.12

升级后：9
1.7+1.21=2.91

升级后：10
1.45+1.31=2.76

2. 过程

```bash
1.ng update @angular/cli@8 ng update @angular/core@8
2.ng update @angular/cli@9 ng update @angular/core@9
3.ng update @angular/cdk@9
4.ng update ng-zorro-antd@9
```

```bash
1.ng update @angular/cli@10 ng update @angular/core@10
2.ng update @angular/cdk@10
3.ng update ng-zorro-antd@10
```

安装相应的版本，会自动检查代码，自动补丁相应版本指令，参数等...，检测不到的根据编辑器提示自行手动调整
从旧版本升级 `ng-zorro-antd` 需要注意，某些样式会有微调。会稍微影响布局。可自行调整，影响不大

> 9 升级 10 时需要注意 使用二级入口
`ng-zorro-antd v8` 中弃用了 `NgZorroAntdModule` 和一级入口，并保留了 2 个版本后在此版本中移除

## 10 版本
有关 `CommonJS` 导入的警告
当您使用 `CommonJS` 打包的依赖项时，它会导致应用程序变慢。
`从版本 10 开始`，当您的构建引入这些捆绑软件之一时，我们现在向您发出警告。如果您开始对依赖项看到这些警告，请让您的依赖项知道您更喜欢 ECMAScript 模块（ESM）捆绑包。
`angular.json` 添加配置允许 `commonjs` 引入不警告

```json
"allowedCommonJsDependencies": [
  "@angularclass/hmr"
],
```

更新指南： https://update.angular.io/?l=2&v=9.1-10.0
