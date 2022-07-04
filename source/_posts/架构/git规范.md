---
title: husky和commitlint的使用
date: 2022-03-13 18:21:31
tags: 架构
---

说明： 项目中需要约定提交信息规范，可使用 `husky` 和 `commitlint`，对 `git` 的 `commit` 信息进行校验。
该插件针对，`changelog` 有很大的用处，因为生成 `changelog` 需要 `commit` 的规则规范，`husky` 和 `commitlint` 可以很好的配合

## 安装

```bash
yarn add husky --dev
yarn add pinst --dev # ONLY if your package is not private
```

## 开启 Git Hooks

```bash
yarn husky install
```

## 要在安装后自动启用 Git Hooks，请编辑 package.json

```json
{
  "private": true, // ← your package is private, you only need postinstall
  "scripts": {
    "postinstall": "husky install"
  }
}
```

> postinstall 会在你 yarn 安装时自动执行

## Hooks

### 命令创建 hooks

```bash
npx husky add .husky/[gitHooks]  [content]
```

### commit-msg

```bash
# $1 .git/COMMIT_EDITMSG
npx husky add .husky/commit-msg npx --no-install commitlint --edit $1
```

创建 `commitlint.config.js` 对 `commit` 校验

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

可扩展自定义规则，默认的规则如下：

```js
	rules: {
		'body-leading-blank': [1, 'always'],
		'body-max-line-length': [2, 'always', 100],
		'footer-leading-blank': [1, 'always'],
		'footer-max-line-length': [2, 'always', 100],
		'header-max-length': [2, 'always', 100],
		'subject-case': [
			2,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
		],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'type-enum': [
			2,
			'always',
			[
				'build',
				'chore',
				'ci',
				'docs',
				'feat',
				'fix',
				'perf',
				'refactor',
				'revert',
				'style',
				'test',
			],
		],
	},
```

## 测试

```bash
git commit s
```
