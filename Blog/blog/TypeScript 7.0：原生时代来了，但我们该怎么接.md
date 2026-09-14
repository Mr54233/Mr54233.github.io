---
title: "TypeScript 7.0：原生时代来了，但我们该怎么接"
date: "2026-07-09"
categories:
  - 前端技术
tags:
  - TypeScript 7
  - Go
  - 升级
---

# TypeScript 7.0：原生时代来了，但我们该怎么接

> 基于 Microsoft 官方发布公告（2026-07-08，Daniel Rosenwasser）整理。  
> 面向团队内成员，目标是：**看完知道要不要升、怎么升、会踩什么坑**，而不是复读公告。

---

## TL;DR

1. **TypeScript 7.0 已正式发布**（2026-07-08）。核心卖点是用 Go 重写的原生端口，官方称编译速度提升 **8x–12x**、内存占用更低、编辑器首屏错误从 17.5s 降到 1.3s。
2. **对我们最实际的影响不是"快"，而是一大批默认值变更变成了硬错误。** 即使代码一行不改，`tsconfig.json` 很可能要动。**升级前务必先过一遍配置。**
3. **暂时别全量切换**：7.0 **没有程序化 API**，导致 `typescript-eslint`、Vue/MDX/Astro/Svelte（Volar）、Angular 模板等依赖 TS 编译器 API 的工具**还不能用 7.0**。官方建议这类场景继续用 6.0。
4. **推荐短期动作**：本地编辑器/`tsc` 切 7.0 感受速度；CI、lint、模板类框架暂留 6.0，等 7.1 出 API 后再统一。官方提供了 `tsc6` 共存方案。

---

## 一、它到底是什么

一句话：**同一个 TypeScript 编译器，用 Go 重新实现了一遍，逻辑尽量忠实原版，目标是利用多核和原生速度。**

- 不是新语法、不是新类型系统、不是破坏性重写。
- 它的卖点是**工具链的执行速度**，而不是语言能力。
- 安装方式没变：`npm install -D typescript`，拿到新的 `tsc`。

官方在公告里反复强调"忠实移植"，并且声称在 6.0 下（开启 `stableTypeOrdering`、不设 `ignoreDeprecations`）能干净编译的项目，在 7.0 下应该**结果一致**。

---

## 二、到底快多少（以及为什么不能全信那个 10x）

### 2.1 官方基准（默认 `--checkers 4`）

| 代码库 | TS 6 | TS 7 | 提速 |
|-|-|-|-|
| vscode | 125.7s | 10.6s | 11.9x |
| sentry | 139.8s | 15.7s | 8.9x |
| bluesky | 24.3s | 2.8s | 8.7x |
| playwright | 12.8s | 1.47s | 8.7x |
| tldraw | 11.2s | 1.46s | 7.7x |

内存方面，上述项目 7.0 普遍少用 6%–26%。

### 2.2 企业实测（公告引用，可信度较高）

- **Slack**：merge queue 时间砍 40%；CI 类型检查从 ~7.5 分钟降到 1.25 分钟；本地编辑器"从几乎不可用变成几秒加载完"。
- **Microsoft News Services 团队**：每月省下 ~400 小时 CI 等待。
- **Canva**：编辑器首屏错误从 58s 降到 4.8s。
- **Vanta**：某大项目快了约 9x。

### 2.3 ⚠️ 需要保留态度的三个点

公告写得很漂亮，但有几个信息缺口，评估时心里要有数：

1. **基准硬件没公布。** 没说几核 CPU、多少内存、CI 还是本地机。而提速幅度高度依赖核心数（见下）。
2. **默认 4 个 checker 是任意选的中间值。** 官方自己后面补了一张 `--checkers 8` 的表，vscode 提速直接从 11.9x 跳到 16.7x。也就是说"10x"在多核机上偏保守、在少核 CI 上可能打折。
3. **改 `--checkers` 数量可能改变类型检查结果。** 原话是"may surface order-dependent results"。这条是**我最在意的**——如果只是诊断信息排序变化，无所谓；如果某些项目换个核数就从"能过"变"报错"，那 `--checkers` 就不是性能旋钮而是**正确性旋钮**，会影响 CI 可复现性。公告把它埋在性能章节里，偏低估了风险。**建议我们团队在 CI 上固定一个 checker 数量，别让不同 runner 跑出不同结果。**

---

