---
title: "Model Context Protocol 2026-07-28 规范"
description: "MCP 官方博文规范的中英对照"
date: "2026-07-30"
categories:
  - AI 与编程工具
tags:
  - MCP
  - 规范
  - 翻译
---

# Model Context Protocol 2026-07-28 规范

July 28, 2026 · 12 min · David Soria Parra (Lead Maintainer), Den Delimarsky (Lead Maintainer)

**2026 年 7 月 28 日 · 12 分钟 · David Soria Parra（首席维护者）、Den Delimarsky（首席维护者）**

原文链接：[The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

The 2026-07-28 Model Context Protocol specification is out, bringing a stateless protocol core, Multi Round-Trip Requests, header-based routing, cacheable list results, authorization hardening, a formal extensions framework, and updated Tier 1 SDKs.

**2026-07-28 版 Model Context Protocol 规范正式发布，带来了无状态协议内核、多轮往返请求、基于头部的路由、可缓存的列表结果、授权加固、正式的扩展框架，以及更新的 Tier 1 SDK。**

Since our last November release MCP continued to grow at an astonishing rate. Across our Tier 1 SDKs, we're seeing close to half-a-billion downloads a month, with both TypeScript and Python SDKs crossing the 1 billion total downloads threshold. In just a few months, the protocol continued to grow as the data and interactivity substrate for agentic workflows.

**自我们去年 11 月的发布以来，MCP 以惊人的速度持续增长。在我们的 Tier 1 SDK 中，我们看到月下载量已接近五亿次，TypeScript 和 Python 两个 SDK 都跨过了累计下载量十亿次的门槛。在短短几个月里，该协议作为智能体工作流的数据与交互基底持续成长。**

Today, we're officially pushing the release button on the next version of the MCP specification, 2026-07-28, along with the SDKs that will allow you to start building clients and servers right away.

**今天，我们正式为下一版 MCP 规范 2026-07-28 按下发布按钮，同时发布的还有能让你立即开始构建客户端和服务器的 SDK。**

The highlight of this release is a stateless protocol core - MCP is transforming from a bidirectional stateful protocol into a request/response stateless protocol. It was one of the most highly-requested features from developers who were eager to get better reliability and scalability for their MCP servers.

**本次发布的重头戏是无状态协议内核——MCP 正从一个双向有状态协议转变为请求/响应式的无状态协议。这是那些渴望为自己的 MCP 服务器获得更好可靠性与可伸缩性的开发者们呼声最高的特性之一。**

There is, of course, more to what we're introducing with this version:

**当然，我们在这一版本中引入的远不止于此：**

- Every request is self-describing, with an optional discovery call for clients that want capabilities up front, so any request can land on any instance behind a plain round-robin load balancer.  
**每个请求都是自描述的，并为希望提前获知能力的客户端提供了一个可选的 discovery 调用，因此任何请求都能落到一台普通轮询负载均衡器背后的任意实例上。**
- Method and tool names travel in the Mcp-Method and Mcp-Name HTTP headers, so gateways can route and authorize on headers directly.  
**方法名和工具名随 Mcp-Method 和 Mcp-Name 这两个 HTTP 头部传输，因此网关可以直接基于头部进行路由与授权。**
- Server-to-client requests for things like sampling and elicitation are being redesigned to use Multi Round-Trip Requests (MRTR), removing the need for constantly open bidirectional streams.  
**服务器到客户端的请求（如 sampling 和 elicitation）正在被重新设计，以使用多轮往返请求（MRTR），从而无需始终保持打开的双向流。**
- List responses carry cache hints and a deterministic order, so clients can cache tool catalogs and keep upstream prompt caches stable across reconnects.  
**列表响应带有缓存提示和确定的顺序，因此客户端可以缓存工具目录，并在重连时保持上游提示缓存稳定。**
- Formally locking in on a proper extensions framework, with Tasks joining other extensions, such as MCP Apps and Enterprise Managed Authorization (EMA).  
**正式确立一个完善的扩展框架，Tasks 与其他扩展（如 MCP Apps 和企业托管授权 EMA）一同加入。**
- A set of authorization hardening changes including RFC 9207 issuer validation and a formal shift away from Dynamic Client Registration (DCR) toward client metadata documents (CIMD).  
**一组授权加固方面的变化，包括 RFC 9207 issuer 校验，以及正式从动态客户端注册（DCR）转向客户端元数据文档（CIMD）。**
- A formal deprecation policy with a twelve-month minimum window so you can plan upgrades instead of reacting to them.  
**一项正式的弃用政策，设有至少十二个月的窗口期，让你可以主动规划升级，而不是被动应对。**

The TypeScript, Python, Go, and C# SDKs are updated to match, with detailed migration notes for the breaking bits - and you can get started with the new spec right away.

**TypeScript、Python、Go 和 C# 的 SDK 已同步更新，并附带了针对破坏性变更的详细迁移说明——你可以立即基于新规范开始使用。**

# What changed / 有哪些变化

## No handshake or sessions / 不再有握手或会话

With the new spec version, we've officially retired the initialize/initialized exchange along with the Mcp-Session-Id header (refer to SEP-2575, SEP-2567). Each request now travels on its own, carrying its protocol version, client identity, and client capabilities in \_meta. If a client wants to learn a server's capabilities before doing anything else, there's a new server/discover Remote Procedure Call (RPC) for that; however, it is not required. Any request can now land on any server instance behind a plain round-robin load balancer without needing shared storage.

**在新版规范中，我们正式移除了 initialize/initialized 交换以及 Mcp-Session-Id 头部（参见 SEP-2575、SEP-2567）。每个请求如今都“独立前行”，在 \_meta 中携带自身的协议版本、客户端身份和客户端能力。如果客户端想在执行任何操作之前先了解服务器的能力，有一个新的 server/discover 远程过程调用（RPC）可用；不过它并非必需。如今任何请求都能落到一台普通轮询负载均衡器背后的任意服务器实例上，且无需共享存储。**

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search

{"jsonrpc":"2.0","id":1,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"},
 "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}
```

Dropping the protocol-level session doesn't force your application to be stateless. If your server needs to carry state across calls, mint an explicit handle from a tool and have the model pass it back as an argument. We found this works better than session state hidden in the transport - the model can see the handle and thread it between tools.

**放弃协议层的会话并不强制你的应用成为无状态。如果你的服务器需要跨调用携带状态，那就从一个工具中签发一个显式句柄，并让模型把它作为参数传回来。我们发现这比隐藏在传输层中的会话状态效果更好——模型能看到该句柄，并在各工具之间传递它。**

## Multi Round-Trip Requests (MRTR) / 多轮往返请求（MRTR）

MRTR replaces the server-initiated elicitation/create, sampling/createMessage, and roots/list requests that previously required a held-open stream.

**MRTR 取代了过去需要保持流打开的服务器端发起的 elicitation/create、sampling/createMessage 和 roots/list 请求。**

Sometimes a tool needs something from the user mid-call, such as a confirmation or a missing parameter. MRTR (SEP-2322) enables this scenario over a stateless protocol: the server returns resultType: "input_required" along with the requests it needs answered, and the client retries the original call with the answers attached in inputResponses.

**有时候某个工具在调用过程中需要从用户那里获取某些信息，例如一次确认或一个缺失的参数。MRTR（SEP-2322）在无状态协议上使这种场景成为可能：服务器返回 resultType: "input_required" 以及它需要被回答的请求，随后客户端把答案附在 inputResponses 中重试原始调用。**

## Header-based routing / 基于头部的路由

Streamable HTTP requests now must include Mcp-Method and Mcp-Name (SEP-2243). Your gateway, rate limiter, or WAF can route and meter on those headers instead of parsing JSON bodies.

**流式 HTTP 请求现在必须包含 Mcp-Method 和 Mcp-Name（SEP-2243）。你的网关、限流器或 WAF 可以基于这些头部进行路由与计量，而无需解析 JSON 报文体。**

## List results are cacheable / 列表结果可缓存

Responses from tools/list, prompts/list, resources/list, and resources/read now carry ttlMs and cacheScope (SEP-2549). This allows clients to determine the best caching strategy for responses and reduce unnecessary re-fetching.

**来自 tools/list、prompts/list、resources/list 和 resources/read 的响应现在带有 ttlMs 和 cacheScope（SEP-2549）。这让客户端能够为响应确定最佳缓存策略，并减少不必要的重复获取。**

## Authorization / 授权

From our discussions with implementers for the past year, authorization is where implementers spend most of their integration time. With this spec revision, we continued evolving the MCP auth and security posture.

**从我们过去一年与各实现方的讨论来看，授权是实现方花费集成时间最多的地方。伴随本次规范修订，我们继续推进 MCP 的授权与安全姿态。**

- Authorization servers should return the iss parameter per RFC 9207, and clients must validate it before redeeming a code (SEP-2468). This closes an authorization-server mix-up hole.  
**授权服务器应按 RFC 9207 返回 iss 参数，且客户端在兑换 code 之前必须对其校验（SEP-2468）。这堵上了一个授权服务器混淆漏洞。**
- Clients set application_type during Dynamic Client Registration (DCR) so authorization servers stop rejecting localhost redirects for desktop and CLI apps (SEP-837). If you've ever wondered why your CLI client's OAuth flow got a redirect_uri error, this is likely why. And while we're moving to Client ID Metadata Documents (CIMD) as the standard, this is a hardening measure making the protocol comply with OAuth spec requirements.  
**客户端在动态客户端注册（DCR）期间设置 application_type，使授权服务器不再拒绝桌面端与 CLI 应用所需的 localhost 回调（SEP-837）。如果你曾疑惑过为什么你的 CLI 客户端的 OAuth 流程会报 redirect_uri 错误，原因多半就在这里。而在我们转向以客户端 ID 元数据文档（CIMD）为标准的同时，这是一项加固措施，使协议符合 OAuth 规范要求。**
- Client credentials are bound to the issuer that minted them. No reuse across authorization servers (SEP-2352).  
**客户端凭据绑定到签发它的 issuer，不能跨授权服务器复用（SEP-2352）。**
- Dynamic Client Registration itself is now formally deprecated in favor of CIMD. DCR continues to work for backward compatibility, but will be removed in a future version of the MCP spec.  
**动态客户端注册本身现已正式弃用，让位于 CIMD。DCR 为向后兼容仍继续工作，但将在未来的 MCP 规范版本中被移除。**

## Tasks / 任务

Tasks move out of the experimental core and into the io.modelcontextprotocol/tasks extension, with a poll-based tasks/get and a new tasks/update (SEP-2663). Change notifications move from the old HTTP GET endpoint to a single subscriptions/listen stream that clients opt into per notification type.

**Tasks 从实验性内核移出，进入 io.modelcontextprotocol/tasks 扩展，采用基于轮询的 tasks/get 和新的 tasks/update（SEP-2663）。变更通知从旧的 HTTP GET 端点移到了一条单一的 subscriptions/listen 流，客户端可按通知类型选择加入。**

## Deprecations / 弃用

Roots, Sampling, and Logging are deprecated (SEP-2577). They still work, and they'll keep working for at least twelve months. New implementations shouldn't adopt them. The legacy HTTP+SSE transport is also considered to be officially deprecated, with a year-long offramp.

**Roots、Sampling 和 Logging 已被弃用（SEP-2577）。它们仍然可用，并将至少在十二个月内继续工作。新的实现不应再采用它们。传统的 HTTP+SSE 传输也被视为正式弃用，并有一年的退出过渡期。**

# SDKs / SDK

All four Tier 1 SDKs speak 2026-07-28 as of today:

**截至今日，全部四个 Tier 1 SDK 都已支持 2026-07-28：**

- TypeScript  
**TypeScript**
- Python  
**Python**
- Go  
**Go**
- C#  
**C#**

Beyond the Tier 1 set, the Rust SDK supports the new spec in beta.

**除 Tier 1 之外，Rust SDK 以 beta 形式支持新规范。**

The SDKs implement APIs that allow you to build both servers and clients with the new spec version. As we mentioned in the SDK beta blog post, there will be some migration cost, especially for developers that did depend on session identifiers; however, we incorporated early testing feedback that makes this process much easier.

**这些 SDK 实现了相关 API，让你能基于新版规范同时构建服务器和客户端。正如我们在 SDK beta 博文中提到的，这会带来一些迁移成本，尤其是对于那些确实依赖会话标识符的开发者；不过，我们吸收了早期测试反馈，使这一过程轻松得多。**

# Ecosystem support / 生态支持

As with any large release, the work that we're doing with MCP would not be possible without contributions from folks across the ecosystem. We're also especially grateful to a number of contributors and partners who helped us test and validate the spec before it became generally available.

**与任何大型发布一样，我们在 MCP 上所做的工作离不开生态系统中各方贡献者。我们还要特别感谢许多贡献者和合作伙伴，他们在规范正式发布前帮助我们测试和验证了规范。**

The new release is MCP's most important since remote MCP first launched over a year ago. It is a leap in serving scalable MCP servers and takes all the lessons learned over the last 18 months to provide a robust foundation for MCP's future. The newly added extensions showcase the continuous innovation of the wider open source project. I am excited to see what people will do with the new capabilities of MCP.

**本次新发布是自一年多前远程 MCP 首次推出以来 MCP 最重要的一次发布。它是在服务可伸缩 MCP 服务器方面的一次飞跃，并汇聚了过去 18 个月里学到的全部经验，为 MCP 的未来提供坚实基础。新增的扩展展现了更广泛开源项目的持续创新。我很期待看到人们用 MCP 的新能力做出些什么。**

David Soria Parra

**David Soria Parra**

Member of Technical Staff, Co-Inventor of MCP

**技术团队成员，MCP 联合发明人**

This release is the clearest signal yet that MCP is becoming real production-grade infrastructure. The biggest changes are breaking ones, and the community has chosen to do the hard work rather than paper over the gaps. That tracks with what we see across the enterprises we work with: MCP has already become the default these teams are building on, and this release is exactly the maturation they've been waiting for. This is a protocol growing up in real time around what production teams actually need, and it's a step forward for anyone building enterprise agents.

**本次发布是迄今为止最清晰的信号，表明 MCP 正在成为真正可投入生产的设施。最大的那些变化是破坏性的，而社区选择了做困难的事，而不是粉饰这些缺口。这与我们在合作的企业中所见的情况一致：MCP 已经成为这些团队构建时所用的默认选择，而本次发布正是他们一直等待的成熟。这是一个正围绕生产团队实际所需、实时成长起来的协议，对任何构建企业级智能体的人都是向前的一步。**

Alex Salazar

**Alex Salazar**

CEO & Co-Founder

**CEO 兼联合创始人**

AWS and Anthropic are committed to supporting the MCP community and helping developers ship enterprise-grade agents at scale. With the new MCP specification and its stateless protocol core available in Amazon Bedrock AgentCore, developers can deploy MCP servers on standard, scalable infrastructure without managing sessions or persistent connections. Tasks, one of the first official MCP extensions and contributed by AWS, brings support for reliable, long-running agents, so developers can spend less time on infrastructure and more time innovating.

**AWS 和 Anthropic 致力于支持 MCP 社区，帮助开发者大规模交付企业级智能体。凭借新 MCP 规范及其在 Amazon Bedrock AgentCore 中可用的无状态协议内核，开发者可以在标准的、可伸缩的基础设施上部署 MCP 服务器，而无需管理会话或持久连接。Tasks 是首批官方 MCP 扩展之一，由 AWS 贡献，它带来了对可靠、长时间运行智能体的支持，使开发者能花更少时间在基础设施上，把更多时间用于创新。**

Swami Sivasubramanian

**Swami Sivasubramanian**

VP of Agentic AI

**智能体 AI 副总裁**

MCP 2026-07-28 is a major step toward making agent infrastructure work like the rest of the web: stateless, cacheable, routable, and globally scalable. Cloudflare's Agents SDK supports the spec from day zero, so developers can run MCP servers directly in Workers, call tools without transport-session overhead, and enable richer flows like elicitation for approvals. Because MCP is an open standard, Cloudflare customers like Sentry and Linear can adopt it on day zero and immediately deliver these improvements to their users.

**MCP 2026-07-28 是让智能体基础设施像 web 的其余部分那样运作的重要一步：无状态、可缓存、可路由、全球可伸缩。Cloudflare 的 Agents SDK 自首日起即支持该规范，因此开发者能够直接在 Workers 中运行 MCP 服务器、在调用工具时无需承担传输会话开销，并启用更丰富的流程（如用于审批的 elicitation）。由于 MCP 是一项开放标准，Sentry 和 Linear 等 Cloudflare 客户能从首日起采用它，并立即把这些改进交付给他们的用户。**

Brendan Irvine-Broque

**Brendan Irvine-Broque**

Senior Director Product Management

**产品管理高级总监**

More builders are using our MCP server to bring generated outputs into Figma's canvas, where they can explore, riff and refine them with their team into products that stand out. As that usage grows, our stateless architecture can scale with it, and with MCP Apps, Tasks, and Enterprise-Managed Authorization, we can do even more to keep design and code together in one, connected flow.

**越来越多的构建者在使用我们的 MCP 服务器，把生成式产出带入 Figma 的画布，在那里他们能与团队一起探索、即兴发挥并打磨这些产出，做成出众的产品。随着用量增长，我们的无状态架构也能随之扩展，而借助 MCP Apps、Tasks 和企业托管授权，我们能做得更多，让设计和代码保持在同一个相互连通的流程中。**

Josh Clemm

**Josh Clemm**

VP of Engineering

**工程副总裁**

The 2026-07-28 Model Context Protocol release represents a massive leap forward in enterprise AI scalability. By evolving into a stateless architecture, this specification removes the friction of deploying agentic workflows at scale. At Google Cloud, we are excited to leverage these powerful new capabilities across our ecosystem of developer tools. This release provides the robust, secure, and extensible foundation that our customers (and our own teams) need to build the next generation of AI applications, and we are proud to continue shaping the future of this open standard together.

**2026-07-28 Model Context Protocol 的发布代表着企业级 AI 可扩展性的一次巨大飞跃。通过演进为无状态架构，本规范消除了大规模部署智能体工作流的阻力。在 Google Cloud，我们很激动能在我们的开发者工具生态中利用这些强大的新能力。本次发布为客户（以及我们自己的团队）构建下一代 AI 应用提供了所需的稳健、安全且可扩展的基础，我们很自豪能继续共同塑造这一开放标准的未来。**

Anna Berenberg

**Anna Berenberg**

Engineering Fellow

**工程专家**

At honeycomb.io, we've seen fantastic adoption of MCP - nearly 20% of all monthly interactive queries are now made by agents! The new specification release allows us to support more advanced features such as elicitations while running at enterprise scale.

**在 honeycomb.io，我们看到了 MCP 极佳的采用情况——如今每月所有交互式查询中近 20% 都由智能体发起！新规范发布让我们能够在以企业级规模运行的同时支持更多高级特性，例如 elicitations。**

Austin Parker

**Austin Parker**

Director of AI Strategy

**AI 战略总监**

The new version of the MCP spec proves that the maintainers listen to feedback from the community. It solves real issues we faced at Manufact, both in mcp-use, our open-source framework, and on Manufact Cloud, where we host thousands of MCP servers. The new SDK v2, which powers mcp-use, helped us cut the package size by around 83% while making it 25% faster, thanks to the new client-server split. And with MCP going stateless, we are able to handle production traffic more reliably, securely, and at scale, without impractical infrastructure workarounds.

**新版 MCP 规范证明维护者们会听取社区反馈。它解决了我们在 Manufact 所面对的真实问题，无论是在我们的开源框架 mcp-use 中，还是在托管着数千个 MCP 服务器的 Manufact Cloud 上。驱动 mcp-use 的新 SDK v2，得益于新的客户端-服务器拆分，帮助我们 把包体积缩减了约 83%，同时快了 25%。而随着 MCP 走向无状态，我们能够更可靠、更安全、更大规模地处理生产流量，无需不切实际的基础设施变通手段。**

Enrico Toniato

**Enrico Toniato**

CTO

**CTO**

Open protocols create bigger ecosystems than any one company can build alone. MCP is foundational to Microsoft Foundry, enabling us to scale from dozens of integrations to thousands. We leverage it with Foundry toolbox unified MCP endpoint that brings together tools while centralizing governance, identity, and observability. With stateless operations, Tasks for long-running work, and enterprise-managed identity, the next generation of MCP makes it easier than ever to build secure, scalable, production-ready agent systems.

**开放协议所能创造的生态，比任何一家公司单独构建的都要大。MCP 是 Microsoft Foundry 的基石，让我们能够从数十个集成扩展到数千个。我们通过 Foundry 工具箱统一的 MCP 端点来利用它，该端点把各类工具汇集在一起，同时集中治理、身份和可观测性。借助无状态操作、用于长时间运行工作的 Tasks 以及企业托管身份，下一代 MCP 让构建安全、可伸缩、可投入生产的智能体系统变得前所未有地容易。**

Tina Schuchman

**Tina Schuchman**

Corporate Vice President for Engineering, Microsoft Foundry

**工程企业副总裁，Microsoft Foundry**

The stateless core in the 2026-07-28 spec makes MCP a first-class HTTP workload with no session management to work around. Our customers wanted MCPs on Netlify to be as simple as the rest of the platform and this new spec unlocks this at its core. Building MCP Apps into the new extensions framework is a huge step forward for scalability, accessibility, and capability across the whole ecosystem.

**2026-07-28 规范中的无状态内核让 MCP 成为一等公民级的 HTTP 工作负载，无需再为会话管理寻找变通之法。我们的客户希望 Netlify 上的 MCP 能像该平台其余部分一样简单，而新规范从核心上解锁了这一点。把 MCP Apps 纳入新的扩展框架，是整个生态在可伸缩性、可访问性和能力上的一次巨大飞跃。**

Sean Roberts

**Sean Roberts**

VP of Applied AI

**应用 AI 副总裁**

MCP is now about a year and a half old. Thanks to feedback from developers and others who have worked with us, it's evolving into a more mature protocol that incorporates lessons from decades of web protocol design. As with prior revisions, the most interesting part will be seeing the unexpected things people build with it.

**MCP 如今大约一岁半了。多亏来自开发者及与我们共事过的其他人的反馈，它正在演变成一个更成熟的协议，融汇了数十年来 web 协议设计的经验。与以往的修订一样，最有趣的部分将是看到人们用它构建出的出乎意料的东西。**

Nick Cooper

**Nick Cooper**

MTS & MCP Core Maintainer

**MTS 兼 MCP 核心维护者**

Moving MCP to a stateless protocol makes it easier to scale our own service and makes it easier for us to add analytics for our customers' MCP servers. Making it easier to show people how their MCP tools are being used and what tools are missing that their users would want to use. It's great to see this protocol growing in this direction.

**把 MCP 迁移到无状态协议让我们更容易扩展自身服务，也更容易为客户们的 MCP 服务器加上分析能力。让向人们展示他们的 MCP 工具是如何被使用的、以及用户想用却还缺少哪些工具变得更容易。很高兴看到这个协议朝着这个方向发展。**

Paul D'Ambra

**Paul D'Ambra**

Product Engineer

**产品工程师**

This is a milestone release for anyone building MCP at scale. FastMCP has always existed to turn the spec's most powerful capabilities into an obvious developer experience, and we're excited to ship first-class support for background tasks, stateless interactivity, enterprise auth, and more in FastMCP 4.0. Horizon, our MCP governance platform, was built stateless from the start to handle enormous scale, so having that approach become native to the protocol is incredible to see.

**对任何大规模构建 MCP 的人而言，这都是一次里程碑式发布。FastMCP 的存在始终是为了把规范中最强大的能力转化成显而易见的开发者体验，我们很激动能在 FastMCP 4.0 中交付对后台任务、无状态交互、企业授权等的一等支持。Horizon 是我们的 MCP 治理平台，从一开始就构建为无状态以应对巨大规模，因此看到这种方式成为协议的原生部分令人难以置信。**

Jeremiah Lowin

**Jeremiah Lowin**

CEO

**CEO**

This release makes MCP more enterprise-ready than ever. Runlayer is bringing these advances to every enterprise on our platform, providing a simpler, safer foundation for deploying MCP and agents across their organizations.

**本次发布让 MCP 比以往任何时候都更具备企业级能力。Runlayer 正在把这些进展带给我们平台上的每一家企业，为在整个组织内部署 MCP 和智能体提供一个更简单、更安全的基础。**

Tal Peretz

**Tal Peretz**

Co-founder & CPO

**联合创始人兼 CPO**

The latest MCP revision is an important milestone. It reflects a level of rigor and user input that shows the protocol is maturing in a way that allows businesses to build on it with confidence. We have implemented the revision and the move to a stateless model removes operational complexity and unlocks MCP at enterprise scale. It's a strong signal that the community is being shaped by real deployment experience.

**最新的 MCP 修订是一个重要的里程碑。它反映出一种严谨程度与用户输入的深度，表明协议正在以让企业可以放心基于其构建的方式走向成熟。我们已经实现了本次修订，向无状态模型的转变去除了运维复杂性，在企业级规模上释放了 MCP。这是一个强有力的信号，表明社区正被真实的部署经验所塑造。**

Craig McLuckie

**Craig McLuckie**

CEO

**CEO**

Supporting elicitations has been on our roadmap for a while, but since Supabase MCP runs statelessly, it wasn't something we could do easily. MRTR changes that - it allows our tools to confirm with the user before it acts, like the cost of a new project before it's created, or a query that would delete data. We're excited to support elicitations.

**支持 elicitations 早已在我们的路线图上有一阵子了，但由于 Supabase MCP 是无状态运行的，我们没法轻易做到。MRTR 改变了这一点——它让我们的工具可以在行动前先与用户确认，比如在创建新项目前确认其成本，或在执行一条会删除数据的查询前确认。我们很激动能支持 elicitations。**

Inian Parameshwaran

**Inian Parameshwaran**

Head of Product

**产品负责人**

Anthropic pairs frontier models with a developer experience that keeps raising the bar. The stateless core in the open MCP 2026-07-28 spec reduces the complexity we manage, so we can ship more features to our customers, faster and at scale.

**Anthropic 把前沿模型与一种不断抬高标准的开发者体验搭配在一起。开放 MCP 2026-07-28 规范中的无状态内核降低了我们所需管理的复杂度，使我们能更快、更大规模地向客户交付更多功能。**

Andrew Goodman

**Andrew Goodman**

VP of AI

**AI 副总裁**

# Getting started / 开始上手

We're excited to have developers build on the new spec. To get started, refer to the following resources:

**我们很期待开发者基于新规范进行构建。要开始上手，请参考以下资源：**

- Specification  
**规范说明**
- Full changelog  
**完整变更日志**
- Documentation and guides  
**文档与指南**

# Thank you / 致谢

This release would not be possible without a massive community of contributors and industry partners. We'd like to acknowledge the dozens of key contributors across specification, documentation, SDKs, working and interest groups, as well as hundreds of independent worldwide communities who rallied support and excitement for MCP. We're looking forward to continuing evolving the protocol as it grows!

**如果没有庞大的贡献者和行业合作伙伴社区，本次发布将无法实现。我们想致谢横跨规范、文档、SDK、各工作组与兴趣小组的数十位关键贡献者，以及数百个为 MCP 凝聚支持与热情的全球独立社区。我们期待随着协议的成长，继续推动它演进！**