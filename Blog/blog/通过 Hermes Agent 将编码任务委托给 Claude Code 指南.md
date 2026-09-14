---
title: "通过 Hermes Agent 将编码任务委托给 Claude Code 指南"
date: "2026-07-02"
categories:
  - AI 与编程工具
tags:
  - Hermes
  - Claude Code
  - 工作流
---

# 通过 Hermes Agent 将编码任务委托给 Claude Code 指南

> 本文档梳理从零开始：
> 
> 安装 Hermes Agent → 配置飞书 IM → 通过 IM 给 Hermes 分配任务 → Hermes 调用 Claude Code 执行编码工作的完整流程。
> 
> 参考来源：[Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/)、[Hermes Agent GitHub](https://github.com/NousResearch/hermes-agent)



---



## 目录



1. [整体架构概览](#1-整体架构概览)
2. [安装 Hermes Agent](#2-安装-hermes-agent)
3. [配置 LLM 模型](#3-配置-llm-模型)
4. [安装 Claude Code 技能](#4-安装-claude-code-技能)
5. [配置飞书 Gateway](#5-配置飞书-gateway)
6. [启动 Gateway 并测试](#6-启动-gateway-并测试)
7. [Hermes 调用 Claude Code 的两种模式](#7-hermes-调用-claude-code-的两种模式)
8. [通过飞书分配编码任务](#8-通过飞书分配编码任务)
9. [实战示例：分析代码 Bug](#9-实战示例分析代码-bug)
10. [常见问题与排查](#10-常见问题与排查)

---



## 1. 整体架构概览



整个工作流程如下：



```Plain Text
用户（飞书 IM）
    │
    │  发消息："分析角色管理模块的代码"
    ▼
Hermes Agent Gateway（后台运行）
    │
    │  解析任务，加载 claude-code 技能
    ▼
Hermes Agent 调用 Claude Code CLI
    │
    │  claude -p '分析角色管理模块...' --max-turns 10
    │  或
    │  tmux + claude（交互模式）
    ▼
Claude Code 在项目目录中工作
    │
    │  读取代码、分析问题、返回结果
    ▼
Hermes 将结果返回给用户（飞书消息）
```



**关键组件：**



| 组件 | 作用 | 安装位置 |
|-|-|-|
| Hermes Agent | AI 代理框架，负责接收任务、调度工具、返回结果 | WSL / Linux |
| Claude Code CLI | Anthropic 的编码代理，执行实际编码工作 | Windows / WSL |
| 飞书 Gateway | 消息网关，连接飞书 IM 和 Hermes | WSL / Linux（后台服务） |



---



## 2. 安装 Hermes Agent



### 环境要求



- Python 3.10+
- Linux / macOS / WSL2 / Windows

### ⚠️ 重要提示：目前Windows推荐使用 WSL2



> **Windows 原生支持目前处于 Early Access 阶段，部分功能可能不稳定或不可用。**
> 
> - Windows 上没有 tmux，因此**无法使用 Claude Code 的交互模式（模式二）**，只能使用 Print 模式（模式一）
> - 部分 terminal 功能可能表现异常
> - `execute_code` 沙箱可能遇到 WinError 10106（环境变量问题）
> - Alt+Enter 不能插入换行，需使用 Ctrl+Enter
> 
> **强烈推荐在 WSL2（Windows Subsystem for Linux）中运行 Hermes Agent**，功能最完整，两种模式都能用。
> 
> 如果你还没有安装 WSL2，在 PowerShell 中运行：
> 
> ```PowerShell
> wsl --install
> ```
> 
> 然后重启电脑，按提示设置 Ubuntu 用户名和密码即可。



### Linux / macOS / WSL2



```Bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```



### Windows（原生，Early Beta）



```PowerShell
irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex
```



> **Windows 原生更多问题见** [**Hermes 官方文档 - Windows Native**](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native)



### 交互式初始化配置（所有平台通用）



安装完成后，运行：



```Bash
hermes setup
```



`hermes setup` 是一个交互式向导，**会引导你一次性完成所有核心配置**，包括：



1. **选择 LLM 提供商和模型** — 交互式选择器，浏览支持的提供商，设置 API Key
2. **配置终端后端** — 本地终端、Docker 隔离、SSH 远程等
3. **配置 Gateway（消息平台）** — 可选，连接飞书、Telegram、Discord 等 IM 平台
4. **安装额外依赖** — 根据你的选择自动安装所需的 SDK

> **💡 提示：** 后面的配置模型、配置飞书 Gateway 等章节本质上就是 `hermes setup` 中的步骤。如果你在 setup 中已经配置好了，可以直接跳过对应章节。
> 
> 也可以单独执行某一步：
> 
> - `hermes model` — 单独切换模型
> - `hermes gateway setup` — 单独配置消息平台



### 验证安装



```Bash
hermes --version
hermes doctor        # 健康检查，检查依赖和配置是否完整
```



> **官方文档：** https://hermes-agent.nousresearch.com/docs/



---



## 3. 配置 LLM 模型



> **💡 如果你在 `hermes setup` 中已经配置过模型，可以跳过本章。** 需要切换模型时随时运行 `hermes model` 即可。



Hermes 需要一个 LLM 作为"大脑"来理解任务和调度工具。



### 推荐方式：交互式选择



```Bash
hermes model
```



这会打开交互式模型选择器，你可以浏览支持的提供商并直接选择。



### 支持的模型/提供商



Hermes 支持 20+ 提供商，常用的：



| 提供商 | 认证方式 | 环境变量 |
|-|-|-|
| OpenRouter | API Key | `OPENROUTER_API_KEY` |
| Anthropic | API Key | `ANTHROPIC_API_KEY` |
| DeepSeek | API Key | `DEEPSEEK_API_KEY` |
| 智谱 / GLM | API Key | `GLM_API_KEY` |
| 自定义端点 | 配置文件 | `config.yaml` 中设置 |



### 手动配置（可选）



如果你已经知道要用的模型，也可以直接编辑配置：



```Bash
hermes config edit
```



在 `config.yaml` 中设置模型信息，API 密钥放在 `~/.hermes/.env` 文件中。



### 验证



```Bash
hermes chat -q "你好，测试一下"
```



> **提供商配置文档：** https://hermes-agent.nousresearch.com/docs/integrations/providers



---



## 4. 安装 Claude Code 技能



> **💡 `claude-code` 技能是 Hermes 内置技能，默认已启用，无需手动安装。** 本章仅供确认。



Hermes 通过"技能"（Skills）来学习和使用特定工具。`claude-code` 技能让 Hermes 知道如何正确调用 Claude Code。



> **关于 Claude Code CLI 的安装和配置**（API Key 设置、模型选择、认证等）不在本文档范围内，请参考 [Claude Code 官方文档](https://code.claude.com/docs/en/cli-reference)。



### 确认技能已启用



```Bash
hermes skills list | grep claude-code
```



应看到输出中包含 `claude-code`，状态为 `enabled`。



### 如果技能未启用



```Bash
hermes skills config    # 交互式启用/禁用技能
```



---



## 5. 配置飞书 Gateway



> **💡 如果你在 `hermes setup` 中已经配置过飞书，可以跳过本章。** 需要修改时运行 `hermes gateway setup` 即可。



Gateway 是 Hermes 的消息网关，支持飞书、Telegram、Discord 等 20+ 平台。配置后，用户可以通过 IM 直接给 Hermes 发消息分配任务。



### 推荐方式：扫码创建（一条命令）



```Bash
hermes gateway setup
```



选择 **Feishu / Lark**，然后用飞书手机 App **扫码**，Hermes 会自动创建机器人应用并保存凭证。**不需要手动去飞书开放平台做任何操作。**



如果没有安装生成二维码的依赖则会生成一串地址，通过飞书打开URL也可以进入创建机器人应用页面，同样点击确认就可以



整个过程只需要几秒钟。



### 备选方式：手动输入凭证



如果扫码不可用，向导会切换到手动模式：



1. 打开 [飞书开放平台](https://open.feishu.cn/)，创建一个新应用
2. 在 **"凭证与基础信息"** 中，复制 **App ID** 和 **App Secret**
3. 在 **"应用功能"** 中，开启 **"机器人"** 能力
4. 运行 `hermes gateway setup`，选择 Feishu / Lark，按提示输入凭证

### 连接模式



推荐使用 **WebSocket 模式**（默认），不需要公网地址，适合笔记本、私人服务器等场景。



> **飞书 Gateway 文档：** https://hermes-agent.nousresearch.com/docs/user-guide/messaging/feishu



---



## 6. 启动 Gateway 并测试



### 启动方式



```Bash
# 前台运行（调试用）
hermes gateway run

# 安装为后台服务（推荐）
hermes gateway install
hermes gateway start

# 查看状态
hermes gateway status
```



### 测试连通性



1. 在飞书中找到你创建的机器人
2. 发送一条消息：`你好`
3. 如果 Hermes 回复了，说明 Gateway 工作正常

### 排查问题



| 问题 | 解决方案 |
|-|-|
| `lark-oapi not installed` | `pip install lark-oapi` |
| `websockets not installed; websocket mode unavailable` | `pip install websockets` |
| `FEISHU_APP_ID or FEISHU_APP_SECRET not set` | 运行 `hermes gateway setup` 重新配置 |
| 另一个 Hermes 实例已占用同一 app_id | 先停掉另一个 gateway |
| 群聊中机器人不回复 | 确保机器人被 @提及，检查 `FEISHU_ALLOWED_USERS` 白名单 |
| 消息显示为纯文本 | 飞书 API 拒绝了富文本载荷，属正常回退，查看日志了解详情 |



---



## 7. Hermes 调用 Claude Code 的两种模式



Hermes 有两种方式调用 Claude Code，根据任务复杂度选择。用户不需要关心底层细节，但了解两种模式有助于写出更精准的任务描述。



### 模式一：Print 模式（`-p`）— 推荐大多数场景



**特点：** 一次性执行，非交互，自动退出。不需要 PTY，不需要处理对话框。**Print 模式跳过所有交互对话框**（工作区信任、权限确认），适合自动化。



```Bash
claude -p '修复 auth.py 中的空指针异常' --allowedTools 'Read,Edit' --max-turns 10
```



**适用场景：**

- 修 bug、加功能、重构代码
- 代码审查、分析
- 任何不需要多轮对话的任务

**关键参数：**



| 参数 | 说明 |
|-|-|
| `-p '任务描述'` | 非交互模式，执行完自动退出 |
| `--max-turns N` | 限制 Agent 循环次数，防止无限循环 |
| `--allowedTools` | 限制可用工具（如 `Read,Edit`），缩小范围提升安全性 |
| `--output-format json` | 返回结构化 JSON 结果，包含 session_id、耗时、费用等 |
| `--model sonnet` | 指定模型（如 `sonnet`、`opus`、`haiku`） |



### 模式二：交互模式（tmux）— 复杂多轮任务



> **⚠️ tmux 在 Windows 原生环境不可用。** 此模式需要 Linux / macOS / WSL2 环境。Windows 用户请使用 WSL2。



**特点：** 通过 tmux 启动完整的 Claude Code TUI，可以多轮对话、使用斜杠命令（`/compact`、`/review`、`/model` 等）。



```Bash
# 1. 创建 tmux 会话
tmux new-session -d -s claude-work -x 140 -y 40

# 2. 在 tmux 中启动 Claude Code
tmux send-keys -t claude-work 'cd /你的项目目录 && claude' Enter

# 3. 等待启动（3-5 秒），然后发送任务
sleep 5 && tmux send-keys -t claude-work '你的任务描述' Enter

# 4. 监控进度
tmux capture-pane -t claude-work -p -S -50

# 5. 发送后续指令
tmux send-keys -t claude-work '继续补充单元测试' Enter

# 6. 结束会话
tmux send-keys -t claude-work '/exit' Enter
```



**适用场景：**

- 需要多轮迭代的复杂任务（重构→审查→修复→测试）
- 需要使用斜杠命令（`/compact`、`/review`、`/model`）
- 探索性编码

### 两种模式对比



|  | Print 模式 | 交互模式（tmux） |
|-|-|-|
| **复杂度** | 简单 | 较复杂 |
| **适用场景** | 单次任务 | 多轮迭代 |
| **需要 PTY** | 不需要 | 需要（通过 tmux） |
| **对话框处理** | 自动跳过 | 需手动处理 |
| **推荐程度** | ⭐ 首选 | 复杂任务时使用 |



---



## 8. 通过飞书分配编码任务



Gateway 正常运行后，你可以在飞书中直接给 Hermes 发消息分配任务。Hermes 会自动选择合适的模式执行。



### 直接发消息



在飞书聊天中发消息即可，例如：



```Plain Text
用 Claude Code 分析一下这个项目的角色管理模块代码结构
```



```Plain Text
帮我用 claude 看看角色权限保存有没有 bug
```



### 指定使用某种模式



你也可以在消息中暗示或明确指定模式：



**指定 Print 模式（单次任务）：**



```Plain Text
用 claude 的 print 模式修复 auth.py 中的空指针异常
```



**指定交互模式（复杂多轮任务）：**



```Plain Text
打开项目，启动 claude 的交互模式，帮我重构整个认证模块
```



### 工作原理



```Plain Text
你发消息 → 飞书 → Gateway → Hermes Agent
                                    │
                                    ├─ 解析任务
                                    ├─ 加载 claude-code 技能
                                    ├─ 构造 Claude Code 命令
                                    └─ 通过 terminal 工具执行
                                            │
                                            ▼
                                    Claude Code 执行编码任务
                                            │
                                            ▼
                                    Hermes 将结果发回飞书
```



---



## 9. 实战示例：分析代码 Bug



以下是一个完整的使用流程示例。



### 场景



在飞书中给 Hermes 发消息：



> 用 Claude Code 分析一下项目的登录认证模块，看看有没有安全漏洞。



### Hermes 执行流程（Print 模式）



Hermes 收到消息后，内部调用：



```Bash
claude -p '分析登录认证模块代码，检查安全漏洞' --max-turns 10
```



Claude Code 自动读取项目代码、定位问题、返回分析结果，Hermes 将结果发回飞书。



### Hermes 执行流程（交互模式）



如果任务更复杂，Hermes 会使用 tmux：



```Bash
# 1. 创建 tmux 会话
tmux new-session -d -s claude-work -x 140 -y 40

# 2. 启动 Claude Code
tmux send-keys -t claude-work 'cd /你的项目目录 && claude' Enter

# 3. 等待启动后发送任务
sleep 5 && tmux send-keys -t claude-work '分析登录认证模块，检查安全漏洞，然后给出修复建议' Enter

# 4. 等待分析完成（耐心等待，不要急着判定卡住）
sleep 120 && tmux capture-pane -t claude-work -p -S -100

# 5. 将结果返回给用户
```



---



## 10. 常见问题与排查



### Claude Code 相关



| 问题 | 解决方案 |
|-|-|
| `claude` 命令未找到 | 确认已安装 Claude Code CLI，或在 WSL 中使用 `claude.exe` 调用 Windows 侧的版本 |
| 模型响应很慢（1-3分钟无输出） | 使用第三方 API 代理时正常现象，耐心等待 |
| tmux 中模型无响应 | 尝试缩短任务描述，或改用 Print 模式 |
| 信任工作区对话框 | 按 Enter 接受默认选项 |
| 权限对话框卡住 | 先按 Down 再按 Enter |



### 飞书 Gateway 相关



> 飞书 Gateway 的常见问题排查见[第6章](#6-启动-gateway-并测试)，此处不再重复。



### Hermes Agent 相关



| 问题 | 解决方案 |
|-|-|
| 技能不生效 | `hermes skills list` 确认已启用，`hermes skills config` 管理启用/禁用 |
| 模型切换 | `hermes model` 交互式选择 |
| 配置修改不生效 | Gateway 中执行 `/restart`，CLI 重新启动 |
| 查看当前配置 | `hermes config show` |



---



## 附录：关键路径和命令速查



### 路径



| 路径 | 说明 |
|-|-|
| `~/.hermes/config.yaml` | 主配置文件 |
| `~/.hermes/.env` | API 密钥和敏感信息 |
| `~/.hermes/skills/` | 已安装技能 |
| `~/.hermes/sessions/` | 会话记录 |
| `~/.hermes/logs/gateway.log` | Gateway 日志 |



### 常用命令速查



```Bash
# Hermes 基础
hermes                          # 启动交互式聊天
hermes setup                    # 初始化配置向导（推荐）
hermes model                    # 切换模型
hermes doctor                   # 健康检查
hermes config edit              # 编辑配置

# 技能管理
hermes skills list              # 查看已安装技能
hermes skills search <关键词>    # 搜索技能
hermes skills install <ID>      # 安装技能

# Gateway
hermes gateway setup            # 配置消息平台（推荐）
hermes gateway run              # 前台运行
hermes gateway install          # 安装为后台服务
hermes gateway start            # 启动服务
hermes gateway status           # 查看状态
hermes gateway restart          # 重启

# Claude Code
claude --version                # 版本检查
claude auth status              # 认证状态
claude -p '任务' --max-turns 10 # Print 模式执行任务
claude doctor                   # 健康检查
```



---



> **参考链接：**
> 
> - Hermes Agent 官方文档：https://hermes-agent.nousresearch.com/docs/
> - Hermes Agent GitHub：https://github.com/NousResearch/hermes-agent
> - Claude Code CLI 文档：https://code.claude.com/docs/en/cli-reference
> - 飞书开放平台：https://open.feishu.cn/