## 三、升级的最大风险点：配置默认值与硬错误

> 这一段是团队真正需要逐条对账的部分。

7.0 完整继承了 6.0 的新默认值，并且把 6.0 里"弃用"的配置项**升级成了硬错误（直接报错，不是警告）**。

### 3.1 默认值变更（可能悄悄改变行为）

| 配置项 | 6.0 → 7.0 默认 | 影响 / 应对 |
|-|-|-|
| `strict` | → `true` | 历史项目可能突然多出一堆严格错误 |
| `module` | → `esnext` | 输出模块格式变化 |
| `target` | → 当前稳定 ES 版本（紧邻 esnext） | 输出语法层级提高 |
| `noUncheckedSideEffectImports` | → `true` | 副作用导入被检查 |
| `libReplacement` | → `false` | lib 替换行为关闭 |
| `stableTypeOrdering` | → `true`，**且不能关** | 类型顺序稳定化 |
| `rootDir` | → `./`，**内部源目录需显式指定** | **最容易踩坑**。`tsconfig.json` 在 `src` 外层的，要补 `"rootDir": "./src"` |
| `types` | → `[]`，旧行为需设 `["*"]` | **第二容易踩坑**。依赖全局声明（node/jest/bun…）的，要显式列 `"types": ["node", "jest"]` |

官方点名 `rootDir` 和 `types` 是"最意外"的两项，我们排查时优先看这两个。

### 3.2 变成硬错误的配置（之前能跑，现在直接挂）

- `target: es5` —— 不再支持
- `downlevelIteration` —— 不再支持
- `moduleResolution: node` / `node10` / `classic` —— 改用 `nodenext` 或 `bundler`
- `module: amd` / `umd` / `systemjs` / `none` —— 改用 `esnext` 或 `preserve`
- `baseUrl` —— 不再支持，`paths` 改为相对项目根
- `esModuleInterop`、`allowSyntheticDefaultImports` 不能设 `false`
- `alwaysStrict` 默认 `true` 且不能关
- 命名空间里不能用 `module` 关键字
- import 上不能用 `asserts`，改用 `with`（对齐 ES import attributes）
- `/// <reference no-default-lib />` 在 `skipDefaultLibCheck` 下不再生效
- 当前目录有 `tsconfig.json` 时，命令行不能再直接传文件路径（除非加 `--ignoreConfig`）

### 3.3 语言层的破坏性变更

- **模板字面量类型现在按 Unicode 码点切分**，不再按 UTF-16 码元。

  - 例：`"😀abc"` 以前会推断成 `["\ud83d", "\ude00abc"]`（半个代理对），现在变成 `["😀", "abc"]`。
  - **影响**：任何按 UTF-16 建模的类型工具（比如类型层 `Length` 工具）行为会变。通常新行为更符合直觉，但老代码可能挂。
- **JSDoc/JS 支持大改**，向 `.ts` 的分析方式对齐。受影响项包括：`@enum`、`@class`、`?` 作类型、后缀 `!`、闭包式函数签名等，全部不再特殊识别。纯 `.ts` 项目基本无感，**纯 JS + JSDoc 的老项目要重点回归**。

---

## 四、共存策略：7.0 和 6.0 并肩跑

7.0 **没有程序化 API**（预计 7.1 才有）。为了让 `typescript-eslint` 这类需要 `import "typescript"` 的工具继续可用，官方发了兼容包。

### 4.1 `tsc6` 兼容包

```bash
npm install -D @typescript/typescript6
```

这会提供一个 `tsc6` 可执行文件，并重新导出 6.0 的 API。

### 4.2 用 npm alias 让 7.0 和 6.0 同存

让 `tsc`（7.0）和 `typescript`（6.0，给 lint 工具用）共存：

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

这样 `npx tsc` 走 7.0，而 `typescript-eslint` 仍然 `import` 到 6.0 的 API。

### 4.3 nightly 通道切换

`@typescript/native-preview`（此前装 7.0 预览的主力包，周下载 850 万+）将退役；今后 nightly 走标准包的 `next` 标签：

```bash
npm install -D typescript@next
```

---

## 五、并行化新开关（性能调优用，但要小心）

7.0 把解析、类型检查、emit 等步骤并行化了。新增三个实验性开关：

