---
title: "RTK + MemPalace 工具使用教程"
date: "2026-07-01"
categories:
  - 项目实践
tags:
  - RTK
  - MemPalace
  - 教程
---

# RTK + MemPalace 工具使用教程

<callout emoji="🚀">
两个提升 AI 编程效率的本地工具：**RTK** 自动压缩命令输出、大幅省 token；**MemPalace** 给 AI 装上跨会话长期记忆。本教程面向初次使用者，教你如何安装与日常使用。
</callout>

# 一、RTK：命令输出压缩器

## 1.1 它解决什么问题

AI 处理终端命令输出时，大量 token 被进度条、ASCII 表格框、模板化日志浪费。RTK 是一个夹在命令输出与 AI 上下文之间的代理，先把输出过滤、压缩、去噪，再送给 AI，可节省 60–90% 的 token。

## 1.2 安装与验证

```bash
# 用 Rust cargo 安装
cargo install rtk

# 验证
rtk --version
```

## 1.3 核心用法：自动生效，无需改变习惯

RTK 通过 Claude Code 的 Hook 自动拦截命令并改写——你照常敲 `git status`，Hook 自动把它变成 `rtk git status`，全程无感。也可以手动调用 `rtk git status`。

## 1.4 常用命令

| 类别 | 命令示例 |
|-|-|
| 版本控制 | rtk git status / rtk gh pr list |
| 包管理 | rtk npm run build / rtk pnpm install |
| 测试 | rtk test（只显示失败）/ rtk jest |
| 代码检查 | rtk tsc / rtk lint |
| 文件查看 | rtk ls / rtk tree / rtk read 文件名 |

## 1.5 三个实用元命令

- `rtk gain` — 查看累计节省了多少 token
- `rtk discover` — 分析历史，找出本该用 RTK 却没用过的命令
- `rtk cc-economics` — 对比 Claude Code 的花费与 RTK 的节省

# 二、MemPalace：AI 的长期记忆

## 2.1 它解决什么问题

AI 每次会话都从零开始，不记得你的项目结构、过去的决策、讨论过的方案。MemPalace 把代码、文档、对话存进本地"记忆宫殿"，之后任何会话都能用语义搜索把相关记忆召回——让 AI 真正"记得"你的项目。

**特点**：全本地、基于 ChromaDB 向量库、无需 API key。

## 2.2 核心概念（记忆宫殿比喻）

| 概念 | 含义 |
|-|-|
| Wing（翼） | 顶层分区，通常对应一个项目 |
| Room（房间） | 项目内的子主题（如 backend、docs） |
| Drawer（抽屉） | 一条记忆，逐字存储原文 |
| Search | 用自然语言做语义搜索召回 |

## 2.3 安装与接入 AI

```bash
# 安装
pip install mempalace

# 接入 Claude Code（让 AI 能直接查记忆）
claude mcp add mempalace -- mempalace-mcp
```

## 2.4 三步上手

**第一步：摄取（mine）—— 把内容存进宫殿**

```bash
# 摄取一个项目（代码 + 文档），--wing 给项目起个分区名
mempalace mine ~/projects/my-app --wing my-app

# 摄取对话记录（Claude / ChatGPT / Slack 导出）
mempalace mine ~/exports --mode convos --wing my-app

# 摄取办公文档（PDF / DOCX，需 pip install mempalace[extract]）
mempalace mine ~/docs --mode extract
```

**第二步：搜索（search）—— 用自然语言找回来**

```bash
mempalace search "为什么我们改用了 GraphQL"
mempalace search "登录流程怎么实现的" --wing my-app
mempalace search "鉴权方案" --wing my-app --room backend
```

**第三步：唤醒（wake-up）—— 新会话加载相关记忆**

```bash
mempalace wake-up               # 加载全局记忆概览
mempalace wake-up --wing my-app  # 加载某个项目的记忆
```

## 2.5 常用命令速查

| 命令 | 作用 |
|-|-|
| mempalace mine 路径 | 摄取内容进宫殿 |
| mempalace search "关键词" | 语义搜索记忆 |
| mempalace status | 查看宫殿里存了什么 |
| mempalace wake-up | 加载记忆上下文 |
| mempalace sync | 清理已删除文件的过期记忆 |

# 三、注意事项

<callout emoji="💡">
**中文 Windows 用户**：若 `init` 命令因编码报错，运行前先执行 `set PYTHONUTF8=1`（或 `setx PYTHONUTF8 1` 持久化），强制 Python 用 UTF-8 解码。
</callout>

<callout emoji="💡">
**写锁**：MemPalace 同一时刻只允许一个进程写入。若 CLI 的 `mine` 报 "held by PID"，通常是已接入的 MCP server 占着锁——改用 MCP 工具 `mempalace_mine` 在 server 内部执行即可，或先停掉 server 进程再用 CLI。
</callout>