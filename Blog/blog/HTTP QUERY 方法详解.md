---
title: "HTTP QUERY 方法详解"
description: "HTTP QUERY 新方法的语义与用法详解"
date: "2026-07-01"
categories:
  - 前端技术
tags:
  - HTTP
  - QUERY
  - 协议
---

# HTTP QUERY 方法详解

2026 年 6 月，IETF 正式发布 **RFC 10008**，为 HTTP 协议引入了一个全新的请求方法——**QUERY**。它是 GET、POST、PUT、PATCH、DELETE 之后，HTTP 标准方法家族的新成员，专门用来填补“复杂读取请求”长期以来的表达空白。

<callout emoji="💡">
**一句话理解：QUERY = 能带请求体的安全 GET。**它像 POST 一样可以在 body 里传复杂查询，又像 GET 一样安全、幂等、可缓存，明确告诉服务端和中间层“这只是个读操作”。
</callout>

# 一、为什么要再造一个方法？

传统的“查数据”几乎只能用 GET，但 GET 有一个硬约束：**请求参数只能放在 URL 里**。简单场景没问题，可一旦查询变复杂，麻烦就来了：

- **参数太长** → 触发 URL 长度限制（常见 2KB~8KB），复杂过滤、深分页、大范围 ID 列表根本塞不下
- **结构嵌套深** → 拼成 query string 既难写又难读，JSON 不得不扁平化或 base64 编码，语义全丢
- **含敏感信息** → 放在 URL 里会被写进访问日志、浏览器历史、Referer、网关日志，存在泄露风险
- **退而用 POST** → 想用 body 传查询只能选 POST，但 POST 语义是“会产生副作用”，不安全也不幂等，浏览器预检、自动重试、缓存层、爬虫都会把它当作“可能改状态”的操作

QUERY 正是为解开这个结而生：让“带 body 的读取”拥有和 GET 一致的安全语义。

# 二、它处在什么位置？

QUERY 填的是 GET 和 POST 之间的空档。下表对比三者核心特性：

| 方法 | 能带请求体 | 安全（无副作用） | 幂等 | 可缓存 |
|-|-|-|-|-|
| **GET** | ❌ | ✅ | ✅ | ✅ |
| **QUERY** | ✅ | ✅ | ✅ | ✅ |
| **POST** | ✅ | ❌ | ❌ | 通常否 |

**安全（safe）**：不改变服务器资源状态；**幂等（idempotent）**：多次请求结果一致。QUERY 同时满足这两点，因此可以放心地被重试、被预取、被缓存。

# 三、长什么样：一个完整请求

```http
QUERY /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{
  "filter": { "role": "admin", "active": true },
  "sort": { "createdAt": "desc" },
  "page": 2
}
```

几个关键点：

- 方法名是 `QUERY`（大写）
- 仍需带 `Content-Type` 声明 body 格式
- body 里放的是“查询描述”，而不是要提交的数据

```bash
curl -X QUERY https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"filter":{"role":"admin"},"page":2}'
```

对应的前端写法（TypeScript / fetch）：

```typescript
const res = await fetch("https://api.example.com/users", {
  method: "QUERY",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    filter: { role: "admin", active: true },
    sort: { createdAt: "desc" },
    page: 2,
  }),
});

const data = await res.json();
```

# 四、典型使用场景

- **复杂搜索 / 高级筛选**：多维度过滤、嵌套条件、自定义排序
- **深度分页与游标遍历**：cursor、after/before 标记放 body 更干净
- **大批量 ID 查询**：按一组 ID 拉取实体，数量超过 URL 承载能力
- **GraphQL / 数据 API 风格查询**：把查询表达式作为 body 提交
- **报表 / 聚合查询**：查询参数本身是一段结构化 DSL

# 五、安全模型与缓存

<callout emoji="📌">
QUERY 被定义为 safe + idempotent，带来三个直接收益：
- **可安全重试**：网络抖动时客户端可自动重试，不会产生副作用
- **可缓存**：配合 Cache-Control 等头，理论上可被缓存；但带 body 的缓存机制比 GET 复杂，实际支持仍在演进
- **不应改变状态**：服务端实现 QUERY 逻辑时必须保证只读
</callout>

# 六、现状与注意事项

- **协议刚标准化**（2026 年 6 月成为 RFC），生态支持仍在早期
- **浏览器**（截至 2026 年 6 月）：Chrome / Firefox / Safari 对 QUERY 的**原生支持仍在跟进**，fetch / XMLHttpRequest 能否真正发出取决于各引擎实现；正式纳入需 WHATWG [Fetch Standard](https://fetch.spec.whatwg.org/) 更新，可跟踪各浏览器平台状态（Chrome Status / WebKit / Firefox 发行说明）
- **Node.js / 运行时**（截至 2026 年 6 月）：核心支持依赖 HTTP 解析器 `llhttp` 先支持 QUERY，进展跟踪 [nodejs/node Issue #51562](https://github.com/nodejs/node/issues/51562)；独立安装较新的 `undici`（Node 内置 fetch 的实现）可获取更新的解析器；老版本 Node.js 的解析器会直接拒绝该方法
- **HTTP 客户端库（axios 等）**：截至当前 axios **尚未在稳定版官方支持** QUERY（功能请求见 [axios Issue #5465](https://github.com/axios/axios/issues/5465)，相关 PR 仍在评审、未合并）；可临时用 `axios.request({ method: "QUERY", ... })` 传入自定义方法，但能否真正发出取决于底层运行时（Node.js 的 HTTP 解析器、浏览器 fetch/XHR）是否接受该方法，老版本 Node.js 会直接拒绝
- **后端框架 / Java 全家桶**（截至 2026 年 6 月）：Spring Framework 7 已将 `HttpMethod` 从 enum 重构为 class，为扩展新方法铺路（见 [Issue #27697](https://github.com/spring-projects/spring-framework/issues/27697)）；函数式路由已可用 QUERY，注解模型 `@RequestMapping` 的 QUERY 支持仍在推进（跟踪 [Issue #32975](https://github.com/spring-projects/spring-framework/issues/32975)）；Jakarta Servlet 规范尚未纳入 QUERY，Tomcat / Jetty 需在连接器层接受该方法；Nginx 等网关通常不限方法名可转发，但 `limit_except` / 方法白名单可能拦截。其他语言生态（Express、Gin、FastAPI 等）同理，需框架显式识别
- **缓存键**：带 body 的缓存键计算在规范中留有空间，实现可能不一致
- **过渡期可与 GET / POST 并存**：新接口用 QUERY，老接口保持不变，逐步迁移

<callout emoji="📝">
如果你今天的痛点是“查询很复杂、GET 装不下、又不想用 POST 牺牲语义”，那么 QUERY 正是为你准备的答案——只不过需要等生态跟上。
</callout>

# 参考资料

- [RFC 10008 — The HTTP QUERY Method（IETF）](https://datatracker.ietf.org/doc/rfc10008/)
- [HTTP Working Group 规范草案](https://httpwg.org/http-extensions/draft-ietf-httpbis-safe-method-w-body.html)
- [HTTP Toolkit — Defining a New HTTP Method](https://httptoolkit.com/blog/http-search-method/)
- [Kreya — The New HTTP QUERY Method Explained](https://kreya.app/blog/new-http-query-method-explained/)
- [Nordic APIs — Guide to the New HTTP QUERY Method](https://nordicapis.com/your-guide-to-the-new-http-query-method/)