| 开关 | 作用 | 注意点 |
|-|-|-|
| `--checkers N` | 类型检查 worker 数，默认 4 | **改这个可能改变检查结果**（见 2.3）。CI 建议固定值。调大更快但更吃内存。 |
| `--builders N` | `--build` 模式下并行构建的项目数 | 与 `--checkers`**相乘**，`4x4` 可能同时跑 16 个 checker，注意别超调。 |
| `--singleThreaded` | 全程单线程 | 用于调试 / 与 6.0 对比 / 资源受限环境。**这是唯一跨环境可复现的基准。** |

**团队建议**：CI 上统一用 `--singleThreaded` 或固定 `--checkers N`，避免不同 runner 配置跑出不同诊断结果。本地开发可以放开 `--checkers` 换速度。

---

## 六、`--watch` 模式重写

- 基于 **Parcel watcher**（`@parcel/watcher`）从 C++ 移植到 Go，跨平台文件监听更稳、更省资源。
- 官方致谢 Devon Govett（Parcel 作者）。
- 对我们意味着：`tsc --watch` 在大项目、尤其 `node_modules` 很多时的卡顿和 CPU 占用会明显改善。

---

## 七、编辑器支持现状

| 编辑器 | 状态 |
|-|-|
| VS Code | 有**专用扩展**，装上自动启用为默认；未来几周会内置进 VS Code 本体。可随时用命令面板的 "Disable/Enable TypeScript 7 Language Server" 切换。 |
| Visual Studio | 最新版根据 workspace 自动启用，无需配置。 |
| 其他（WebStorm 等） | 基于 LSP，多线程，官方称"应该都好用"，按各编辑器文档走。 |

已补齐的功能：auto-imports、hover 展开、inlay hints、code lens、go-to-source-definition、JSX 联动编辑、语义高亮、排序/清理 imports 等（beta 里缺的现在基本补齐）。

质量数据：相比 6.0，新 language server 的命令失败率降 80%+、崩溃率降 60%+。

---

## 八、❗ 当前不支持的场景（重要）

因为 7.0 还没暴露稳定 API，**以下工具链暂时用不上 7.0**：

- **Vue / MDX / Astro / Svelte** —— 依赖 Volar，Volar 目前只能用 6.0。
- **Angular 模板** —— 专用类型检查暂不支持。
- **任何自己 `import "typescript"` 的工具**（自定义 transform、自研 lint 等）。

官方给的过渡方案：

- Angular：CLI 用 7.0 跑 `tsc` 做快速全量错误检测，编辑器留 6.0。
- Vue/MDX/Astro/Svelte：**暂时整体继续用 6.0**。
- VS Code 用户：需要时用 "Disable TypeScript 7 Language Server" 回退到 6.0。

---

## 九、行动建议（分场景）

### 纯 `.ts` 项目、无模板框架

- ✅ 可以升级到 7.0。
- 升级前：逐条对账第三节，重点查 `rootDir`、`types`、`moduleResolution`、`target`。
- 升级后：CI 固定 `--checkers` 数量或用 `--singleThreaded`，保证可复现。
- 本地先感受速度，确认无回归再推 CI。

### 使用 Vue/MDX/Astro/Svelte/Angular 模板

- ⏸️ **暂不整体切换**，继续 6.0。
- 若想尝鲜速度，可只在 CLI 的 `tsc` 上用 7.0，编辑器和 lint 留 6.0（用 4.2 的 alias 方案）。

### 有自研工具 `import "typescript"`

- ⏸️ 等 7.1 的 API 再迁。现在用 `@typescript/typescript6` 保持 API 可用。

### 纯 JS + JSDoc 的老项目

- ⚠️ **重点回归**。JSDoc 行为大改，升之前先在一个分支跑全量诊断对比。

---

## 十、一句话结论

**TS 7.0 是一次实打实的性能跃迁，不是炒作**——但它的破坏性变更（配置硬错误 + 语言层微调）和 API 缺口（工具链生态暂不支持）是真实存在的。

对我们而言：

- **收益是真的**（速度、内存、watch、编辑器稳定性）。
- **风险集中在配置和工具链兼容**，而不是速度本身。
- **不要无脑全量切换，也不要观望到底**——按场景分批，先把纯 TS 项目和本地编辑器迁过去，模板类和 lint 留 6.0 等 7.1。

---

*文档整理：基于 TypeScript 官方博客（2026-07-08）。如有团队实测数据，欢迎补充到对应章节。*