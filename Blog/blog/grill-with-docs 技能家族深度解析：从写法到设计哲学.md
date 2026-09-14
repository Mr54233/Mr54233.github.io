---
title: "grill-with-docs 技能家族深度解析：从写法到设计哲学"
description: "grill-with-docs 技能家族的写法与设计思想拆解"
date: "2026-07-16"
categories:
  - AI 与编程工具
tags:
  - grill-with-docs
  - Skill
  - 设计
---

# grill-with-docs 技能家族深度解析：从写法到设计哲学

本文解析的 `grill-with-docs` 来自 **Matt Pocock** 的 GitHub 仓库 [mattpocock/skills](https://github.com/mattpocock/skills)（"Skills for Real Engineers"）。Matt Pocock 是 TypeScript 教育领域知名人物、Total TypeScript 的作者。这个 skill 是从这个仓库单独安装的，是一套跨平台、可移植的 SKILL.md 规范。

需要强调的是：`grill-with-docs` 不能脱离它的家族来理解。在源仓库里，它和 `grilling`、`grill-me`、`domain-modeling` 共同构成一个**原语 + 编排器**的分层系统。它们本就是一体的设计。本文把它们作为一个整体来解析，而不是把 `grill-with-docs` 当成一个孤立文件、把另外几个当成"外部依赖"。

## 一、先看全家福：四个 skill 的真实关系

在源仓库里，这四个 skill 分布在两个目录，但属于同一个设计系统：

- `skills/productivity/grilling/` —— **访谈原语**（引擎），定义"怎么问"
- `skills/productivity/grill-me/` —— **编排器**，等于"只要 grilling、不要文档"
- `skills/engineering/grill-with-docs/` —— **编排器**，等于"grilling + domain-modeling"
- `skills/engineering/domain-modeling/` —— **文档规范原语**（引擎），定义"沉淀什么"

这里有一条关键的架构轴线：**原语 vs 编排器**。`grilling` 和 `domain-modeling` 是两个正交的原语，各自提供一种能力；`grill-me` 和 `grill-with-docs` 是编排器，把原语组合成面向用户的工作流。理解这条轴线，是理解整个家族的钥匙。

为什么强调"一体"？因为如果只盯着 `grill-with-docs` 那 7 行正文看，会完全错过它的设计意图。它的全部正文是一句 `Run a /grilling session, using the /domain-modeling skill.`——这句话的意义只有放在家族关系图里才显现：它是一个编排器，调度两个原语。脱离家族谈这个 skill，就像脱离发动机谈变速箱。

## 二、两个原语：grilling 与 domain-modeling

先看两个提供真实能力的原语，因为编排器的意义全靠它们赋予。

### grilling：13 行定下访谈协议

`grilling` 全文 13 行，定义了一种"高密度但不压迫"的质询节奏。核心约束有四条，每一条都经过刻意打磨。

第一条，逐个提问。"Ask the questions one at a time, waiting for feedback on each question before continuing."——一次只抛一个问题，多问会让人 bewildering（困惑）。这条约束看似简单，却是对抗 LLM 最常见的失败模式：一次倒一堆问题，用户哪个都答不完整。

第二条，每题给推荐答案。"For each question, provide your recommended answer."这把用户从"从零想答案"降到"判断推荐成不成立"，大幅降低认知负担。推荐是起点不是终点，用户可以采纳、否决或重新给方向。

第三条，事实自己查、决策等用户。"If a fact can be found by exploring the codebase, look it up rather than asking me. The decisions, though, are mine."——这是整段最精妙的一句，它把"事实"和"决策"清晰切分：凡是能查的（代码、文件、工具状态）不要问用户，凡是用户的意图和取舍不要替用户做。一刀切清责任边界。

第四条，未确认不动手。"Do not enact the plan until I confirm we have reached a shared understanding."质询归质询，执行归执行，没有用户确认不得越界。这条让整个访谈是无副作用的——这也是为什么裸 grilling 可以放心地设为模型自动触发。

### domain-modeling：75 行定下文档纪律

`domain-modeling` 比 grilling 长，因为它要定义产物结构、写入时机和三个文件的协作关系。它的开篇一句话就点明了定位："This is the active discipline"（这是主动的纪律）——它特意区分了"主动建模"和" merely reading CONTEXT.md for vocabulary"（只是为了词汇读一下词表）。后者是任何 skill 都能做的一句话习惯，前者才是这个 skill 的职责：在改变模型时主动挑战术语、构造边界场景、在结晶瞬间落盘。

产物结构方面，它定义了三个文件的协作。单上下文项目用根目录的 `CONTEXT.md` 加 `docs/adr/`；多上下文项目（monorepo、多个 bounded context）用 `CONTEXT-MAP.md` 做路由，每个子上下文有自己的 `CONTEXT.md` 和 `docs/adr/`。

写入时机方面，它反复强调一句话："Don't batch these up — capture them as they happen."不要批量补写，结晶的瞬间就落盘。这比事后回忆补写准确得多，因为讨论中的上下文还热着。它还规定了创建时机的"惰性"原则："Create files lazily — only when you have something to write."没有第一个术语就不创建 CONTEXT.md，没有第一个决策就不创建 docs/adr/。

会话中的四项纪律也值得注意。一是挑战词表冲突——用户用词和 CONTEXT.md 已有定义矛盾时，当场指出。二是磨锐模糊语言——"你说 account，是指 Customer 还是 User？这是两回事"。三是讨论具体场景——构造边界用例逼用户精确。四是与代码交叉验证——用户说的和代码不一致就当面摆出来。

它还带两个附件文件 `CONTEXT-FORMAT.md` 和 `ADR-FORMAT.md`，主文件用相对路径引用。这是"主文件精炼、格式下沉附件"的范例。

## 三、两个编排器：grill-me 与 grill-with-docs

有了两个原语，编排器才有意义。源仓库里有两个编排器，把它们放一起看才能理解 `grill-with-docs` 的设计位置。

### grill-me：最薄可能的编排器

`grill-me` 的全文比 grill-with-docs 还短，正文只有一句：`Run a /grilling session.`。它设置了 `disable-model-invocation: true`，只接受用户显式触发 `/grill-me`。

它的存在回答了一个问题："如果用户只想要质询、不要任何文档产出，该用什么？"答案就是这个最薄的编排器。它的 description 也是 "A relentless interview to sharpen a plan or design."——和 grill-with-docs 的前半句一模一样，只是少了 "which also creates docs"。

### grill-with-docs：7 行的组合器

`grill-with-docs` 全文 7 行：

```yaml
---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design,
  which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Run a `/grilling` session, using the `/domain-modeling` skill.
```

现在它的意义在家族语境里清晰了：它是 grill-me 的"带文档版"。和 grill-me 一样是用户显式触发的编排器，正文都是一行声明组合关系；区别只在于它额外调度了 domain-modeling，让访谈过程同步产出 CONTEXT.md 和 ADR。

description 的后半句 "which also creates docs (ADR's and glossary) as we go" 是点睛之笔。它把"带文档"这个差异化能力塞进 description，让检索能区分它和 grill-me。写 description 的核心原则正是这样：把"和兄弟技能不一样的地方"写进去，而不是泛泛描述它做什么。

## 四、最关键的一行：disable-model-invocation

整个家族里，谁能自动触发、谁不能，是经过精确计算的。把四个 skill 的触发配置放一起对比，能看到一条清晰的设计原则：

- `grilling` 不设 disable，允许模型在用户说 "grill / stress-test / 盘一盘" 等触发词时自动起。它是低强度的纯访谈，没有副作用（grilling 自己规定"未确认不动手"），所以可以放心自动触发。
- `domain-modeling` 不设 disable，允许模型在用户想"梳理术语、记录决策"时自动起。它虽然有写文件的能力，但写的是文档沉淀，副作用可控且正是用户想要的。
- `grill-me` 设 disable，禁止自动触发，必须显式 `/grill-me`。
- `grill-with-docs` 设 disable，禁止自动触发，必须显式 `/grill-with-docs`。

这里有一个反直觉但深刻的设计：**为什么两个编排器都禁自动，而原语反而允许自动？**

答案是副作用分层。原语是"原子能力"，副作用边界清晰、用户预期明确——grilling 只问不做，domain-modeling 只写文档。它们适合模型在合适时机自动调用，降低用户的指令负担。

编排器则不同。它们是"长链路、强副作用"的组合工作流：grill-with-docs 会持续打断用户问问题，还当场改文件、建目录。这种高强度交互如果被模型自作主张触发，用户体验会很糟——你只是随口说了句"帮我看看这个方案"，结果它开始连环盘问还顺手建了一堆文件。

所以设计者把编排器全部设为"用户显式触发"，让用户对高强度交互有明确预期。这是整个家族最值得抄走的设计准则：**原语可以自动触发，编排器必须显式触发；分层的依据是"用户没明示时，默认启动它的代价是多少"**。

注意还有一层微妙之处：grill-me 和 grill-with-docs 都禁自动，但理由不同。grill-me 禁自动，是因为"想要纯质询"这个意图需要用户明确表达，否则模型自作主张开始盘问就是打扰。grill-with-docs 禁自动，除了同样的打扰风险，还额外加上"会改文件"的副作用——双层理由让它更需要显式开启。同样的 disable 配置，背后是不同强度的理由。

## 五、A-with-B 命名与目录归属

家族的命名遵循 `A-with-B` 模式：grill-with-docs 一眼读出"在 grill 的基础上加 docs"。这个命名本身就是文档——用户看到名字就能猜到它和 grill-me 的区别（一个带 docs 一个不带），不需要读 description。

更有意思的是目录归属。源仓库里 `grill-with-docs` 在 `engineering/` 目录，而 `grill-me` 和 `grilling` 在 `productivity/` 目录。这不是随意的分类——`engineering/` 下的技能都和"软件工程的严谨产物"相关（domain-modeling、tdd、code-review、codebase-design 等），`productivity/` 下的是通用工作流。把 grill-with-docs 放 engineering，是在暗示它产出的是工程级的严谨文档（统一语言、ADR），不是随手笔记。

这个目录归属也强化了"它和 domain-modeling 是一体"的事实——两者都在 engineering 下，而 grill-me 和 grilling 都在 productivity 下。物以类聚，编排器和它调度的文档原语同居一处。

## 六、ADR 与 CONTEXT 的格式哲学

domain-modeling 带的两个附件格式文件，本身也体现了克制的设计哲学，值得单独一说。

### ADR 格式：极简到可以只有一段话

ADR 模板可以只有"标题加 1 到 3 句话"，包括背景、决定、原因。它明确说："An ADR can be a single paragraph. The value is in recording that a decision was made and why — not in filling out sections."（一个 ADR 可以只有一段。价值在于记录决策被做过和为什么，不在于填满章节。）

只有当确实有价值时才加可选章节：Status 状态、Considered Options 备选方案、Consequences 后果。更关键的是写 ADR 的三门槛，必须同时满足：难逆（改主意成本高）、反直觉（后人会问"为什么这么做"）、真权衡（确有备选方案）。三者缺一就跳过，否则 ADR 目录会被噪音淹没。源文件里还专门列出"什么算数"（what qualifies），比如架构形态、上下文间集成模式、带锁定效应的技术选型、明确的边界和范围决策、对显然路径的故意偏离、代码里看不到的约束——这些都是值得记录的"硬"决策。

### CONTEXT.md 格式：只当词表，不掺实现

`CONTEXT.md` 被明确定义为 glossary（词表），不是 spec、不是草稿本。每个词条要求"有立场"——当多个词指同一概念时，选最好的一个，其它列在 Avoid 下面。定义要紧凑，一到两句话，定义"它是什么"而不是"它做什么"。

还有一个重要规则：只收录这个项目上下文独有的术语，通用编程概念（超时、错误类型、工具模式）不属于这里。domain-modeling 反复强调："It is a glossary and nothing else."（它只是词表，别无其它。）一旦往里塞实现细节（"用 Redis 做缓存"），就跑偏了——实现细节该进 ADR 或代码注释。

## 七、值得抄走的五个设计模式

把这个家族放在一起看，可以提炼出五个可复用的设计模式。

**第一，原语 + 编排器分层。** 把可复用的原子能力写成原语（grilling、domain-modeling），把面向用户的工作流写成编排器（grill-me、grill-with-docs）。原语正交，编排器组合。这种分层让能力可组合、可复用——同一个 grilling 原语既能配 grill-me 做"纯质询"，也能配 grill-with-docs 做"质询加文档"，还能被未来其它编排器复用。

**第二，副作用分层触发。** 低强度、边界清晰的原语允许自动触发；高强度、带文件副作用的编排器必须显式触发。分层的依据是"用户没明示时，默认代价是多少"。这一条对任何 skill 系统都适用。

**第三，description 即索引。** 把差异化能力写进 description，让检索能命中。grill-with-docs 的 "which also creates docs" 和 grill-me 的纯访谈描述，正是为了让模型在用户表达不同意图时命中不同技能。description 不是给用户看的说明书，是给检索引擎的关键词。

**第四，主文件精炼、格式下沉附件。** 用相对路径引用格式文件，保持 SKILL.md 精炼。domain-modeling 主文件讲"做什么和何时做"，ADR-FORMAT.md 和 CONTEXT-FORMAT.md 讲"具体格式"。这种分离让主文件可读，附件可独立演进。

**第五，A-with-B 命名 + 目录归属传递意图。** 命名暴露"基础能力 + 增量能力"，目录归属暗示产物的严肃程度。grill-with-docs 这个名字加 engineering 这个目录，还没读 description 就传递了"工程级文档产出"的意图。

## 八、一句话总结

`grill-with-docs` 不是 7 行的孤立技能，它是 Matt Pocock 设计的"原语 + 编排器"家族里的一个组合器。它的设计价值不在自身那 7 行，而在于：用一行正文声明对两个正交原语（grilling 的质询节奏 + domain-modeling 的文档纪律）的组合关系；用 disable-model-invocation 把这种"高强度 + 带副作用"的组合工作流限定为用户显式触发；用 A-with-B 命名和 engineering 目录归属传递"工程级文档产出"的意图。要真正理解它，必须把它和 grill-me、grilling、domain-modeling 作为一个系统来看——它们本就是一体的。
